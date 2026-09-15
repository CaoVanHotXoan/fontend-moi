/* Stored procedures CRUD cho CSDL QuanLyXe */

CREATE PROCEDURE sp_ThemVaiTro
    @TenVaiTro NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO VaiTro (TenVaiTro) VALUES (@TenVaiTro);
END;
GO

CREATE PROCEDURE sp_SuaVaiTro
    @MaVaiTro INT,
    @TenVaiTro NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE VaiTro SET TenVaiTro = @TenVaiTro WHERE MaVaiTro = @MaVaiTro;
END;
GO

CREATE PROCEDURE sp_XoaVaiTro @MaVaiTro INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM VaiTro WHERE MaVaiTro = @MaVaiTro;
END;
GO

CREATE PROCEDURE sp_ThemNguoiDung
    @MaVaiTro INT, @TenDangNhap VARCHAR(50), @MatKhau VARCHAR(255),
    @HoTen NVARCHAR(100), @Email VARCHAR(100) = NULL,
    @SoDienThoai VARCHAR(20) = NULL, @DiaChi NVARCHAR(300) = NULL, @HinhAnh NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO NguoiDung (MaVaiTro, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, DiaChi, HinhAnh)
    VALUES (@MaVaiTro, @TenDangNhap, @MatKhau, @HoTen, @Email, @SoDienThoai, @DiaChi, @HinhAnh);
END;
GO

CREATE PROCEDURE sp_SuaNguoiDung
    @MaNguoiDung INT, @MaVaiTro INT, @TenDangNhap VARCHAR(50), @MatKhau VARCHAR(255),
    @HoTen NVARCHAR(100), @Email VARCHAR(100) = NULL,
    @SoDienThoai VARCHAR(20) = NULL, @DiaChi NVARCHAR(300) = NULL, @HinhAnh NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE NguoiDung
    SET MaVaiTro = @MaVaiTro, TenDangNhap = @TenDangNhap, MatKhau = @MatKhau,
        HoTen = @HoTen, Email = @Email, SoDienThoai = @SoDienThoai, DiaChi = @DiaChi, HinhAnh = @HinhAnh
    WHERE MaNguoiDung = @MaNguoiDung;
END;
GO

CREATE PROCEDURE sp_XoaNguoiDung @MaNguoiDung INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Xoa du lieu phu thuoc truoc khi xoa tai khoan.
        DELETE FROM TinNhan
        WHERE MaNguoiGui = @MaNguoiDung
           OR MaCuocHoiThoai IN (
                SELECT MaCuocHoiThoai
                FROM CuocHoiThoai
                WHERE MaKhachHang = @MaNguoiDung
                   OR MaNhanVien = @MaNguoiDung
           );

        DELETE FROM CuocHoiThoai
        WHERE MaKhachHang = @MaNguoiDung
           OR MaNhanVien = @MaNguoiDung;

        DELETE cth
        FROM ChiTietGioHang cth
        INNER JOIN GioHang gh ON gh.MaGioHang = cth.MaGioHang
        WHERE gh.MaNguoiDung = @MaNguoiDung;

        DELETE FROM GioHang
        WHERE MaNguoiDung = @MaNguoiDung;

        DELETE ctdh
        FROM ChiTietDonHang ctdh
        INNER JOIN DonHang dh ON dh.MaDonHang = ctdh.MaDonHang
        WHERE dh.MaNguoiDung = @MaNguoiDung;

        DELETE FROM DonHang
        WHERE MaNguoiDung = @MaNguoiDung;

        DELETE FROM NguoiDung
        WHERE MaNguoiDung = @MaNguoiDung;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE PROCEDURE sp_ThemHangXe @TenHang NVARCHAR(100), @Logo NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO HangXe (TenHang, Logo) VALUES (@TenHang, @Logo);
END;
GO

CREATE PROCEDURE sp_SuaHangXe @MaHang INT, @TenHang NVARCHAR(100), @Logo NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE HangXe SET TenHang = @TenHang, Logo = @Logo WHERE MaHang = @MaHang;
END;
GO

