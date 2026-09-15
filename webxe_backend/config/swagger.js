import swaggerJSDoc from 'swagger-jsdoc';

const procedureNames = [
  'sp_ThemVaiTro', 'sp_SuaVaiTro', 'sp_XoaVaiTro', 'sp_ThemNguoiDung', 'sp_SuaNguoiDung', 'sp_XoaNguoiDung',
  'sp_ThemHangXe', 'sp_SuaHangXe', 'sp_XoaHangXe', 'sp_ThemLoaiXe', 'sp_SuaLoaiXe', 'sp_XoaLoaiXe',
  'sp_ThemXe', 'sp_SuaXe', 'sp_XoaXe', 'sp_ThemHinhAnhXe', 'sp_SuaHinhAnhXe', 'sp_XoaHinhAnhXe',
  'sp_ThemGioHang', 'sp_SuaGioHang', 'sp_XoaGioHang', 'sp_ThemChiTietGioHang', 'sp_SuaChiTietGioHang', 'sp_XoaChiTietGioHang',
  'sp_ThemDonHang', 'sp_SuaDonHang', 'sp_XoaDonHang', 'sp_ThemChiTietDonHang', 'sp_SuaChiTietDonHang', 'sp_XoaChiTietDonHang',
  'sp_ThemDanhMucTinTuc', 'sp_SuaDanhMucTinTuc', 'sp_XoaDanhMucTinTuc', 'sp_ThemTinTuc', 'sp_SuaTinTuc', 'sp_XoaTinTuc'
];

const swaggerDefinition = {
  openapi: '3.0.3',
  info: { title: 'WebXe Backend API', version: '1.0.0', description: 'API WebXe với JWT HttpOnly Cookie và SQL Server Stored Procedures.' },
  servers: [{ url: 'http://localhost:5000', description: 'Local server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'JWT nhận từ response /api/auth/login. Chỉ cần dán token, không thêm chữ Bearer.' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token', description: 'JWT HttpOnly cookie dùng tự động trên trình duyệt.' }
    }
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/api/health/db': {
      get: {
        tags: ['System'], summary: 'Kiểm tra kết nối SQL Server',
        responses: { 200: { description: 'Kết nối database thành công' }, 500: { description: 'Không kết nối được database' } }
      }
    },
    '/api/admin/procedures/{procedureName}': {
      post: {
        tags: ['Stored Procedures'], summary: 'Gọi một Stored Procedure trong ThuTuc.sql', security: [{ cookieAuth: [] }],
        parameters: [{ name: 'procedureName', in: 'path', required: true, schema: { type: 'string', enum: procedureNames } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: true, example: { TenHang: 'Toyota' } } } } },
        responses: { 200: { description: 'Thực thi thành công' }, 400: { description: 'Dữ liệu không hợp lệ' }, 401: { description: 'Chưa xác thực' }, 403: { description: 'Không có quyền admin' } }
      }
    }
  }
};

export const swaggerSpec = swaggerJSDoc({ definition: swaggerDefinition, apis: ['./routes/*.js'] });
