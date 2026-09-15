// Kiểu dữ liệu thống nhất cho một bài viết tin tức.
export type NewsItem = {
  id: number;
  category: string;
  title: string;
  description: string;
  image: string;
};

// Bốn nhóm được dùng trực tiếp cho menu phân loại.
export const newsCategories = ['Tin trong nước', 'Tin nước ngoài', 'Tin xe mới', 'Tin khuyến mại'];

// Ảnh dùng luân phiên để dữ liệu mẫu đủ 20 bài cho mỗi nhóm.
const newsImages = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1503376712344-652d0f440f5a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1568772585407-9361f9bfce87?auto=format&fit=crop&w=900&q=80',
];

// Tiêu đề mẫu được tạo thành 30 bài cho từng nhóm tin.
const categoryTitles: Record<string, string[]> = {
  'Tin trong nước': ['Thị trường ô tô Việt Nam tăng trưởng trong tháng mới', 'Người Việt ưu tiên xe tiết kiệm nhiên liệu', 'Các mẫu xe gia đình được quan tâm nhất', 'Hạ tầng sạc điện được mở rộng tại thành phố', 'Kinh nghiệm đăng kiểm xe nhanh chóng', 'Doanh số xe máy tiếp tục tăng mạnh', 'Xu hướng chọn xe an toàn của khách hàng', 'Giá xe cũ có nhiều biến động đáng chú ý', 'Các tuyến đường mới giúp việc di chuyển thuận tiện', 'Chính sách giao thông mới người lái cần biết', 'Mẫu xe đô thị phù hợp gia đình trẻ', 'Thị trường xe sang giữ sức mua ổn định', 'Khách hàng quan tâm nhiều hơn đến công nghệ', 'Bảo dưỡng xe đúng cách trong mùa mưa', 'Những lưu ý khi mua xe lần đầu', 'Xe hybrid dần phổ biến tại Việt Nam', 'Các đại lý tăng chương trình chăm sóc khách hàng', 'Nhu cầu mua xe cuối năm đang khởi sắc', 'Kinh nghiệm lái xe an toàn trên cao tốc', 'Người dùng chia sẻ trải nghiệm xe mới', 'VinFast khai trương thêm hàng loạt trạm sạc trên toàn quốc', 'Thị trường xe cũ sôi động dịp cuối năm', 'Quy định mới về cấp đổi biển số xe ô tô', 'Hàng loạt mẫu xe gầm cao giảm giá mạnh', 'Top 5 xe hạng B bán chạy nhất thị trường Việt', 'Người Việt ngày càng chuộng xe SUV cỡ nhỏ', 'Thành phố lớn đề xuất hạn chế phương tiện cá nhân', 'Nhiều mẫu xe rục rịch ra mắt thị trường Việt Nam', 'Bảo hiểm xe cơ giới: Những điều khoản cần lưu ý', 'Gia tăng xu hướng mua xe qua các kênh trực tuyến'],
  'Tin nước ngoài': ['Hãng xe châu Âu công bố thiết kế sedan mới', 'Thị trường xe điện toàn cầu tiếp tục mở rộng', 'Công nghệ tự lái có bước tiến mới', 'Mẫu SUV địa hình gây chú ý tại triển lãm', 'Nhiều quốc gia thúc đẩy giao thông xanh', 'Xe thể thao lập kỷ lục trên đường đua', 'Thương hiệu Nhật ra mắt động cơ tiết kiệm', 'Các nhà sản xuất đầu tư mạnh cho pin xe', 'Triển lãm ô tô quốc tế quy tụ nhiều mẫu mới', 'Xu hướng xe nhỏ lên ngôi tại đô thị lớn', 'Hãng xe Mỹ giới thiệu phiên bản hiệu suất cao', 'Thị trường xe sang cạnh tranh ngày càng gay gắt', 'Công nghệ an toàn mới được ứng dụng rộng rãi', 'Mẫu mô tô mới chinh phục các cung đường', 'Những thay đổi trong ngành công nghiệp ô tô', 'Nhà máy xe xanh đạt sản lượng kỷ lục', 'Khách hàng quốc tế đón nhận mẫu xe mới', 'Thiết kế tối giản trở thành xu hướng toàn cầu', 'Các hãng xe công bố kế hoạch phát triển bền vững', 'Giải đua xe quốc tế mang đến nhiều bất ngờ', 'Tesla công bố mẫu xe điện giá rẻ mới', 'Liên minh châu Âu xem xét hoãn cấm xe xăng', 'Trung Quốc vượt Nhật Bản về xuất khẩu ô tô', 'Hãng xe sang Đức thu hồi hàng ngàn xe do lỗi phần mềm', 'Công nghệ pin thể rắn hứa hẹn thay đổi ngành xe điện', 'Thị trường ô tô Mỹ phục hồi sau chuỗi ngày ảm đạm', 'Hàn Quốc đầu tư mạnh vào xe hydro', 'Triển lãm ô tô Geneva trở lại với nhiều bất ngờ', 'Toyota đẩy mạnh chiến lược đa dạng hóa nhiên liệu', 'Nhiều startup xe điện gặp khó khăn về tài chính'],
  'Tin xe mới': ['Ra mắt mẫu SUV thế hệ mới với nhiều nâng cấp', 'Sedan thể thao bổ sung công nghệ thông minh', 'Mẫu mô tô địa hình dành cho người đam mê khám phá', 'Xe điện mới có phạm vi vận hành ấn tượng', 'Phiên bản giới hạn thu hút cộng đồng yêu xe', 'Mẫu xe đô thị sở hữu thiết kế hiện đại', 'Crossover mới tối ưu không gian gia đình', 'Xe bán tải nâng cấp khả năng vận hành', 'Mẫu xe sang thay đổi diện mạo hoàn toàn', 'Hatchback mới tiết kiệm nhiên liệu hơn', 'Dòng xe hiệu suất cao được trình làng', 'Mẫu xe máy mới hướng đến khách hàng trẻ', 'Công nghệ kết nối mới trên xe thế hệ mới', 'Xe hybrid mới cân bằng sức mạnh và hiệu quả', 'Mẫu xe cổ điển trở lại với diện mạo mới', 'SUV điện được nâng cấp hệ thống an toàn', 'Mô tô phân khối lớn có thêm màu sắc mới', 'Mẫu xe gia đình được bổ sung tiện nghi', 'Xe thể thao mới gây ấn tượng bằng thiết kế', 'Những mẫu xe đáng chờ đợi trong năm nay', 'Hyundai Santa Fe thế hệ mới chốt giá bán chính thức', 'Ford Ranger có thêm phiên bản đặc biệt đậm chất địa hình', 'Honda City bản nâng cấp lộ diện trước ngày ra mắt', 'KIA Sorento facelift gây ấn tượng với thiết kế sắc sảo', 'Mitsubishi Triton hoàn toàn mới sẵn sàng cạnh tranh', 'Mazda CX-5 bổ sung thêm nhiều tiện nghi an toàn', 'Mercedes-Benz GLC mới: Sự kết hợp hoàn hảo giữa sang trọng và công nghệ', 'BMW X5 nâng cấp sức mạnh động cơ', 'Subaru Forester ra mắt thế hệ đột phá', 'Lexus RX nhận được nhiều phản hồi tích cực từ khách hàng'],
  'Tin khuyến mại': ['Ưu đãi đặc biệt cho khách mua xe trong tháng', 'Giảm giá phí trước bạ cho nhiều dòng xe', 'Tặng gói bảo dưỡng khi đặt xe sớm', 'Chương trình lái thử nhận quà hấp dẫn', 'Hỗ trợ trả góp với lãi suất ưu đãi', 'Ưu đãi phụ kiện chính hãng cho khách hàng', 'Khuyến mại cuối tuần tại hệ thống đại lý', 'Đổi xe cũ lấy xe mới với nhiều quyền lợi', 'Tặng bảo hiểm thân vỏ cho khách hàng mới', 'Giảm giá dịch vụ bảo dưỡng định kỳ', 'Quà tặng công nghệ khi mua xe điện', 'Chương trình ưu đãi dành cho gia đình', 'Ưu đãi đặc biệt cho khách hàng doanh nghiệp', 'Hỗ trợ chi phí đăng ký xe trong tháng', 'Combo chăm sóc xe với giá tiết kiệm', 'Khách hàng thân thiết nhận thêm voucher', 'Ưu đãi xe máy dành cho sinh viên', 'Giảm giá phụ kiện mùa du lịch', 'Mua xe nhận gói cứu hộ miễn phí', 'Cơ hội sở hữu xe mới với giá tốt', 'Hỗ trợ 100% lệ phí trước bạ cho xe lắp ráp trong nước', 'Giảm tiền mặt trực tiếp lên đến 100 triệu đồng cho SUV cỡ D', 'Tặng gói phụ kiện cao cấp khi mua xe sedan hạng C', 'Chương trình tri ân khách hàng: Miễn phí thay dầu động cơ', 'Bốc thăm trúng thưởng chuyến du lịch châu Âu khi mua xe', 'Ưu đãi lãi suất vay 0% trong 12 tháng đầu tiên', 'Nhận ngay thẻ dịch vụ trị giá 20 triệu đồng', 'Thu cũ đổi mới: Trợ giá thêm 50 triệu đồng', 'Tặng bảo hiểm vật chất 2 năm cho dòng xe đa dụng', 'Flash sale cuối tuần: Giảm giá cực sốc tại các đại lý'],
};

