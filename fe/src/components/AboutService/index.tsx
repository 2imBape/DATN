import { useEffect } from "react";

const AboutService = () => {
  useEffect(() => {
    // Khi chuyển trang, cuộn lên đầu trang
    window.scrollTo(0, 0);
  }, []); // useEffect này chỉ chạy 1 lần khi component được render

  return (
    <div className="max-w-5xl mx-auto px-6 py-12" id="section2">
      {/* Tiêu đề */}
      <h1 className="text-4xl md:text-5xl font-cursive text-center mb-8 text-white">
        Các gói dịch vụ
      </h1>

      {/* Đoạn giới thiệu */}
      <p className="text-center text-base text-white mb-6 leading-relaxed">
        Tại MovieStore, chúng tôi cung cấp nhiều gói dịch vụ linh hoạt để đáp
        ứng nhu cầu giải trí của từng người dùng. Với các gói thuê phim đa dạng,
        bạn có thể dễ dàng lựa chọn gói dịch vụ phù hợp, từ gói cá nhân cho
        người dùng đơn lẻ, cho đến gói gia đình với nhiều tiện ích.
      </p>

      {/* Nội dung chi tiết */}
      <div className="space-y-6 text-white text-base leading-relaxed">
        <p className="text-justify">
          1.1 Gói 1 tháng: Người dùng có thể đăng ký sử dụng dịch vụ trong vòng
          1 tháng.
        </p>
        <p className="text-justify">
          1.2 Gói 3 tháng: Người dùng có thể đăng ký sử dụng dịch vụ trong vòng
          3 tháng với mức giá ưu đãi.
        </p>
        <p className="text-justify">
          1.3 Gói 6 tháng: Người dùng có thể đăng ký sử dụng dịch vụ trong vòng
          6 tháng với mức giá ưu đãi hơn.
        </p>
        <p className="text-justify">
          1.4 Gói 1 năm: Người dùng có thể đăng ký sử dụng dịch vụ trong vòng 1
          năm với mức giá ưu đãi nhất.
        </p>
        <li className="font-bold">Quy định về nâng cấp gói dịch vụ</li>
        <p className="text-justify">
          {" "}
          1.1 Người dùng có thể nâng cấp gói dịch vụ của mình khi cần thiết. Tuy
          nhiên, để nâng cấp gói, người dùng phải đăng ký gói mới ít nhất 3 ngày
          trước khi gói hiện tại hết hạn.
        </p>
        <p className="text-justify">
          {" "}
          1.2 Nếu quá 3 ngày trước khi hết hạn, người dùng sẽ không thể nâng cấp
          gói mà phải đợi đến khi gói hiện tại hết hạn mới có thể thay đổi.
        </p>
        <p className="text-red-400 text-justify">
          Lưu ý: Người dùng cần thanh toán trước khi có thể sử dụng dịch vụ. Các
          gói dịch vụ này sẽ tự động gia hạn vào cuối kỳ nếu không có yêu cầu
          hủy bỏ từ người dùng.
        </p>
      </div>
    </div>
  );
};

export default AboutService;
