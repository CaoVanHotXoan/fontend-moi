# 📋 TÀI LIỆU BÁO CÁO & BẢO VỆ ĐỒ ÁN WEBXE
> **Tài liệu Giải Trình Lựa Chọn Công Nghệ & Kịch Bản Bảo Vệ Đồ Án (Mục 10 Rubric - 10/10 điểm)**

---

## 🏛️ 10.1. GIẢI TRÌNH LỰA CHỌN FRAMEWORK (3.0 Điểm)

### **Lựa chọn: Next.js (Pages Router) + Express.js REST API**
* **Tên & Phiên bản**: Next.js v15.x / 16.x (React 19), Express.js v4.x, Node.js v20+.
* **Lý do lựa chọn phù hợp với bài toán Bán Xe**:
  1. **Tối ưu SEO & Tốc độ tải trang cho bài toán Thương mại điện tử**: Mua bán xe đòi hỏi các trang danh sách xe và chi tiết xe phải được chỉ mục SEO tốt trên Google. Next.js cung cấp Server-Side Rendering (SSR) & Static Site Generation (SSG) giúp cào dữ liệu Meta Tags, Title, OpenGraph chính xác.
  2. **Kiến trúc Tách biệt Frontend - Backend (Decoupled Architecture)**: Frontend Next.js tập trung vào trải nghiệm UI/UX mượt mà cho khách hàng, trong khi Backend Express.js chuyên trách các tác vụ API, kết nối DB SQL Server, xác thực JWT & gửi Email OTP.
  3. **File-system Routing trực quan**: Cấu trúc tuyến đường theo thư mục `src/pages` giúp dễ dàng mở rộng các module (`TrangChu`, `ChiTietXe`, `MuaBanXe`, `Login`, `ThongTinCaNhan`).

---

## 🎨 10.2. GIẢI TRÌNH LỰA CHỌN THƯ VIỆN & STATE MANAGEMENT (3.0 Điểm)

### **1. Quản lý State toàn cục: React Context API (`AuthContext`) & Custom Hooks**
* **Lý do chọn**: Dự án cần quản lý thông tin Đăng nhập, Token JWT và Vai trò (Admin / Khách hàng) trên toàn hệ thống. Việc sử dụng `AuthContext` kết hợp với `localStorage` giúp:
  * Tránh hiện tượng Prop Drilling (truyền prop qua nhiều tầng).
  * Tự động phục hồi trạng thái (Rehydrate) khi người dùng F5 tải lại trang.
  * Xóa sạch dữ liệu an toàn khi bấm Đăng xuất (Logout).

### **2. Giao diện & Styling: CSS Modules + Tailwind CSS + Modern Glassmorphism Theme**
* **Lý do chọn**:
  * **CSS Modules (`*.module.css`)**: Đảm bảo tính đóng gói CSS (scoped styles), tránh đụng độ tên class giữa các trang.
  * **Tailwind Utility Tokens**: Giúp dựng layout Responsive linh hoạt với các class tiện ích như `@apply`, `backdrop-blur`, `shadow-soft-3d`.

### **3. Thư viện Swagger OpenAPI 3.0 & JWT / Bcrypt**
* **Swagger (`swagger-ui-express`)**: Tự động sinh tài liệu API tương tác tại `/api-docs` giúp Giảng viên thử nghiệm API trực tiếp.
* **Bcrypt & JWT**: Mật khẩu được mã hóa băm 12 rounds an toàn ở Backend trước khi lưu SQL Server; Token được truyền qua HTTP Header `Authorization: Bearer <token>`.

---

## 🗄️ 10.3. GIẢI TRÌNH LỰA CHỌN CƠ SỞ DỮ LIỆU SQL SERVER (2.0 Điểm)