// Sinh dữ liệu bài viết từ các tiêu đề, mỗi danh mục có 30 bài và ID duy nhất.
export const newsItems: NewsItem[] = newsCategories.flatMap((category) =>
  categoryTitles[category].map((title, index) => {
    const id = newsCategories.indexOf(category) * 100 + index + 1;
    return {
      id,
      category,
      title,
      description: 'Cập nhật thông tin mới nhất, phân tích hữu ích và kinh nghiệm dành cho người yêu xe.',
      image: `https://loremflickr.com/900/600/car?lock=${id}`,
    };
  }),
);

// Danh sách video mẫu hiển thị trong sidebar.
export const videos = [
  { id: 1, title: 'Khám phá mẫu xe thể thao nổi bật', url: 'https://www.youtube.com/embed/ScMz IvxBSi4'.replace(' ', '') },
  { id: 2, title: 'Trải nghiệm xe điện thế hệ mới', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 3, title: 'So sánh SUV đô thị đáng chú ý', url: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  { id: 4, title: 'Hướng dẫn chăm sóc xe tại nhà', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 5, title: 'Lái thử mẫu xe gia đình mới', url: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  { id: 6, title: 'Công nghệ an toàn trên xe hiện đại', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 7, title: 'Những mẫu mô tô được yêu thích', url: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  { id: 8, title: 'Kinh nghiệm chọn xe tiết kiệm nhiên liệu', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 9, title: 'Khám phá nội thất xe cao cấp', url: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  { id: 10, title: 'Tin nhanh thị trường xe tuần này', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
];
