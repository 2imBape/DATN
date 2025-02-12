import { useEffect } from "react";

const AboutDetail = () => {
  useEffect(() => {
    // Khi chuyển trang, cuộn lên đầu trang
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-6 py-12" id="section1">
      {/* Tiêu đề */}
      <h1 className="text-4xl md:text-5xl font-cursive text-center mb-8 text-white">
        MovieStore
      </h1>

      {/* Đoạn giới thiệu */}
      <p className="text-center text-base text-white mb-6 leading-relaxed">
        MovieStore là nền tảng cho thuê phim bản quyền trực tuyến với các gói
        dịch vụ linh hoạt, đem đến trải nghiệm xem phim chất lượng cao, mọi lúc
        mọi nơi.
      </p>

      {/* Nội dung chi tiết */}
      <div className="space-y-6 text-white text-base leading-relaxed">
      <p className="text-justify">
          MovieStore cung cấp các bộ phim mới nhất từ nhiều thể loại khác nhau,
          bao gồm phim bom tấn, phim truyền hình và phim tài liệu nổi tiếng.
          Chúng tôi cam kết mang đến những bộ phim chất lượng với độ phân giải
          cao cùng trải nghiệm âm thanh sống động.
        </p>
        <p className="text-justify">
          Với công nghệ phát trực tuyến hiện đại, bạn có thể xem phim trên mọi
          thiết bị di động. Các gói dịch vụ linh hoạt phù hợp với từng nhu cầu,
          từ gói cá nhân đến gia đình.
        </p>
        <p className="text-justify">
          Không gian MovieStore được thiết kế thân thiện, dễ sử dụng, mang lại
          sự thoải mái cho người dùng khi lựa chọn phim yêu thích và khám phá
          thế giới giải trí đỉnh cao.
        </p>
      </div>
    </div>
  );
};

export default AboutDetail;