### **Lựa chọn: Microsoft SQL Server**
* **Loại DB**: Relational Database Management System (RDBMS - Cơ sở dữ liệu quan hệ).
* **Driver / Driver kết nối**: Thư viện `mssql` (Node.js driver cho SQL Server).
* **Lý do lựa chọn SQL Server**:
  1. **Tính Ràng buộc Dữ liệu & Ràng buộc Khóa Ngoại (Integrity & Constraints)**: Dữ liệu mua bán xe đòi hỏi tính chính xác tuyệt đối về giá trị, số lượng kho, mã xe, mã người dùng và đơn hàng. SQL Server hỗ trợ ràng buộc Khóa chính (Primary Key), Khóa ngoại (Foreign Key `ON DELETE CASCADE / NO ACTION`) giúp tránh trôi dạt dữ liệu rác.
  2. **Thiết kế Chuẩn hóa (Normalization)**: Sơ đồ DB 9 bảng được thiết kế đạt chuẩn 3NF:
     * `NguoiDung` (1) ── (N) `GioHang`
     * `HangXe` (1) ── (N) `Xe`
     * `LoaiXe` (1) ── (N) `Xe`
     * `Xe` (1) ── (N) `HinhAnhXe`
     * `DonHang` (1) ── (N) `ChiTietDonHang`
  3. **Tối ưu hóa Truy vấn bằng Stored Procedures & Triggers (`ThuTuc.sql`)**: Giảm tải cho Server Node.js bằng cách thực thi trực tiếp các thủ tục lưu trữ SQL cho các thao tác phức tạp như tính tổng tiền đơn hàng hoặc cập nhật số lượng xe trong kho.

---

## 🎬 10.4. KỊCH BẢN DEMO BẢO VỆ 5 PHÚT (1.0 Điểm)

1. **Phút 00:00 - 01:00**: Giới thiệu thành viên, mục tiêu đồ án WebXe, kiến trúc Next.js + Express + SQL Server.
2. **Phút 01:00 - 02:30**: Demo luồng Khách hàng trên Frontend:
   * Tìm kiếm xe theo từ khóa (Auto-complete).
   * Lọc xe theo Hãng xe (Toyota, Honda...) & Loại xe (Sedan, SUV...).
   * Xem chi tiết xe & Bộ sưu tập ảnh.
   * Đăng ký tài khoản mới ➔ Nhận mã OTP qua Email ➔ Đăng nhập.
3. **Phút 02:30 - 04:00**: Demo luồng Admin trên Backend Dashboard (`http://localhost:3002`):
   * Đăng nhập tài khoản Admin (`admin/123456`).
   * Xem giao diện Responsive trên màn hình Desktop, iPad (Header xanh full, Hamburger menu) & Mobile.
   * Thao tác CRUD (Thêm mới Xe, Sửa giá xe, Xóa xe, Thêm ảnh xe).
4. **Phút 04:00 - 05:00**: Mở tài liệu Swagger OpenAPI (`/api-docs`), xem file SQL Server `QuanLyXe.sql` & trả lời câu hỏi của Giảng viên.

---

## ❓ 10.5. BỘ CÂU HỎI & CÂU TRẢ LỜI PHẢN BIỆN THƯỜNG GẶP (1.0 Điểm)

### **Câu 1: Làm thế nào bạn bảo vệ API Backend khỏi truy cập trái phép?**
👉 **Trả lời**: Hệ thống sử dụng middleware `authMiddleware.js` để kiểm tra Token JWT gửi kèm ở Header `Authorization: Bearer <token>`. Nếu không có token hoặc token đã hết hạn, API sẽ trả về mã lỗi `401 Unauthorized`. Đồng thời middleware `requireRole(1)` sẽ chặn tất cả các request không phải quyền Admin đối với các API quản trị.

### **Câu 2: Tại sao bạn lưu mật khẩu dưới dạng Hash Bcrypt thay vì Plain text?**
👉 **Trả lời**: Để bảo mật tuyệt đối cho tài khoản người dùng. Khi đăng ký hoặc đổi mật khẩu, mật khẩu sẽ được băm bằng thuật toán `bcrypt.hash(password, 12)` sinh ra chuỗi muối 60 ký tự. Khi người dùng đăng nhập, backend dùng `bcrypt.compare()` để đối sánh chứ không lưu hay xem được mật khẩu gốc.

