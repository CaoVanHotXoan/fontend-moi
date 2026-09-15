import { getPool, sql } from '../config/db.js';
import nodemailer from 'nodemailer';
import 'dotenv/config';

let groqKeyIndex = 0;
const customerPresence = new Map();
const onlineWindowMs = 20000;
const mailTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
});

if (process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASSWORD) {
  void mailTransport.verify()
    .then(() => console.log('[Mail] SMTP Gmail đã sẵn sàng.'))
    .catch((error) => console.error('[Mail] SMTP Gmail không xác thực được:', error.message));
}

async function notifyAdminsOfCustomerMessage(pool, conversationId, customerId, text) {
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    console.error('[Chat] Thiếu MAIL_HOST, MAIL_USER hoặc MAIL_PASSWORD; bỏ qua email thông báo.');
    return;
  }

  const result = await pool.request()
    .input('customerId', sql.Int, customerId)
    .query(`
      SELECT kh.HoTen AS TenKhachHang
      FROM NguoiDung kh
      WHERE kh.MaNguoiDung = @customerId
    `);

  const notification = result.recordset[0];
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'qlxebaton@gmail.com';

  await mailTransport.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: recipient,
    subject: `WebXe: Tin nhắn mới từ ${notification.TenKhachHang || 'khách hàng'}`,
    text: `${notification.TenKhachHang || 'Khách hàng'} vừa gửi tin nhắn mới:\n\n${text}\n\nXem và phản hồi tại: ${process.env.CLIENT_URL || 'http://localhost:3000'}/ChamSocKH/ChamSocKH`,
  });
  console.log(`[Chat] Đã gửi email thông báo đến ${recipient} (conversation ${conversationId}).`);
}

function getGroqKeys() {
  return Object.entries(process.env)
    .filter(([name, value]) => /^GROQ_API_KEY\d*$/.test(name) && value)
    .sort(([first], [second]) => {
      const firstNumber = first === 'GROQ_API_KEY' ? 0 : Number(first.replace('GROQ_API_KEY', ''));
      const secondNumber = second === 'GROQ_API_KEY' ? 0 : Number(second.replace('GROQ_API_KEY', ''));
      return firstNumber - secondNumber;
    })
    .map(([, value]) => value.trim())
    .filter(Boolean);
}

function shouldRotateGroqKey(response) {
  return response.status === 401 || response.status === 429 || response.status >= 500;
}