CREATE PROCEDURE sp_XoaHangXe @MaHang INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM HangXe WHERE MaHang = @MaHang;
END;
GO

CREATE PROCEDURE sp_ThemLoaiXe @TenLoai NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO LoaiXe (TenLoai) VALUES (@TenLoai);
END;
GO

CREATE PROCEDURE sp_SuaLoaiXe @MaLoai INT, @TenLoai NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE LoaiXe SET TenLoai = @TenLoai WHERE MaLoai = @MaLoai;
END;
GO

CREATE PROCEDURE sp_XoaLoaiXe @MaLoai INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM LoaiXe WHERE MaLoai = @MaLoai;
END;
GO

CREATE PROCEDURE sp_ThemXe
    @MaHang INT, @MaLoai INT, @TenXe NVARCHAR(150), @Gia DECIMAL(18,2),
    @NamSanXuat INT = NULL,
    @MauSac NVARCHAR(100) = NULL, @MoTa NVARCHAR(MAX) = NULL, @SoLuong INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Xe (MaHang, MaLoai, TenXe, Gia, NamSanXuat, MauSac, MoTa, SoLuong)
    VALUES (@MaHang, @MaLoai, @TenXe, @Gia, @NamSanXuat, @MauSac, @MoTa, @SoLuong);
    SELECT CAST(SCOPE_IDENTITY() AS INT) AS MaXe;
END;
GO

CREATE PROCEDURE sp_SuaXe
    @MaXe INT, @MaHang INT, @MaLoai INT, @TenXe NVARCHAR(150), @Gia DECIMAL(18,2),
    @NamSanXuat INT = NULL,
    @MauSac NVARCHAR(100) = NULL, @MoTa NVARCHAR(MAX) = NULL, @SoLuong INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Xe SET MaHang = @MaHang, MaLoai = @MaLoai, TenXe = @TenXe, Gia = @Gia,
        NamSanXuat = @NamSanXuat, MauSac = @MauSac,
        MoTa = @MoTa, SoLuong = @SoLuong WHERE MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_XoaXe @MaXe INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Xe WHERE MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_ThemHinhAnhXe
    @MaXe INT, @DuongDanAnh NVARCHAR(500), @LaAnhChinh BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO HinhAnhXe (MaXe, DuongDanAnh, LaAnhChinh)
    VALUES (@MaXe, @DuongDanAnh, @LaAnhChinh);
END;
GO

CREATE PROCEDURE sp_SuaHinhAnhXe
    @MaHinhAnh INT, @MaXe INT, @DuongDanAnh NVARCHAR(500), @LaAnhChinh BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE HinhAnhXe
    SET MaXe = @MaXe, DuongDanAnh = @DuongDanAnh, LaAnhChinh = @LaAnhChinh
    WHERE MaHinhAnh = @MaHinhAnh;
END;
GO

CREATE PROCEDURE sp_XoaHinhAnhXe @MaHinhAnh INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM HinhAnhXe WHERE MaHinhAnh = @MaHinhAnh;
END;
GO

CREATE PROCEDURE sp_ThemGioHang @MaNguoiDung INT, @NgayTao DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO GioHang (MaNguoiDung, NgayTao) VALUES (@MaNguoiDung, ISNULL(@NgayTao, GETDATE()));
END;
GO

CREATE PROCEDURE sp_SuaGioHang @MaGioHang INT, @MaNguoiDung INT, @NgayTao DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE GioHang SET MaNguoiDung = @MaNguoiDung, NgayTao = @NgayTao WHERE MaGioHang = @MaGioHang;
END;
GO

CREATE PROCEDURE sp_XoaGioHang @MaGioHang INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM GioHang WHERE MaGioHang = @MaGioHang;
END;
GO

CREATE PROCEDURE sp_ThemChiTietGioHang @MaGioHang INT, @MaXe INT, @SoLuong INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ChiTietGioHang (MaGioHang, MaXe, SoLuong) VALUES (@MaGioHang, @MaXe, @SoLuong);
END;
GO