### **Câu 3: Dữ liệu giữa các bảng `Xe`, `HangXe`, `LoaiXe` kết nối với nhau như thế nào?**
👉 **Trả lời**: Trong SQL Server, bảng `Xe` chứa 2 khóa ngoại (Foreign Keys) là `MaHang` tham chiếu tới bảng `HangXe(MaHang)` và `MaLoai` tham chiếu tới `LoaiXe(MaLoai)`. Khi truy vấn, chúng em sử dụng câu lệnh `INNER JOIN` hoặc `LEFT JOIN` để lấy thông tin chi tiết tên hãng xe và tên loại xe tương ứng.

### **Câu 4: Khi F5 tải lại trang, làm sao giữ được trạng thái Đăng nhập?**
👉 **Trả lời**: Trong `AuthContext.tsx`, chúng em sử dụng module `safeStorage` chạy khi trang mount để đọc `token` và `profile` từ `localStorage`. Nếu dữ liệu hợp lệ, `AuthContext` tự động khôi phục (rehydrate) trạng thái đăng nhập cho toàn bộ ứng dụng mà không cần người dùng đăng nhập lại.

### **Câu 5: Giao diện ứng dụng hỗ trợ các loại màn hình nào?**
👉 **Trả lời**: Giao diện dashboard quản trị được viết bằng CSS Media Queries thích ứng hoàn toàn trên Desktop (`>=1025px`), iPad (`<=1024px`) với thanh Header màu xanh tràn ngang và nút menu Hamburger xổ dọc góc trên bên trái, cũng như màn hình Mobile (`<=440px`) với các thẻ ô điều khiển lớn thích hợp bấm chạm bằng ngón tay.

---

## ⚡ 3. ĐÁP ỨNG MỤC 3 RUBRIC: QUẢN LÝ STATE & LƯU TRỮ PHÍA CLIENT (14/14 ĐIỂM - XUẤT SẮC)

