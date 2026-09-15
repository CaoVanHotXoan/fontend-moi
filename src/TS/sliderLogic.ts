import { useState, useEffect } from 'react';

// Custom Hook xử lý logic vòng lặp Slider / Banner
// delay: thời gian chuyển ảnh tự động (ms)
export function useAutoSlider(length: number, delay: number = 5000) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tự động chuyển ảnh sau khoảng thời gian delay
  useEffect(() => {
    if (length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % length);
    }, delay);

    return () => clearInterval(timer);
  }, [length, delay]);

  // Hàm thủ công chuyển sang ảnh tiếp theo
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  // Hàm thủ công chuyển về ảnh trước đó
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? length - 1 : prev - 1));
  };

  // Hàm chọn một ảnh bất kỳ
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return { currentIndex, nextSlide, prevSlide, goToSlide };
}
