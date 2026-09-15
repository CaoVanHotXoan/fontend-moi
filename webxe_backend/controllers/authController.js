import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { getPool, sql } from '../config/db.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 3600000,
  path: '/'
};

const otpStore = new Map();
const otpLifetimeMs = Number(process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000;
const mailHost = String(process.env.MAIL_HOST || 'smtp.gmail.com').trim();
const mailPort = Number(process.env.MAIL_PORT || 587);
const mailUser = String(process.env.MAIL_USER || process.env.GMAIL_USER || '').trim();
const mailFrom = String(process.env.MAIL_FROM || mailUser).trim();
const mailPassword = String(process.env.MAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD || '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
  .replace(/\s+/g, '');
console.log(`[Mail] provider=smtp; host=${mailHost}; port=${mailPort}; from=${mailFrom}`);

function createMailTransport() {
  return nodemailer.createTransport({
    host: mailHost,
    family: 4,
    port: mailPort,
    secure: mailPort === 465,
    auth: { user: mailUser, pass: mailPassword },
    requireTLS: mailPort === 587,
    tls: { minVersion: 'TLSv1.2' },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtp(email, purpose) {
  if (!mailUser || !mailPassword) {
    throw new Error('Thiếu MAIL_USER hoặc MAIL_PASSWORD trên backend.');
  }
  const otp = createOtp();
  const expirationMinutes = process.env.OTP_EXPIRE_MINUTES || 10;
  const isRegistration = purpose === 'register';
  const isProfileEmail = purpose === 'profile_email';
  const title = isRegistration
    ? 'Xác nhận đăng ký tài khoản'
    : isProfileEmail ? 'Xác nhận email hồ sơ' : 'Xác nhận đổi mật khẩu';
  const text = `Mã xác nhận WebXe của bạn là ${otp}. Mã có hiệu lực trong ${expirationMinutes} phút. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.`;
  const subject = isRegistration
    ? 'Mã OTP đăng ký tài khoản WebXe'
    : isProfileEmail ? 'Mã OTP xác nhận email WebXe' : 'Mã OTP đổi mật khẩu WebXe';
  const html = `
      <div style="margin:0;background:#f4f6f8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,.08);">
          <div style="padding:28px 32px;background:#182b28;color:#ffffff;"><div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#f4bd52;">WEBXE</div><div style="margin-top:10px;font-size:24px;font-weight:700;line-height:1.25;">${title}</div></div>
          <div style="padding:32px;"><p>Xin chào,</p><p>Vui lòng nhập mã bên dưới để tiếp tục.</p><div style="margin:26px 0;padding:20px;text-align:center;border:1px solid #f6dca5;border-radius:14px;background:#fffaf0;"><div style="color:#8a6a28;font-size:11px;font-weight:700;letter-spacing:1.5px;">MÃ XÁC NHẬN</div><div style="color:#d65335;font-size:34px;font-weight:800;letter-spacing:9px;line-height:1;">${otp}</div></div><p>Mã có hiệu lực trong <strong>${expirationMinutes} phút</strong>.</p></div>
          <div style="padding:18px 32px;border-top:1px solid #eef0f2;color:#9ca3af;font-size:11px;">Email tự động từ WebXe. Vui lòng không trả lời email này.</div>
        </div>
      </div>`;

  try {
    await createMailTransport().sendMail({ from: mailFrom, to: email, subject, text, html });
  } catch (error) {
    console.error(`[Mail] SMTP port ${mailPort} gửi OTP thất bại:`, error.message);
    throw new Error(`Không thể gửi OTP qua Gmail SMTP ${mailPort}: ${error.message}`);
  }
  otpStore.set(`${purpose}:${email}`, { otp, expiresAt: Date.now() + otpLifetimeMs });
}

async function notifyAdminOfRegistrationEmailFailure(email, error) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'qlxebaton@gmail.com';
  try {
    await createMailTransport().sendMail({
      from: mailFrom,
      to: adminEmail,
      subject: 'WebXe: Không gửi được OTP đăng ký',
      text: `WebXe không gửi được mã OTP đăng ký đến địa chỉ: ${email}\n\nLỗi SMTP: ${error.message}`,
    });
    console.log(`[Mail] Đã báo lỗi gửi OTP đăng ký cho Admin: ${adminEmail}.`);
  } catch (adminError) {
    console.error('[Mail] Không gửi được thông báo lỗi OTP cho Admin:', adminError.message);
  }
}

function takeOtp(email, purpose, inputOtp) {
  const key = `${purpose}:${email}`;
  const saved = otpStore.get(key);
  if (!saved || saved.expiresAt < Date.now() || saved.otp !== String(inputOtp || '').trim()) {
    return false;
  }
  otpStore.delete(key);
  return true;
}

export { normalizeEmail, sendOtp, takeOtp };

export async function requestProfileEmailOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!/^\S+@gmail\.com$/i.test(email)) {
      return res.status(400).json({ message: 'Email mới phải là địa chỉ Gmail hợp lệ.' });
    }
    const pool = await getPool();
    const existing = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query('SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE Email = @email');
    if (existing.recordset[0]) return res.status(409).json({ message: 'Email đã được sử dụng bởi tài khoản khác.' });
    await sendOtp(email, 'profile_email');
    return res.json({ message: 'Mã OTP đã được gửi đến Gmail mới của bạn.' });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { tenDangNhap, email, password } = req.body ?? {};
    const loginName = String(tenDangNhap || email || '').trim();

    if (!loginName || typeof password !== 'string') {
      return res.status(400).json({ message: 'tenDangNhap/email và password là bắt buộc.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('loginName', sql.VarChar(100), loginName)
      .query(`
        SELECT TOP 1 nd.MaNguoiDung, nd.TenDangNhap, nd.MatKhau, nd.HoTen,
               nd.Email, nd.SoDienThoai, nd.HinhAnh, nd.MaVaiTro, vt.TenVaiTro
        FROM NguoiDung nd
        LEFT JOIN VaiTro vt ON vt.MaVaiTro = nd.MaVaiTro
        WHERE LOWER(LTRIM(RTRIM(nd.TenDangNhap))) = LOWER(LTRIM(RTRIM(@loginName)))
           OR LOWER(LTRIM(RTRIM(nd.Email))) = LOWER(LTRIM(RTRIM(@loginName)))
      `);

    const user = result.recordset[0];
    const passwordHash = user?.MatKhau;
    const isBcryptHash = typeof passwordHash === 'string' && /^\$2[aby]\$\d{2}\$/.test(passwordHash);
    const passwordMatches = Boolean(user && typeof passwordHash === 'string' && (
      isBcryptHash ? await bcrypt.compare(password, passwordHash) : password === passwordHash
    ));
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    if (!isBcryptHash) {
      const upgradedPassword = await bcrypt.hash(password, 12);
      await pool.request()
        .input('userId', sql.Int, user.MaNguoiDung)
        .input('password', sql.VarChar(255), upgradedPassword)
        .query('UPDATE NguoiDung SET MatKhau = @password WHERE MaNguoiDung = @userId');
    }

    const role = user.TenVaiTro?.toLowerCase() === 'admin' || user.MaVaiTro === 1 ? 'admin' : 'user';
    const token = jwt.sign(
      { sub: user.MaNguoiDung, username: user.TenDangNhap, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.cookie('token', token, cookieOptions);
    return res.json({
      message: 'Đăng nhập thành công.',
      token,
      user: { id: user.MaNguoiDung, roleId: user.MaVaiTro, username: user.TenDangNhap, name: user.HoTen, email: user.Email, phone: user.SoDienThoai, image: user.HinhAnh, role }
    });
  } catch (error) {
    return next(error);
  }
}

export async function requestRegisterOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const username = String(req.body?.username || '').trim();
    const fullName = String(req.body?.fullName || '').trim();
    if (!/^\S+@gmail\.com$/i.test(email) || !username || !fullName) {
      return res.status(400).json({ message: 'Email Gmail, tên đăng nhập và họ tên là bắt buộc.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .input('email', sql.VarChar(100), email)
      .query('SELECT TOP 1 TenDangNhap, Email FROM NguoiDung WHERE TenDangNhap = @username OR Email = @email');
    if (result.recordset[0]) {
      return res.status(409).json({ message: 'Tên đăng nhập hoặc email đã được sử dụng.' });
    }

    try {
      await sendOtp(email, 'register');
    } catch (error) {
      console.error('[Mail] Đăng ký OTP thất bại:', error.message);
      void notifyAdminOfRegistrationEmailFailure(email, error);
      return res.status(422).json({
        message: `Không thể gửi OTP: ${error.message}`,
      });
    }
    return res.json({ message: 'Mã OTP đã được gửi đến Gmail của bạn.' });
  } catch (error) {
    return next(error);
  }
}

export async function verifyRegister(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = req.body?.otp;
    const username = String(req.body?.username || '').trim();
    const fullName = String(req.body?.fullName || '').trim();
    const password = req.body?.password;
    if (!takeOtp(email, 'register', otp)) return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    if (!username || !fullName || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Thông tin đăng ký không hợp lệ.' });
    }

    const pool = await getPool();
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.request()
      .input('roleId', sql.Int, 2)
      .input('username', sql.VarChar(50), username)
      .input('password', sql.VarChar(255), passwordHash)
      .input('fullName', sql.NVarChar(100), fullName)
      .input('email', sql.VarChar(100), email)
      .query('INSERT INTO NguoiDung (MaVaiTro, TenDangNhap, MatKhau, HoTen, Email) VALUES (@roleId, @username, @password, @fullName, @email)');
    return res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (error) {
    return next(error);
  }
}

export async function requestForgotPasswordOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!/^\S+@gmail\.com$/i.test(email)) return res.status(400).json({ message: 'Vui lòng nhập địa chỉ Gmail hợp lệ.' });
    const pool = await getPool();
    const result = await pool.request().input('email', sql.VarChar(100), email)
      .query('SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE Email = @email');
    if (!result.recordset[0]) return res.status(404).json({ message: 'Email chưa được đăng ký.' });
    await sendOtp(email, 'forgot_password');
    return res.json({ message: 'Mã OTP đổi mật khẩu đã được gửi đến Gmail của bạn.' });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const newPassword = req.body?.newPassword;
    if (!takeOtp(email, 'forgot_password', req.body?.otp)) return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    if (typeof newPassword !== 'string' || newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const result = await (await getPool()).request()
      .input('email', sql.VarChar(100), email)
      .input('password', sql.VarChar(255), passwordHash)
      .query('UPDATE NguoiDung SET MatKhau = @password WHERE Email = @email');
    if (!result.rowsAffected[0]) return res.status(404).json({ message: 'Email chưa được đăng ký.' });
    return res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    return next(error);
  }
}

export function logout(req, res) {
  return res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
    .json({ message: 'Đăng xuất thành công.' });
}