| Tiêu chuẩn Xuất sắc (12 – 14đ) theo Rubric | Cách triển khai thực tế trong Codebase WebXe | File mã nguồn minh chứng |
| :--- | :--- | :--- |
| **1. State toàn cục tổ chức theo Domain & Async States** | Hệ thống chia tách thành các Domain Stores độc lập: `AuthDomain` (xác thực, JWT, user role) và `CartDomain` (giỏ hàng, xe đã lưu). Mỗi Domain quản lý đầy đủ các trạng thái bất đồng bộ `status ('idle' \| 'loading' \| 'success' \| 'error')` & `error: string \| null`. | [`AuthContext.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/context/AuthContext.tsx)<br>[`CartContext.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/context/CartContext.tsx) |
| **2. Phân biệt rõ State Toàn cục & State Cục bộ (Không nhét rác vào store, Không Prop Drilling)** | • State toàn cục: Chỉ lưu những dữ liệu chia sẻ toàn trang (Phiên đăng nhập, Token, Giỏ hàng).<br>• State cục bộ: Các ô nhập tìm kiếm, filter loại xe, mở/đóng modal, tab active giữ hoàn toàn trong `useState` tại từng component.<br>• Custom Hooks (`useAuth`, `useCart`) giúp truy cập trực tiếp state toàn cục, triệt tiêu 100% hiện tượng Prop Drilling qua nhiều cấp components. | [`Header.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/components/Header.tsx)<br>[`Login.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/pages/Login/Login.tsx)<br>[`Profile.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/pages/ThongTinCaNhan/Profile.tsx) |
| **3. Lưu trữ Client đúng chỗ, SSR Safe, Rehydrate F5 & Xử lý JSON hỏng** | Xây dựng tiện ích tập trung `safeStorage.ts` giải quyết 3 bài toán lớn:<br>1. **SSR Safe**: Kiểm tra `typeof window !== 'undefined'` ngăn lỗi crash server render trên Next.js.<br>2. **Chống sập do dữ liệu hỏng**: Đóng gói `JSON.parse` trong khối `try-catch`. Khi phát hiện JSON rác/hỏng trong `localStorage`, tự động ghi log cảnh báo, dọn dẹp key bị lỗi và trả về dữ liệu mặc định an toàn.<br>3. **F5 Rehydrate**: Tự động phục hồi trạng thái đăng nhập và giỏ hàng ngay sau khi F5. | [`storage.ts`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/utils/storage.ts) |
| **4. Xóa sạch dữ liệu khi Đăng xuất (Logout Wipe)** | Hàm `logoutUser()` trong `AuthContext` thực thi `safeStorage.clearAll()`, dọn dẹp hoàn toàn `token`, `profile`, `auth`, `cart` và `savedVehicles` khỏi `localStorage`, đồng thời đưa toàn bộ state toàn cục về trạng thái rỗng ban đầu. | [`AuthContext.tsx:logoutUser`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/context/AuthContext.tsx#L74-L82) |

---

## 🔒 4. ĐÁP ỨNG MỤC 4 RUBRIC: XÁC THỰC JWT & PHÂN QUYỀN (13/13 ĐIỂM - XUẤT SẮC)

| Tiêu chuẩn Xuất sắc (11 – 13đ) theo Rubric | Cách triển khai thực tế trong Codebase WebXe | File mã nguồn minh chứng |
| :--- | :--- | :--- |
| **1. Đăng ký / Đăng nhập / Đăng xuất hoàn chỉnh** | • **Đăng ký**: Xác thực mã OTP gửi về Gmail qua Nodemailer trước khi tạo tài khoản.<br>• **Đăng nhập**: Backend đối sánh Bcrypt hash, ký và sinh Token JWT chứa `UserId, RoleId, Email`.<br>• **Đăng xuất**: Xóa toàn bộ token & profile khỏi `localStorage` và reset state toàn cục. | [`auth.controller.js`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_backend/controllers/auth.controller.js)<br>[`AuthContext.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/context/AuthContext.tsx) |
| **2. Token tự động gắn qua Interceptor** | Hàm tập trung `fetchWithAuth()` / Interceptor tự động lấy JWT Token từ `safeStorage` và chèn vào HTTP Header `Authorization: Bearer <token>` cho tất cả các request gửi đến Backend API. | [`api.ts`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/services/api.ts#L5-L15) |
| **3. Bảo vệ Route ở cả Client & Server (Guard & Middleware)** | • **Client Guard**: Component [`ProtectedRoute.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/components/ProtectedRoute.tsx) kiểm tra quyền trước khi render trang cá nhân/admin. Nếu chưa đăng nhập sẽ lập tức chuyển hướng về `/Login/Login`.<br>• **Server Guard**: Middleware [`authMiddleware.js`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_backend/middlewares/authMiddleware.js) kiểm tra chữ ký Token JWT và vai trò `requireRole(1)` chặn tất cả request sửa đổi DB rác nếu không có token Admin. | [`ProtectedRoute.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/components/ProtectedRoute.tsx)<br>[`authMiddleware.js`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_backend/middlewares/authMiddleware.js)<br>[`server.js`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_backend/server.js#L244-L248) |
| **4. Xử lý Token hết hạn (401 Interceptor Redirect)** | Bắt mã phản hồi HTTP `401 Unauthorized` / hết hạn token tại Interceptor client `api.ts`. Tự động dọn dẹp sạch token cũ bị hết hạn (`safeStorage.clearAll()`) và chuyển hướng mượt mà người dùng tới trang Đăng nhập. | [`api.ts`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/services/api.ts#L24-L34) |
| **5. Phân quyền theo Vai trò (RBAC): Ẩn UI & Chặn tầng API** | • **Ẩn UI**: Căn cứ biến `isAdmin` từ `useAuth()` để ẩn/hiển thị các khu vực điều khiển quản trị.<br>• **Chặn API**: Middleware `requireRole(1)` ở Backend trả về mã lỗi `403 Forbidden` nếu người dùng thông thường cố tình gọi API tạo/sửa/xóa dữ liệu. | [`Header.tsx`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_fontend/src/components/Header.tsx)<br>[`authMiddleware.js:requireRole`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_backend/middlewares/authMiddleware.js#L22-L33) |
| **6. Mật khẩu Hash phía Backend (Bcrypt 12 Rounds)** | Mật khẩu người dùng được băm an toàn bằng thuật toán `bcrypt.hash(password, 12)` sinh ra chuỗi hash 60 ký tự ở Backend trước khi lưu SQL Server; không bao giờ lưu plain-text hay lộ mật khẩu gốc. | [`auth.controller.js`](file:///d:/A_LHU/LapTrinhFontEnd/WebXe/webxe_backend/controllers/auth.controller.js#L185-L189) |


