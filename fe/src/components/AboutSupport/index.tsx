import { useEffect } from "react";

const AboutSupport = () => {
  useEffect(() => {
    // Khi chuyển trang, cuộn lên đầu trang
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-6 py-12" id="section3">
      {/* Tiêu đề */}
      <h1 className="text-4xl md:text-5xl font-cursive text-center mb-8 text-white">
        Hỗ trợ
      </h1>

      {/* Đoạn giới thiệu */}
      <p className="text-center text-base text-white mb-6 leading-relaxed">
        MovieStore luôn sẵn sàng hỗ trợ bạn 24/7 thông qua Trung tâm hỗ trợ
        khách hàng. Đội ngũ nhân viên chuyên nghiệp và tận tâm của chúng tôi sẽ
        giải đáp mọi thắc mắc và giúp bạn giải quyết các vấn đề liên quan đến
        dịch vụ. Bạn có thể liên hệ với chúng tôi qua các kênh hỗ trợ trực
        tuyến, điện thoại hoặc email.
      </p>

      {/* Nội dung chi tiết */}
      <div className="space-y-6 text-white text-base leading-relaxed">
        <p>
          Nếu bạn gặp phải sự cố khi sử dụng dịch vụ hoặc cần hỗ trợ kỹ thuật,
          đừng ngần ngại yêu cầu sự trợ giúp. Chúng tôi cam kết mang đến cho bạn
          trải nghiệm dịch vụ tốt nhất.SSSS
        </p>
        <p>
          Để liên hệ với Trung tâm hỗ trợ, vui lòng sử dụng các thông tin dưới
          đây:
          <br />- Điện thoại:{" "}
          <a href="tel:+123456789" className="text-blue-500">
            +123 456 789
          </a>
          <br />- Email:{" "}
          <a href="mailto:support@website.com" className="text-blue-500">
            support@website.com
          </a>
          <br />
        </p>
        <p className="text-center">
          Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.
        </p>
      </div>
    </div>
  );
};

export default AboutSupport;
