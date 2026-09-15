import React from 'react';
import Link from 'next/link';
// Global styles moved to pages/_app.tsx

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Cột 1: Thông tin công ty giả định */}
        <div>
          <div className="footer-logo">TEAM BẤT ỔN</div>
          <p className="footer-desc">
            Chúng tôi tự hào là một trong những hệ thống mua bán xe uy tín nhất. 
            Cung cấp các dòng xe đời mới, xe lướt, từ xe máy, xe mô tô đến ô tô 
            hạng sang với dịch vụ chuyên nghiệp.
          </p>
        </div>

        {/* Cột 2: Chính sách công ty */}
        <div>
          <h4 className="footer-title">Chính Sách</h4>
          <ul className="footer-links">
            <li><Link href="#">Chính sách bảo hành</Link></li>
            <li><Link href="#">Chính sách đổi trả</Link></li>
            <li><Link href="#">Chính sách bảo mật</Link></li>
            <li><Link href="#">Điều khoản sử dụng</Link></li>
          </ul>
        </div>

        {/* Cột 3: Thông tin liên hệ */}
        <div>
          <h4 className="footer-title">Liên Hệ</h4>
          <ul className="footer-links">
            <li>Địa chỉ: 123 Đường Bất Ổn, Quận 1, TP.HCM</li>
            <li>Hotline: 0987 654 321</li>
            <li>Email: lienhe@teambat_on.com</li>
            <li>Giờ làm việc: 08:00 - 20:00 (T2 - CN)</li>
          </ul>
        </div>
      </div>
      
      {/* Footer dưới cùng */}
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Team Bất Ổn. Bản quyền đã được bảo hộ.
      </div>
    </footer>
  );
}