CREATE PROCEDURE sp_SuaChiTietGioHang @MaGioHang INT, @MaXe INT, @SoLuong INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ChiTietGioHang SET SoLuong = @SoLuong WHERE MaGioHang = @MaGioHang AND MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_XoaChiTietGioHang @MaGioHang INT, @MaXe INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang AND MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_ThemDonHang
    @MaNguoiDung INT, @HoTenNguoiNhan NVARCHAR(100), @SoDienThoai VARCHAR(20),
    @DiaChi NVARCHAR(300), @TongTien DECIMAL(18,2),
    @PhuongThucThanhToan NVARCHAR(50) = NULL, @TrangThai NVARCHAR(50), @NgayDat DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO DonHang (MaNguoiDung, HoTenNguoiNhan, SoDienThoai, DiaChi, TongTien, PhuongThucThanhToan, TrangThai, NgayDat)
    VALUES (@MaNguoiDung, @HoTenNguoiNhan, @SoDienThoai, @DiaChi, @TongTien, @PhuongThucThanhToan, @TrangThai, ISNULL(@NgayDat, GETDATE()));
    SELECT CAST(SCOPE_IDENTITY() AS INT) AS MaDonHang;
END;
GO

CREATE PROCEDURE sp_SuaDonHang
    @MaDonHang INT, @MaNguoiDung INT, @HoTenNguoiNhan NVARCHAR(100), @SoDienThoai VARCHAR(20),
    @DiaChi NVARCHAR(300), @TongTien DECIMAL(18,2),
    @PhuongThucThanhToan NVARCHAR(50) = NULL, @TrangThai NVARCHAR(50), @NgayDat DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @TrangThaiCu NVARCHAR(50);
        SELECT @TrangThaiCu = TrangThai FROM DonHang WHERE MaDonHang = @MaDonHang;
        UPDATE DonHang SET MaNguoiDung = @MaNguoiDung, HoTenNguoiNhan = @HoTenNguoiNhan,
            SoDienThoai = @SoDienThoai, DiaChi = @DiaChi,
            PhuongThucThanhToan = @PhuongThucThanhToan, TrangThai = @TrangThai, NgayDat = @NgayDat
        WHERE MaDonHang = @MaDonHang;
        IF @TrangThai = N'Thành công' AND ISNULL(@TrangThaiCu, N'') <> N'Thành công'
        BEGIN
            UPDATE x
            SET x.SoLuong = x.SoLuong - totals.SoLuong
            FROM Xe x
            INNER JOIN (
                SELECT MaXe, SUM(SoLuong) AS SoLuong
                FROM ChiTietDonHang
                WHERE MaDonHang = @MaDonHang
                GROUP BY MaXe
            ) totals ON totals.MaXe = x.MaXe
            WHERE x.SoLuong >= totals.SoLuong;
            IF @@ROWCOUNT <> (SELECT COUNT(DISTINCT MaXe) FROM ChiTietDonHang WHERE MaDonHang = @MaDonHang)
                THROW 50004, N'Số lượng xe trong kho không đủ.', 1;
        END;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE PROCEDURE sp_XoaDonHang @MaDonHang INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM DonHang WHERE MaDonHang = @MaDonHang;
END;
GO

CREATE PROCEDURE sp_ThemChiTietDonHang
    @MaDonHang INT, @MaXe INT, @SoLuong INT, @DonGia DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ChiTietDonHang (MaDonHang, MaXe, SoLuong, DonGia) VALUES (@MaDonHang, @MaXe, @SoLuong, @DonGia);
    UPDATE DonHang
    SET TongTien = (SELECT COALESCE(SUM(SoLuong * DonGia), 0) FROM ChiTietDonHang WHERE MaDonHang = @MaDonHang)
    WHERE MaDonHang = @MaDonHang;
END;
GO