async function getVehicleContext() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT x.MaXe, x.TenXe, h.TenHang, l.TenLoai, x.Gia, x.NamSanXuat,
         x.MauSac, x.MoTa, x.SoLuong,
         (SELECT TOP 1 ha.DuongDanAnh
          FROM dbo.HinhAnhXe ha
          WHERE ha.MaXe = x.MaXe
          ORDER BY ha.LaAnhChinh DESC, ha.MaHinhAnh ASC) AS AnhChinh
    FROM dbo.Xe x
    LEFT JOIN dbo.HangXe h ON h.MaHang = x.MaHang
    LEFT JOIN dbo.LoaiXe l ON l.MaLoai = x.MaLoai
    ORDER BY x.MaXe DESC
  `);

  const vehicles = result.recordset.map((vehicle) => ({
    id: vehicle.MaXe,
    tenXe: vehicle.TenXe,
    hang: vehicle.TenHang,
    loai: vehicle.TenLoai,
    gia: vehicle.Gia,
    namSanXuat: vehicle.NamSanXuat,
    mauSac: vehicle.MauSac,
    moTa: vehicle.MoTa,
    soLuong: vehicle.SoLuong,
    anhChinh: vehicle.AnhChinh,
  }));

  return {
    text: vehicles.map((vehicle) => JSON.stringify(vehicle)).join('\n'),
    vehicles,
  };
}

function findVehicleIdsInAnswer(answer, vehicles) {
  const normalizedAnswer = answer.toLocaleLowerCase('vi-VN');
  return vehicles
    .filter((vehicle) => vehicle.tenXe && normalizedAnswer.includes(vehicle.tenXe.toLocaleLowerCase('vi-VN')))
    .sort((first, second) => second.tenXe.length - first.tenXe.length)
    .map((vehicle) => vehicle.id);
}

export async function chatWithAssistant(req, res, next) {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message || message.length > 4000) {
      return res.status(400).json({ message: 'Nội dung câu hỏi là bắt buộc.' });
    }

    const keys = getGroqKeys();
    if (!keys.length) return res.status(503).json({ message: 'Chatbot chưa được cấu hình API key.' });

    let vehicleContext;
    try {
      vehicleContext = await getVehicleContext();
    } catch (error) {
      console.error('[Chatbot] Không đọc được dữ liệu xe:', error);
      return res.status(503).json({ message: 'Không đọc được dữ liệu xe lúc này.' });
    }

    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const messages = [
      {
        role: 'system',
        content: `Bạn là "Tư Vấn Viên AI" của WebXe.
      Văn phong lịch sự, hào hứng, am hiểu kỹ thuật xe nhưng dễ hiểu; xưng hô "Em" với "Anh/Chị".
      Mỗi câu trả lời tối đa 3-4 dòng, tuyệt đối không viết đoạn dài.
      Chỉ trả lời thông tin xe có trong dữ liệu. Khi nhắc tên xe, bắt buộc dùng đúng tên trong dữ liệu và cú pháp ảnh Markdown: ![Tên xe](ảnh chính xe).
      Mọi câu trả lời phải kết thúc bằng một câu hỏi gợi ý hành động tiếp theo.
      Khi giới thiệu một xe, trả lời theo 4 dòng: ảnh + tên xe; giá VNĐ + Còn hàng/Hết hàng; 2-3 thông số có trong dữ liệu; lời mời xem chi tiết.
      Khi khách chê giá cao, hãy gợi ý các xe giá thấp hơn cùng hãng hoặc cùng loại nếu có trong dữ liệu.
      Nếu thông tin không có trong CSDL, trả lời đúng: "Dạ hiện thông số này em cần xác nhận lại với bộ phận kỹ thuật. Anh/Chị có thể đăng nhập nhân viên Sales liên hệ hỗ trợ trực tiếp nhé?"
      Nếu hỏi ngoài chủ đề xe, trả lời đúng: "Dạ em chỉ hỗ trợ thông tin về các mẫu xe tại WebXe. Anh/Chị muốn tham khảo mẫu xe nào ạ?"
      Không tự bịa giá, năm, tình trạng, thông số hoặc ảnh. Dữ liệu ảnh chính nằm ở trường anhChinh.

