import { useEffect } from 'react';

// Gắn hiệu ứng tia lửa vào toàn bộ trang sau mỗi lần click chuột.
export default function HieuUng() {
  useEffect(() => {
    // Tạo một cụm tia có hướng và độ dài ngẫu nhiên quanh vị trí click.
    const handleClick = (event: MouseEvent) => {
      const burst = document.createElement('span');
      burst.className = 'click-burst';
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      document.body.appendChild(burst);

      // Tạo số lượng tia thay đổi nhẹ để mỗi lần click trông tự nhiên hơn.
      const sparkCount = 10 + Math.floor(Math.random() * 5);
      for (let index = 0; index < sparkCount; index += 1) {
        const spark = document.createElement('span');
        spark.className = 'click-spark';
        spark.style.left = `${event.clientX}px`;
        spark.style.top = `${event.clientY}px`;
        spark.style.setProperty('--spark-angle', `${(index * (360 / sparkCount)) + (Math.random() * 18 - 9)}deg`);
        spark.style.setProperty('--spark-distance', `${24 + Math.random() * 28}px`);
        spark.style.setProperty('--spark-delay', `${Math.random() * 70}ms`);
        spark.style.setProperty('--spark-scale', `${0.7 + Math.random() * 0.7}`);
        document.body.appendChild(spark);

        // Xóa từng tia sau khi animation hoàn tất để tránh tăng DOM liên tục.
        window.setTimeout(() => spark.remove(), 800);
      }

      // Xóa lớp lóe sáng và vòng xung kích sau khi hiệu ứng kết thúc.
      window.setTimeout(() => burst.remove(), 550);
    };

    document.addEventListener('click', handleClick);

    // Gỡ listener khi component bị hủy để tránh đăng ký lặp.
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}