CREATE PROCEDURE sp_ThemDonHangVaChiTiet
    @MaNguoiDung INT, @HoTenNguoiNhan NVARCHAR(100), @SoDienThoai VARCHAR(20),
    @DiaChi NVARCHAR(300), @TongTien DECIMAL(18,2),
    @PhuongThucThanhToan NVARCHAR(50) = NULL, @TrangThai NVARCHAR(50), @NgayDat DATETIME = NULL,
    @MaXe INT, @SoLuong INT, @DonGia DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        IF @SoLuong <= 0 OR @DonGia < 0
        BEGIN
            ;THROW 50001, N'Số lượng và đơn giá không hợp lệ.', 1;
        END;

        INSERT INTO DonHang (MaNguoiDung, HoTenNguoiNhan, SoDienThoai, DiaChi, TongTien, PhuongThucThanhToan, TrangThai, NgayDat)
        VALUES (@MaNguoiDung, @HoTenNguoiNhan, @SoDienThoai, @DiaChi, @TongTien, @PhuongThucThanhToan, @TrangThai, ISNULL(@NgayDat, GETDATE()));

        DECLARE @MaDonHang INT = CAST(SCOPE_IDENTITY() AS INT);
        INSERT INTO ChiTietDonHang (MaDonHang, MaXe, SoLuong, DonGia)
        VALUES (@MaDonHang, @MaXe, @SoLuong, @DonGia);

        IF @TrangThai = N'Thành công'
        BEGIN
            UPDATE Xe
            SET SoLuong = SoLuong - @SoLuong
            WHERE MaXe = @MaXe AND SoLuong >= @SoLuong;
            IF @@ROWCOUNT = 0
            BEGIN
                ;THROW 50002, N'Số lượng xe trong kho không đủ.', 1;
            END;
        END;

        COMMIT TRANSACTION;
        SELECT @MaDonHang AS MaDonHang;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE PROCEDURE sp_SuaChiTietDonHang
    @MaDonHang INT, @MaXe INT, @SoLuong INT, @DonGia DECIMAL(18,2), @MaXeCu INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ChiTietDonHang SET MaXe = @MaXe, SoLuong = @SoLuong, DonGia = @DonGia
    WHERE MaDonHang = @MaDonHang AND MaXe = ISNULL(@MaXeCu, @MaXe);
    IF @@ROWCOUNT = 0
        THROW 50003, N'Không tìm thấy chi tiết đơn hàng cần cập nhật.', 1;
    UPDATE DonHang
    SET TongTien = (SELECT COALESCE(SUM(SoLuong * DonGia), 0) FROM ChiTietDonHang WHERE MaDonHang = @MaDonHang)
    WHERE MaDonHang = @MaDonHang;
END;
GO

CREATE PROCEDURE sp_XoaChiTietDonHang @MaDonHang INT, @MaXe INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM ChiTietDonHang WHERE MaDonHang = @MaDonHang AND MaXe = @MaXe;
    UPDATE DonHang
    SET TongTien = (SELECT COALESCE(SUM(SoLuong * DonGia), 0) FROM ChiTietDonHang WHERE MaDonHang = @MaDonHang)
    WHERE MaDonHang = @MaDonHang;
END;
GO

CREATE PROCEDURE sp_ThemDanhMucTinTuc
    @TenDanhMuc NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO DanhMucTinTuc (TenDanhMuc)
    VALUES (@TenDanhMuc);
END;
GO

CREATE PROCEDURE sp_SuaDanhMucTinTuc
    @MaDanhMuc INT,
    @TenDanhMuc NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DanhMucTinTuc
    SET TenDanhMuc = @TenDanhMuc
    WHERE MaDanhMuc = @MaDanhMuc;
END;
GO

CREATE PROCEDURE sp_XoaDanhMucTinTuc
    @MaDanhMuc INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM DanhMucTinTuc WHERE MaDanhMuc = @MaDanhMuc;
END;
GO