DỮ LIỆU XE HIỆN TẠI (mỗi dòng là một JSON):
      ${vehicleContext.text || 'Chưa có dữ liệu xe.'}`,
      },
      ...history.slice(-10).filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string'),
      { role: 'user', content: message },
    ];

    let lastError;
    for (let attempt = 0; attempt < keys.length; attempt += 1) {
      const keyIndex = (groqKeyIndex + attempt) % keys.length;
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${keys[keyIndex]}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b', messages, temperature: 0.4, max_tokens: 700 }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          groqKeyIndex = (keyIndex + 1) % keys.length;
          const assistantMessage = data.choices?.[0]?.message?.content || 'Trợ lý chưa có câu trả lời.';
          const vehicleIds = findVehicleIdsInAnswer(assistantMessage, vehicleContext.vehicles);
          const vehicleNames = vehicleIds.map((vehicleId) => vehicleContext.vehicles.find((vehicle) => vehicle.id === vehicleId)?.tenXe).filter(Boolean);
          const vehicleCards = vehicleIds.map((vehicleId) => {
            const vehicle = vehicleContext.vehicles.find((item) => item.id === vehicleId);
            if (!vehicle) return null;
            return {
              id: vehicle.id,
              name: vehicle.tenXe,
              image: vehicle.anhChinh || '',
              price: Number(vehicle.gia) || 0,
              year: vehicle.namSanXuat || null,
              color: vehicle.mauSac || null,
              quantity: Number(vehicle.soLuong) || 0,
            };
          }).filter(Boolean);
          return res.json({ message: assistantMessage, vehicleIds, vehicleNames, vehicleCards, vehicleId: vehicleIds[0] || null });
        }
        lastError = new Error(data.error?.message || `Groq trả về HTTP ${response.status}`);
        if (!shouldRotateGroqKey(response)) break;
      } catch (error) {
        lastError = error;
      }
    }

    groqKeyIndex = (groqKeyIndex + 1) % keys.length;
    return res.status(502).json({ message: lastError?.message || 'Không thể kết nối trợ lý AI.' });
  } catch (error) {
    return next(error);
  }
}

async function getConversationForUser(pool, conversationId, userId, isAdmin) {
  const request = pool.request().input('conversationId', sql.Int, conversationId);
  const condition = isAdmin ? '' : 'AND c.MaKhachHang = @userId';
  if (!isAdmin) request.input('userId', sql.Int, userId);
  const result = await request.query(`
    SELECT c.MaCuocHoiThoai, c.MaKhachHang, c.MaNhanVien, c.TrangThai, c.NgayTao
    FROM CuocHoiThoai c
    WHERE c.MaCuocHoiThoai = @conversationId ${condition}
  `);
  return result.recordset[0];
}

async function getMessages(pool, conversationId) {
  const result = await pool.request()
    .input('conversationId', sql.Int, conversationId)
    .query(`
      SELECT tn.MaTinNhan, tn.MaCuocHoiThoai, tn.MaNguoiGui, nd.HoTen, nd.MaVaiTro,
             tn.NoiDung,
             CONVERT(varchar(19), DATEADD(HOUR, 7, tn.ThoiGian), 120) AS ThoiGian,
             tn.DaXem
      FROM TinNhan tn
      INNER JOIN NguoiDung nd ON nd.MaNguoiDung = tn.MaNguoiGui
      WHERE tn.MaCuocHoiThoai = @conversationId
      ORDER BY tn.ThoiGian ASC, tn.MaTinNhan ASC
    `);
  return result.recordset;
}

function isCustomerOnline(customerId) {
  return Date.now() - (customerPresence.get(customerId) || 0) < onlineWindowMs;
}

export function updateCustomerPresence(req, res) {
  const customerId = Number(req.user.sub);
  if (req.body?.online === false) customerPresence.delete(customerId);
  else customerPresence.set(customerId, Date.now());
  return res.json({ online: req.body?.online !== false });
}

export async function getCustomerConversation(req, res, next) {
  try {
    const userId = Number(req.user.sub);
    const pool = await getPool();
    let conversation = (await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT TOP 1 MaCuocHoiThoai, MaKhachHang, MaNhanVien, TrangThai, NgayTao
        FROM CuocHoiThoai
        WHERE MaKhachHang = @userId AND TrangThai <> N'Đã đóng'
        ORDER BY MaCuocHoiThoai DESC
      `)).recordset[0];

    if (!conversation) {
      const result = await pool.request()
        .input('MaKhachHang', sql.Int, userId)
        .execute('sp_ThemCuocHoiThoai');
      conversation = result.recordset[0];
      conversation = {
        ...conversation,
        MaKhachHang: userId,
        MaNhanVien: null,
        TrangThai: 'Đang chờ',
      };
    }

    return res.json({ conversation, messages: await getMessages(pool, conversation.MaCuocHoiThoai) });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminConversations(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT c.MaCuocHoiThoai, c.MaKhachHang, c.MaNhanVien, c.TrangThai, c.NgayTao,
             kh.HoTen AS TenKhachHang, kh.Email,
             nv.HoTen AS TenNhanVien,
             lastMessage.NoiDung AS TinNhanCuoi,
             CONVERT(varchar(19), DATEADD(HOUR, 7, lastMessage.ThoiGian), 120) AS ThoiGianTinNhanCuoi,
             (SELECT COUNT(*) FROM TinNhan unread WHERE unread.MaCuocHoiThoai = c.MaCuocHoiThoai
               AND unread.MaNguoiGui = c.MaKhachHang AND unread.DaXem = 0) AS TinChuaXem
      FROM CuocHoiThoai c
      INNER JOIN NguoiDung kh ON kh.MaNguoiDung = c.MaKhachHang
      LEFT JOIN NguoiDung nv ON nv.MaNguoiDung = c.MaNhanVien
      OUTER APPLY (
        SELECT TOP 1 tn.NoiDung, tn.ThoiGian
        FROM TinNhan tn
        WHERE tn.MaCuocHoiThoai = c.MaCuocHoiThoai
        ORDER BY tn.ThoiGian DESC, tn.MaTinNhan DESC
      ) lastMessage
      ORDER BY COALESCE(lastMessage.ThoiGian, c.NgayTao) DESC
    `);
    return res.json({ conversations: result.recordset.map((conversation) => ({
      ...conversation,
      DangHoatDong: isCustomerOnline(conversation.MaKhachHang),
    })) });
  } catch (error) {
    return next(error);
  }
}

export async function getConversationMessages(req, res, next) {
  try {
    const conversationId = Number(req.params.conversationId);
    if (!Number.isInteger(conversationId)) return res.status(400).json({ message: 'Mã cuộc hội thoại không hợp lệ.' });
    const pool = await getPool();
    const conversation = await getConversationForUser(pool, conversationId, Number(req.user.sub), req.user.role === 'admin');
    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
    return res.json({ conversation, messages: await getMessages(pool, conversationId) });
  } catch (error) {
    return next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const conversationId = Number(req.body?.conversationId);
    const text = String(req.body?.message || '').trim();
    if (!Number.isInteger(conversationId) || !text || text.length > 4000) {
      return res.status(400).json({ message: 'Cuộc hội thoại và nội dung tin nhắn là bắt buộc.' });
    }

    const userId = Number(req.user.sub);
    const isAdmin = req.user.role === 'admin';
    const pool = await getPool();
    const conversation = await getConversationForUser(pool, conversationId, userId, isAdmin);
    if (!conversation) return res.status(404).json({ message: 'Bạn không có quyền truy cập cuộc hội thoại này.' });

    if (isAdmin && !conversation.MaNhanVien) {
      await pool.request()
        .input('MaCuocHoiThoai', sql.Int, conversationId)
        .input('MaNhanVien', sql.Int, userId)
        .execute('sp_NhanCuocHoiThoai');
    }

    const result = await pool.request()
      .input('MaCuocHoiThoai', sql.Int, conversationId)
      .input('MaNguoiGui', sql.Int, userId)
      .input('NoiDung', sql.NVarChar(sql.MAX), text)
      .execute('sp_ThemTinNhan');

    if (!isAdmin) {
      void notifyAdminsOfCustomerMessage(pool, conversationId, userId, text)
        .catch((error) => console.error('[Chat] Không gửi được email thông báo Admin:', error));
    }

    return res.status(201).json({ message: 'Đã gửi tin nhắn.', messageId: result.recordset[0]?.MaTinNhan });
  } catch (error) {
    return next(error);
  }
}

export async function markConversationRead(req, res, next) {
  try {
    const conversationId = Number(req.params.conversationId);
    const userId = Number(req.user.sub);
    const pool = await getPool();
    const conversation = await getConversationForUser(pool, conversationId, userId, req.user.role === 'admin');
    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
    await pool.request()
      .input('MaCuocHoiThoai', sql.Int, conversationId)
      .input('MaNguoiXem', sql.Int, userId)
      .execute('sp_DanhDauTinNhanDaXem');
    return res.json({ message: 'Đã đánh dấu tin nhắn.' });
  } catch (error) {
    return next(error);
  }
}
