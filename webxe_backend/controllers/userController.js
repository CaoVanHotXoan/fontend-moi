import { getPool, sql } from '../config/db.js';
import nodemailer from 'nodemailer';
import { normalizeEmail, takeOtp } from './authController.js';

const mailTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
});
const activeAlertUsers = new Map();

function markAlertUserOnline(userId) {
  activeAlertUsers.set(userId, Date.now());
}

async function markAlertAsNotified(pool, row, userId) {
  await pool.request()
    .input('MaThongBao', sql.Int, row.MaThongBao)
    .input('MaNguoiDung', sql.Int, userId)
    .input('TenXeTimKiem', sql.NVarChar(150), row.TenXeTimKiem)
    .input('TrangThai', sql.NVarChar(50), 'Đã thông báo')
    .input('NgayThongBao', sql.DateTime, new Date())
    .execute('sp_SuaThongBaoCoXe');
}

export async function processVehicleAvailabilityAfterVehicleChange(pool, vehicleId, previousQuantity = null) {
  if (Number(previousQuantity) <= 0) {
    await pool.request()
      .input('vehicleId', sql.Int, Number(vehicleId))
      .query(`
        UPDATE tb
        SET TrangThai = N'Đang chờ', NgayThongBao = NULL
        FROM ThongBaoCoXe tb
        INNER JOIN Xe x ON x.MaXe = @vehicleId
        WHERE tb.TrangThai = N'Đã thông báo'
          AND x.SoLuong > 0
          AND LOWER(LTRIM(RTRIM(x.TenXe))) LIKE '%' + LOWER(LTRIM(RTRIM(tb.TenXeTimKiem))) + '%'
      `);
  }
  const result = await pool.request()
    .input('vehicleId', sql.Int, Number(vehicleId))
    .query(`
      SELECT tb.MaThongBao, tb.MaNguoiDung, tb.TenXeTimKiem, nd.Email, nd.HoTen, x.TenXe, x.Gia
      FROM ThongBaoCoXe tb
      INNER JOIN NguoiDung nd ON nd.MaNguoiDung = tb.MaNguoiDung
      INNER JOIN Xe x ON x.MaXe = @vehicleId
      WHERE x.SoLuong > 0
        AND LOWER(LTRIM(RTRIM(x.TenXe))) LIKE '%' + LOWER(LTRIM(RTRIM(tb.TenXeTimKiem))) + '%'
    `);
  const grouped = new Map();
  for (const row of result.recordset) {
    const rows = grouped.get(row.MaNguoiDung) ?? [];
    rows.push(row);
    grouped.set(row.MaNguoiDung, rows);
  }

  for (const [userId, rows] of grouped) {
    const lastSeen = activeAlertUsers.get(userId) ?? 0;
    if (Date.now() - lastSeen < 30_000) {
      console.log(`[VehicleAlert] Bỏ qua Gmail vì khách hàng ${userId} đang online.`);
      continue;
    }
    const customer = rows[0];
    if (!customer.Email) {
      console.warn(`[VehicleAlert] Khách hàng ${userId} chưa có email.`);
      continue;
    }
    const vehicleRows = rows.map((row) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:700;">${row.TenXe}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#d65335;">${Number(row.Gia).toLocaleString('vi-VN')} VNĐ</td></tr>`).join('');
    await mailTransport.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: customer.Email,
      subject: 'WebXe: Mẫu xe bạn quan tâm đã có hàng',
      text: `Xin chào ${customer.HoTen || 'khách hàng'}, mẫu xe ${rows.map((row) => row.TenXe).join(', ')} hiện đã có hàng.`,
      html: `<div style="margin:0;padding:30px 16px;background:#f4f6f8;font-family:Arial,sans-serif;color:#1f2937;"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;"><div style="padding:24px 28px;background:#182b28;color:#fff;font-size:22px;font-weight:700;">WebXe báo xe có hàng</div><div style="padding:28px;"><p>Xin chào ${customer.HoTen || 'khách hàng'},</p><p>Các mẫu xe bạn quan tâm hiện đã có sẵn:</p><table style="width:100%;border-collapse:collapse;">${vehicleRows}</table></div></div></div>`,
    });
    console.log(`[VehicleAlert] Đã gửi Gmail cho ${customer.Email} sau khi cập nhật xe ${vehicleId}.`);
    for (const row of rows) await markAlertAsNotified(pool, row, userId);
  }
}

