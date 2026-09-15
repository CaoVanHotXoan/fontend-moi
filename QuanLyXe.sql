/*
Bảng:
1. VaiTro
2. NguoiDung
3. HangXe
4. LoaiXe
5. Xe
6. GioHang
7. ChiTietGioHang
8. DonHang
9. ChiTietDonHang
10. HinhAnhXe
11. MaXacNhan
12. DanhMucTinTuc
13. TinTuc
14. CuocHoiThoai
15. TinNhan
16. ThongBaoCoXe
*/
/* =========================================================
   1. VAI TRÒ
   ========================================================= */

CREATE TABLE VaiTro
(
    MaVaiTro INT IDENTITY(1,1) PRIMARY KEY,

    TenVaiTro NVARCHAR(50) NOT NULL UNIQUE
);
GO


/* =========================================================
   2. NGƯỜI DÙNG
   Tài khoản đăng nhập
   ========================================================= */

CREATE TABLE NguoiDung
(
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,

    MaVaiTro INT NOT NULL,

    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,

    MatKhau VARCHAR(255) NOT NULL,

    HoTen NVARCHAR(100) NOT NULL,

    Email VARCHAR(100),

    SoDienThoai VARCHAR(20),

    HinhAnh NVARCHAR(500),

    FOREIGN KEY (MaVaiTro)
        REFERENCES VaiTro(MaVaiTro)
);
GO

IF COL_LENGTH('NguoiDung', 'DiaChi') IS NULL
BEGIN
    ALTER TABLE NguoiDung ADD DiaChi NVARCHAR(300) NULL;
END;
GO

-- =======
ALTER TABLE NguoiDung
ALTER COLUMN Email VARCHAR(100) NOT NULL;

CREATE UNIQUE INDEX UX_NguoiDung_Email
ON NguoiDung(Email);

/* =========================================================
   3. HÃNG XE
   ========================================================= */

CREATE TABLE HangXe
(
    MaHang INT IDENTITY(1,1) PRIMARY KEY,

    TenHang NVARCHAR(100) NOT NULL UNIQUE,

    Logo NVARCHAR(500)
);
GO


/* =========================================================
   4. LOẠI XE
   ========================================================= */

CREATE TABLE LoaiXe
(
    MaLoai INT IDENTITY(1,1) PRIMARY KEY,

    TenLoai NVARCHAR(100) NOT NULL UNIQUE
);
GO


/* =========================================================
   5. XE
   ========================================================= */

CREATE TABLE Xe
(
    MaXe INT IDENTITY(1,1) PRIMARY KEY,

    MaHang INT NOT NULL,

    MaLoai INT NOT NULL,

    TenXe NVARCHAR(150) NOT NULL,

    Gia DECIMAL(18,2) NOT NULL,

    NamSanXuat INT,

    MauSac NVARCHAR(100),

    MoTa NVARCHAR(MAX),

    SoLuong INT NOT NULL DEFAULT 0,

    FOREIGN KEY (MaHang)
        REFERENCES HangXe(MaHang),

    FOREIGN KEY (MaLoai)
        REFERENCES LoaiXe(MaLoai),

    CHECK (Gia >= 0),

    CHECK (SoLuong >= 0)
);
GO


/* =========================================================
   6. GIỎ HÀNG
   ========================================================= */

CREATE TABLE GioHang
(
    MaGioHang INT IDENTITY(1,1) PRIMARY KEY,

    MaNguoiDung INT NOT NULL,

    NgayTao DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
);
GO


/* =========================================================
   7. CHI TIẾT GIỎ HÀNG
   ========================================================= */

CREATE TABLE ChiTietGioHang
(
    MaGioHang INT NOT NULL,

    MaXe INT NOT NULL,

    SoLuong INT NOT NULL DEFAULT 1,

    PRIMARY KEY (MaGioHang, MaXe),

    FOREIGN KEY (MaGioHang)
        REFERENCES GioHang(MaGioHang),

    FOREIGN KEY (MaXe)
        REFERENCES Xe(MaXe),

    CHECK (SoLuong > 0)
);
GO


/* =========================================================
   8. ĐƠN HÀNG
   ========================================================= */

CREATE TABLE DonHang
(
    MaDonHang INT IDENTITY(1,1) PRIMARY KEY,

    MaNguoiDung INT NOT NULL,

    HoTenNguoiNhan NVARCHAR(100) NOT NULL,

    SoDienThoai VARCHAR(20) NOT NULL,

    DiaChi NVARCHAR(300) NOT NULL,

    TongTien DECIMAL(18,2) NOT NULL,

    PhuongThucThanhToan NVARCHAR(50),

    TrangThai NVARCHAR(50) NOT NULL
        DEFAULT N'Chờ xác nhận',

    NgayDat DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung),

    CHECK (TongTien >= 0)
);
GO


/* =========================================================
   9. CHI TIẾT ĐƠN HÀNG
   ========================================================= */

CREATE TABLE ChiTietDonHang
(
    MaDonHang INT NOT NULL,

    MaXe INT NOT NULL,

    SoLuong INT NOT NULL,

    DonGia DECIMAL(18,2) NOT NULL,

    ThanhTien AS (SoLuong * DonGia),

    PRIMARY KEY (MaDonHang, MaXe),

    FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang),

    FOREIGN KEY (MaXe)
        REFERENCES Xe(MaXe),

    CHECK (SoLuong > 0),

    CHECK (DonGia >= 0)
);
GO

