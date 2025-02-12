import { useEffect } from "react";

const AboutAccount = () => {
  useEffect(() => {
    // Khi chuyển trang, cuộn lên đầu trang
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-6 py-12" >
      {/* Tiêu đề */}
      <h1 className="text-4xl md:text-5xl font-cursive text-center mb-8 text-white">
        Đăng ký tài khoản
      </h1>

      {/* Đoạn giới thiệu */}
      <p className="text-center text-base text-white mb-6 leading-relaxed">
        Người dùng cần đăng ký tài khoản trên website để có thể mua gói phim và
        sử dụng các tính năng khác. Tài khoản giúp bạn lưu trữ lịch sử xem phim,
        quản lý danh sách yêu thích và nhận được các ưu đãi đặc biệt.
      </p>

      {/* Nội dung chi tiết */}
      <div className="space-y-6 text-white text-base leading-relaxed">
        <p className="text-justify">
          Đăng ký rất đơn giản! Bạn chỉ cần cung cấp thông tin cơ bản như email,
          mật khẩu, và họ tên. Chúng tôi cam kết bảo mật thông tin cá nhân của
          bạn.
        </p>
        <p className="text-justify">
          Sau khi đăng ký, bạn sẽ có quyền truy cập vào tất cả các gói dịch vụ
          của chúng tôi, đồng thời có thể lưu trữ và quản lý các bộ phim yêu
          thích của mình. Ngoài ra, bạn còn nhận được các thông báo về ưu đãi
          đặc biệt và khuyến mãi dành riêng cho thành viên.
        </p>
        <p className="text-justify">
          Nếu bạn đã có tài khoản, vui lòng{" "}
          <a href="/login" className="text-blue-500 underline">
            đăng nhập
          </a>
          . Nếu quên mật khẩu, bạn có thể sử dụng tính năng{" "}
          <a href="/forgot-password" className="text-blue-500 underline">
            khôi phục mật khẩu
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default AboutAccount;