export async function getProfile(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(req.user.sub))
      .query(`
         SELECT nd.MaNguoiDung, nd.TenDangNhap, nd.HoTen, nd.Email,
           nd.SoDienThoai, nd.DiaChi, nd.HinhAnh, nd.MaVaiTro, vt.TenVaiTro
        FROM NguoiDung nd
        INNER JOIN VaiTro vt ON vt.MaVaiTro = nd.MaVaiTro
        WHERE nd.MaNguoiDung = @id
      `);

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: 'Unauthorized: user no longer exists.' });
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const address = String(req.body?.address || '').trim();
    const image = String(req.body?.image || '').trim();

    if (!name || !email) {
      return res.status(400).json({ message: 'Họ tên và email là bắt buộc.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    }

    const pool = await getPool();
    const currentResult = await pool.request()
      .input('id', sql.Int, Number(req.user.sub))
      .query('SELECT Email FROM NguoiDung WHERE MaNguoiDung = @id');
    const currentEmail = normalizeEmail(currentResult.recordset[0]?.Email);
    if (!currentResult.recordset[0]) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    if (email !== currentEmail && !takeOtp(email, 'profile_email', otp)) {
      return res.status(400).json({ message: 'Vui lòng nhập đúng OTP đã gửi đến Gmail mới.' });
    }
    const existing = await pool.request()
      .input('email', sql.VarChar(100), email)
      .input('id', sql.Int, Number(req.user.sub))
      .query('SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE Email = @email AND MaNguoiDung <> @id');
    if (existing.recordset[0]) {
      return res.status(409).json({ message: 'Email đã được sử dụng bởi tài khoản khác.' });
    }

    const result = await pool.request()
      .input('id', sql.Int, Number(req.user.sub))
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.VarChar(100), email)
      .input('phone', sql.VarChar(20), phone || null)
      .input('address', sql.NVarChar(300), address || null)
      .input('image', sql.NVarChar(500), image || null)
      .query(`
        UPDATE NguoiDung
        SET HoTen = @name, Email = @email, SoDienThoai = @phone, DiaChi = @address, HinhAnh = @image
        WHERE MaNguoiDung = @id;
        SELECT nd.MaNguoiDung, nd.TenDangNhap, nd.HoTen, nd.Email,
               nd.SoDienThoai, nd.DiaChi, nd.HinhAnh, nd.MaVaiTro, vt.TenVaiTro
        FROM NguoiDung nd
        INNER JOIN VaiTro vt ON vt.MaVaiTro = nd.MaVaiTro
        WHERE nd.MaNguoiDung = @id;
      `);

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    return res.json({ message: 'Cập nhật thông tin thành công.', user });
  } catch (error) {
    return next(error);
  }
}

export async function getVehicleAvailabilityAlerts(req, res, next) {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Chỉ khách hàng mới được dùng chức năng này.' });
    const userId = Number(req.user.sub);
    markAlertUserOnline(userId);
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT MaThongBao, TenXeTimKiem, TrangThai, NgayDangKy, NgayThongBao
        FROM ThongBaoCoXe
        WHERE MaNguoiDung = @userId
        ORDER BY MaThongBao
      `);
    const vehicles = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT DISTINCT x.MaXe, x.TenXe, x.Gia, x.SoLuong
        FROM ThongBaoCoXe tb
        INNER JOIN Xe x ON LOWER(LTRIM(RTRIM(x.TenXe))) LIKE '%' + LOWER(LTRIM(RTRIM(tb.TenXeTimKiem))) + '%'
        WHERE tb.MaNguoiDung = @userId AND x.SoLuong > 0
        ORDER BY x.TenXe
      `);
    return res.json({ alerts: result.recordset, vehicles: vehicles.recordset, hasAvailable: vehicles.recordset.length > 0 });
  } catch (error) {
    return next(error);
  }
}