-- ====================================================================
-- 1. Tạo bảng HinhAnhXe để quản lý nhiều hình ảnh cho mỗi xe
CREATE TABLE [dbo].[HinhAnhXe](
    [MaHinhAnh] [int] IDENTITY(1,1) NOT NULL,
    [MaXe] [int] NOT NULL,
    [DuongDanAnh] [nvarchar](500) NOT NULL,
    [LaAnhChinh] [bit] NULL DEFAULT ((0)),
PRIMARY KEY CLUSTERED 
(
    [MaHinhAnh] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

-- 2. Thêm khóa ngoại kết nối bảng HinhAnhXe với bảng Xe (xóa xe sẽ tự động xóa tất cả ảnh)
ALTER TABLE [dbo].[HinhAnhXe]  WITH CHECK ADD CONSTRAINT [FK__HinhAnhXe__MaXe] FOREIGN KEY([MaXe])
REFERENCES [dbo].[Xe] ([MaXe])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[HinhAnhXe] CHECK CONSTRAINT [FK__HinhAnhXe__MaXe]
GO
-- ===========================================
CREATE TABLE MaXacNhan (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email VARCHAR(100) NOT NULL,
    MaOtpHash VARCHAR(255) NOT NULL,
    MucDich VARCHAR(30) NOT NULL,
    HetHan DATETIME2 NOT NULL,
    DaSuDung BIT NOT NULL DEFAULT 0,
    SoLanThu INT NOT NULL DEFAULT 0,
    TaoLuc DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE INDEX IX_MaXacNhan_Email_MucDich
ON MaXacNhan (Email, MucDich);
-- ============================================================
/* 1. DANH MỤC TIN TỨC */
CREATE TABLE DanhMucTinTuc (
    MaDanhMuc INT IDENTITY(1,1) PRIMARY KEY,
    TenDanhMuc NVARCHAR(100) NOT NULL
);
GO

/* 2. BÀI VIẾT TIN TỨC */
CREATE TABLE TinTuc (
    MaTinTuc INT IDENTITY(1,1) PRIMARY KEY,
    MaDanhMuc INT NOT NULL,
    TieuDe NVARCHAR(255) NOT NULL,
    TomTat NVARCHAR(500),
    NoiDung NVARCHAR(MAX) NOT NULL,
    HinhAnh NVARCHAR(500),
    NgayDang DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (MaDanhMuc) REFERENCES DanhMucTinTuc(MaDanhMuc)
);
GO

-- ===================================================
/* =========================================================
   1. BẢNG PHIÊN HỘI THOẠI (CuocHoiThoai)
   ========================================================= */
CREATE TABLE CuocHoiThoai
(
    MaCuocHoiThoai INT IDENTITY(1,1) PRIMARY KEY,
    MaKhachHang INT NOT NULL,  -- MaNguoiDung của người dùng là Khách hàng
    MaNhanVien INT NULL,       -- MaNguoiDung của người dùng là Sales/Admin (Để NULL khi chưa ai nhận)
    TrangThai NVARCHAR(50) NOT NULL DEFAULT N'Đang chờ', -- 'Đang chờ', 'Đang tư vấn', 'Đã đóng'
    NgayTao DATETIME DEFAULT GETDATE(),

    -- Tham chiếu trực tiếp tới bảng NguoiDung của bạn
    FOREIGN KEY (MaKhachHang) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaNhanVien) REFERENCES NguoiDung(MaNguoiDung)
);
GO

/* =========================================================
   2. BẢNG CHI TIẾT TIN NHẮN (TinNhan)
   ========================================================= */
CREATE TABLE TinNhan
(
    MaTinNhan INT IDENTITY(1,1) PRIMARY KEY,
    MaCuocHoiThoai INT NOT NULL,
    MaNguoiGui INT NOT NULL,    -- MaNguoiDung của người phát tin nhắn (Dù là Khách hay Sales)
    NoiDung NVARCHAR(MAX) NOT NULL,
    ThoiGian DATETIME DEFAULT GETDATE(),
    DaXem BIT DEFAULT 0,        -- 0: Chưa xem, 1: Đã xem

    FOREIGN KEY (MaCuocHoiThoai) REFERENCES CuocHoiThoai(MaCuocHoiThoai),
    FOREIGN KEY (MaNguoiGui) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- Index giúp tăng tốc độ load lịch sử tin nhắn
CREATE INDEX IX_TinNhan_MaCuocHoiThoai 
ON TinNhan(MaCuocHoiThoai);
GO

-- ============================================
/* =========================================================
   13. THÔNG BÁO CÓ XE (Tối giản: Chỉ nhập tên xe)
   ========================================================= */
CREATE TABLE ThongBaoCoXe
(
    MaThongBao INT IDENTITY(1,1) PRIMARY KEY,

    MaNguoiDung INT NOT NULL,              -- Người dùng đăng ký nhận email

    TenXeTimKiem NVARCHAR(150) NOT NULL,    -- Tên xe người dùng gõ vào (VD: "Camry", "Civic")

    TrangThai NVARCHAR(50) NOT NULL
        DEFAULT N'Đang chờ',                -- 'Đang chờ', 'Đã thông báo', 'Đã hủy'

    NgayDangKy DATETIME DEFAULT GETDATE(),  -- Ngày bấm nhận thông báo
    NgayThongBao DATETIME NULL,             -- Ngày gửi Email thành công

    -- Khóa ngoại tham chiếu đến bảng NguoiDung
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE
);
GO