CREATE PROCEDURE sp_ThemTinTuc
    @MaDanhMuc INT,
    @TieuDe NVARCHAR(255),
    @TomTat NVARCHAR(500) = NULL,
    @NoiDung NVARCHAR(MAX),
    @HinhAnh NVARCHAR(500) = NULL,
    @NgayDang DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO TinTuc (MaDanhMuc, TieuDe, TomTat, NoiDung, HinhAnh, NgayDang)
    VALUES (@MaDanhMuc, @TieuDe, @TomTat, @NoiDung, @HinhAnh, ISNULL(@NgayDang, GETDATE()));
END;
GO

CREATE PROCEDURE sp_SuaTinTuc
    @MaTinTuc INT,
    @MaDanhMuc INT,
    @TieuDe NVARCHAR(255),
    @TomTat NVARCHAR(500) = NULL,
    @NoiDung NVARCHAR(MAX),
    @HinhAnh NVARCHAR(500) = NULL,
    @NgayDang DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TinTuc
    SET MaDanhMuc = @MaDanhMuc,
        TieuDe = @TieuDe,
        TomTat = @TomTat,
        NoiDung = @NoiDung,
        HinhAnh = @HinhAnh,
        NgayDang = @NgayDang
    WHERE MaTinTuc = @MaTinTuc;
END;
GO

CREATE PROCEDURE sp_XoaTinTuc
    @MaTinTuc INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM TinTuc WHERE MaTinTuc = @MaTinTuc;
END;
GO

CREATE PROCEDURE sp_ThemThongBaoCoXe
    @MaNguoiDung INT,
    @TenXeTimKiem NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ThongBaoCoXe (MaNguoiDung, TenXeTimKiem, TrangThai)
    VALUES (@MaNguoiDung, LTRIM(RTRIM(@TenXeTimKiem)), N'Đang chờ');
    SELECT CAST(SCOPE_IDENTITY() AS INT) AS MaThongBao;
END;
GO

CREATE PROCEDURE sp_SuaThongBaoCoXe
    @MaThongBao INT,
    @MaNguoiDung INT,
    @TenXeTimKiem NVARCHAR(150),
    @TrangThai NVARCHAR(50) = N'Đang chờ',
    @NgayThongBao DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ThongBaoCoXe
    SET TenXeTimKiem = LTRIM(RTRIM(@TenXeTimKiem)),
        TrangThai = @TrangThai,
        NgayThongBao = @NgayThongBao
    WHERE MaThongBao = @MaThongBao AND MaNguoiDung = @MaNguoiDung;
END;
GO

CREATE PROCEDURE sp_XoaThongBaoCoXe
    @MaThongBao INT,
    @MaNguoiDung INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM ThongBaoCoXe
    WHERE MaThongBao = @MaThongBao AND MaNguoiDung = @MaNguoiDung;
END;
GO

CREATE PROCEDURE sp_ThemCuocHoiThoai
    @MaKhachHang INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO CuocHoiThoai (MaKhachHang)
    VALUES (@MaKhachHang);
    SELECT CAST(SCOPE_IDENTITY() AS INT) AS MaCuocHoiThoai;
END;
GO

CREATE PROCEDURE sp_NhanCuocHoiThoai
    @MaCuocHoiThoai INT,
    @MaNhanVien INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE CuocHoiThoai
    SET MaNhanVien = @MaNhanVien,
        TrangThai = N'Đang tư vấn'
    WHERE MaCuocHoiThoai = @MaCuocHoiThoai;
END;
GO

CREATE PROCEDURE sp_ThemTinNhan
    @MaCuocHoiThoai INT,
    @MaNguoiGui INT,
    @NoiDung NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO TinNhan (MaCuocHoiThoai, MaNguoiGui, NoiDung)
    VALUES (@MaCuocHoiThoai, @MaNguoiGui, @NoiDung);
    SELECT CAST(SCOPE_IDENTITY() AS INT) AS MaTinNhan;
END;
GO

CREATE PROCEDURE sp_DanhDauTinNhanDaXem
    @MaCuocHoiThoai INT,
    @MaNguoiXem INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TinNhan
    SET DaXem = 1
    WHERE MaCuocHoiThoai = @MaCuocHoiThoai
      AND MaNguoiGui <> @MaNguoiXem;
END;
GO