export async function sendVehicleAvailabilityAlert(req, res, next) {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Chỉ khách hàng mới được dùng chức năng này.' });
    const names = Array.isArray(req.body?.vehicleNames)
      ? [...new Set(req.body.vehicleNames.map((name) => String(name || '').trim()).filter(Boolean))].slice(0, 3)
      : [];
    if (!names.length && req.body?.notify !== true) return res.status(400).json({ message: 'Vui lòng nhập ít nhất một tên xe.' });

    const pool = await getPool();
    const userResult = await pool.request()
      .input('userId', sql.Int, Number(req.user.sub))
      .query('SELECT Email, HoTen FROM NguoiDung WHERE MaNguoiDung = @userId');
    const customer = userResult.recordset[0];
    if (!customer?.Email) return res.status(400).json({ message: 'Tài khoản chưa có email để nhận thông báo.' });

    const userId = Number(req.user.sub);
    if (req.body?.notify === true) {
      // pagehide/logout tells the server that this customer is no longer online.
      activeAlertUsers.delete(userId);
    }
    const existingResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT MaThongBao, TenXeTimKiem, TrangThai FROM ThongBaoCoXe WHERE MaNguoiDung = @userId');
    const existingByName = new Map(existingResult.recordset.map((row) => [row.TenXeTimKiem.trim().toLowerCase(), row]));
    if (names.length) {
      const requestedNames = new Set(names.map((name) => name.toLowerCase()));
      for (const row of existingResult.recordset) {
        if (!requestedNames.has(row.TenXeTimKiem.trim().toLowerCase())) {
          await pool.request()
            .input('MaThongBao', sql.Int, row.MaThongBao)
            .input('MaNguoiDung', sql.Int, userId)
            .execute('sp_XoaThongBaoCoXe');
        }
      }
      for (const name of names) {
        const current = existingByName.get(name.toLowerCase());
        if (current) {
          await pool.request()
            .input('MaThongBao', sql.Int, current.MaThongBao)
            .input('MaNguoiDung', sql.Int, userId)
            .input('TenXeTimKiem', sql.NVarChar(150), name)
            .input('TrangThai', sql.NVarChar(50), 'Đang chờ')
            .input('NgayThongBao', sql.DateTime, null)
            .execute('sp_SuaThongBaoCoXe');
        } else {
          await pool.request()
            .input('MaNguoiDung', sql.Int, userId)
            .input('TenXeTimKiem', sql.NVarChar(150), name)
            .execute('sp_ThemThongBaoCoXe');
        }
      }
    }

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT DISTINCT x.MaXe, x.TenXe, x.Gia, x.SoLuong
        FROM ThongBaoCoXe tb
        INNER JOIN Xe x ON LOWER(LTRIM(RTRIM(x.TenXe))) LIKE '%' + LOWER(LTRIM(RTRIM(tb.TenXeTimKiem))) + '%'
        WHERE tb.MaNguoiDung = @userId AND tb.TrangThai = N'Đang chờ' AND x.SoLuong > 0
        ORDER BY x.TenXe
      `);
    const vehicles = result.recordset;
    if (req.body?.notify !== true) {
      return res.json({
        message: vehicles.length ? 'Đã lưu. Xe phù hợp đang có hàng.' : 'Đã lưu danh sách xe quan tâm.',
        vehicles,
      });
    }
    if (!vehicles.length) return res.json({ message: 'Chưa có xe phù hợp để gửi thông báo.', vehicles: [] });

    const vehicleRows = vehicles.map((vehicle) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:700;">${vehicle.TenXe}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#d65335;">${Number(vehicle.Gia).toLocaleString('vi-VN')} VNĐ</td></tr>`).join('');
    await mailTransport.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: customer.Email,
      subject: 'WebXe: Mẫu xe bạn quan tâm đã có hàng',
      text: `Xin chào ${customer.HoTen || 'khách hàng'}, các mẫu xe sau hiện đang có hàng: ${vehicles.map((vehicle) => vehicle.TenXe).join(', ')}.`,
      html: `<div style="margin:0;padding:30px 16px;background:#f4f6f8;font-family:Arial,sans-serif;color:#1f2937;"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;"><div style="padding:24px 28px;background:#182b28;color:#fff;font-size:22px;font-weight:700;">WebXe báo xe có hàng</div><div style="padding:28px;"><p>Xin chào ${customer.HoTen || 'khách hàng'},</p><p>Các mẫu xe bạn quan tâm hiện đang có sẵn:</p><table style="width:100%;border-collapse:collapse;">${vehicleRows}</table><p style="margin-top:24px;color:#6b7280;font-size:13px;">Hãy truy cập WebXe để xem thông tin chi tiết và liên hệ cửa hàng.</p></div></div></div>`,
    });
    const notifiedAt = new Date();
    const notifiedRows = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT DISTINCT tb.MaThongBao, tb.TenXeTimKiem
        FROM ThongBaoCoXe tb
        INNER JOIN Xe x ON LOWER(LTRIM(RTRIM(x.TenXe))) LIKE '%' + LOWER(LTRIM(RTRIM(tb.TenXeTimKiem))) + '%'
        WHERE tb.MaNguoiDung = @userId AND tb.TrangThai = N'Đang chờ' AND x.SoLuong > 0
      `);
    for (const row of notifiedRows.recordset) {
      await pool.request()
        .input('MaThongBao', sql.Int, row.MaThongBao)
        .input('MaNguoiDung', sql.Int, userId)
        .input('TenXeTimKiem', sql.NVarChar(150), row.TenXeTimKiem)
        .input('TrangThai', sql.NVarChar(50), 'Đã thông báo')
        .input('NgayThongBao', sql.DateTime, notifiedAt)
        .execute('sp_SuaThongBaoCoXe');
    }
    return res.json({ message: `Đã gửi thông báo đến ${customer.Email}.`, vehicles });
  } catch (error) {
    return next(error);
  }
}
