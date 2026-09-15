# 🏎️ WebXe - Nền Tảng Thương Mại Điện Tử & Quản Lý Mua Bán Xe

> **Đồ Án Lập Trình Frontend / Web Development**  
> Hệ thống Website Bán Xe & Dashboard Quản Trị Hệ Thống Toàn Diện.

---

## 📌 1. Giới Thiệu Dự Án

**WebXe** là hệ thống web ứng dụng thương mại điện tử chuyên biệt cho lĩnh vực mua bán xe ô tô, xe máy và mô tô thể thao. Hệ thống bao gồm 2 phần chính:
1. **Frontend (`webxe_fontend`)**: Giao diện trải nghiệm cho khách hàng tìm kiếm, xem chi tiết xe, chọn loại xe theo hãng, quản lý tài khoản cá nhân và đặt hàng.
2. **Backend Dashboard (`webxe_backend`)**: Trang quản trị dữ liệu dành cho Admin quản lý kho xe, hãng xe, loại xe, vai trò người dùng, giỏ hàng và đơn hàng với giao diện Responsive thích ứng mọi thiết bị (Desktop, iPad, Mobile).

---

## 🛠️ 2. Công Nghệ Sử Dụng (Tech Stack)

### **Frontend (`webxe_fontend`)**
* **Framework**: React / Next.js (Pages Router) & TypeScript
* **State Management**: `AuthContext` (React Context) quản lý Auth State toàn cục, Axios/Fetch Interceptor tự động gắn JWT `Bearer Token` và xử lý 401 Unauthorized.
* **Styling**: CSS Modules, Vanilla CSS, Tailwind CSS Utility Classes, Volumetric Cartoon Theme, Glassmorphism.
* **Features**: Tìm kiếm tự động (Auto-complete), lọc sản phẩm theo loại xe/hãng xe, xem gallery hình ảnh xe.

### **Backend (`webxe_backend`)**
* **Runtime**: Node.js & Express.js REST API
* **Authentication**: JSON Web Token (JWT) & `bcrypt` password hashing (12 salt rounds).
* **API Documentation**: Swagger OpenAPI 3.0 (`http://localhost:3002/api-docs`).
* **Middleware**: `authMiddleware` kiểm tra Token & `requireRole` phân quyền theo vai trò (Admin / Customer).

### **Database (Cơ Sở Dữ Liệu)**
* **Database Management System**: **Microsoft SQL Server** (kết nối qua thư viện `mssql` / `tedious`).
* **Database Schema**: 9 Bảng dữ liệu có quan hệ chặt chẽ:
  * `VaiTro` (MaVaiTro, TenVaiTro)
  * `NguoiDung` (MaNguoiDung, MaVaiTro, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, HinhAnh)
  * `HangXe` (MaHang, TenHang, Logo)
  * `LoaiXe` (MaLoai, TenLoai)
  * `Xe` (MaXe, MaHang, MaLoai, TenXe, Gia, NamSanXuat, MauSac, SoLuong)
  * `HinhAnhXe` (MaHinhAnh, MaXe, DuongDanAnh, LaAnhChinh)
  * `GioHang` (MaGioHang, MaNguoiDung, NgayTao)
  * `ChiTietGioHang` (MaGioHang, MaXe, SoLuong)
  * `DonHang` & `ChiTietDonHang` (MaDonHang, MaNguoiDung, TongTien, TrangThai, NgayDat...)

---

## 🔑 3. Tài Khoản Demo Cho Giảng Viên Kiểm Thử

| Vai trò | Tên đăng nhập (Username) | Mật khẩu (Password) | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `123456` | Toàn quyền quản trị kho xe, danh mục, vai trò, đơn hàng |
| **Khách hàng (User)** | `khach01` | `123456` | Khách hàng mua xe, xem thông tin cá nhân, đặt xe |

---

## 🚀 4. Hướng Dẫn Cài Đặt & Chạy Dự Án (Quick Start)

### **Bước 1: Khởi tạo Cơ Sở Dữ Liệu SQL Server**
1. Mở **SQL Server Management Studio (SSMS)**.
2. Tạo Database tên `QuanLyXe`.
3. Chạy file kịch bản SQL `QuanLyXe.sql` để tạo bảng và nạp dữ liệu mẫu.
4. (Tùy chọn) Chạy file `ThuTuc.sql` để cài đặt các Stored Procedures & Triggers.

### **Bước 2: Cấu hình biến môi trường (`.env`)**
Tại thư mục `webxe_backend`, tạo file `.env` với nội dung mẫu:
```env
PORT=3002
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=QuanLyXe
DB_PORT=1433
JWT_SECRET=webxe-secret-key-2026
JWT_EXPIRES_IN=2h
```

### **Bước 3: Khởi chạy Backend (`webxe_backend`)**
```bash
cd webxe_backend
npm install
npm run dev
```
👉 Backend Server & API Dashboard sẽ chạy tại: **`http://localhost:3002`**  
👉 Tài liệu Swagger API tại: **`http://localhost:3002/api-docs`**

### **Bước 4: Khởi chạy Frontend (`webxe_fontend`)**
```bash
cd webxe_fontend
npm install
npm run dev
```
👉 Trang chủ Frontend Khách hàng sẽ chạy tại: **`http://localhost:3000`**

---

## 📱 5. Thiết Kế Responsive Thích Ứng

Hệ thống được thiết kế tối ưu giao diện trên 3 loại thiết bị chính:
- **Desktop (`>= 1025px`)**: Hiển thị bảng điều khiển Sidebar cố định bên trái, grid 3-4 cột sản phẩm.
- **iPad / Tablet (`<= 1024px`)**: Header xanh full tràn ngang màn hình, menu Hamburger góc trái, grid 2 cột sản phẩm.
- **Mobile (`<= 440px`)**: Header tràn viền, menu xổ dọc (`flex-direction: column`), các nút thao tác dạng ô lớn dễ bấm bằng ngón tay.
