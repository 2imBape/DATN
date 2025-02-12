import { useEffect } from "react";

const AboutPayment = () => {
  useEffect(() => {
    // Khi chuyển trang, cuộn lên đầu trang
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-6 py-12" id="section5">
      {/* Tiêu đề */}
      <h1 className="text-4xl md:text-5xl font-cursive text-center mb-8 text-white">
        Hình thức thanh toán
      </h1>

      {/* Đoạn giới thiệu */}
      <p className="text-center text-base text-white mb-6 leading-relaxed">
        Khi bạn mua gói dịch vụ tại MovieStore, chúng tôi cung cấp nhiều phương
        thức thanh toán dễ dàng và an toàn để bạn có thể lựa chọn, các phương thức thanh toán bao gồm:
      </p>

      {/* Nội dung chi tiết */}
      <div className="space-y-6 text-white text-base leading-relaxed">
        <p className="text-justify">
          Ví điện tử Momo: là một nền tảng ví điện tử do Công ty Cổ phần Dịch vụ
          Di động Trực tuyến (M_Service) phát triển cho phép người dùng thực
          hiện các thanh toán, giao dịch trên các thiết bị di động. Bằng việc
          hợp tác với hơn 90% ngân hàng tại Việt Nam cùng 10.000 thương nhân
          trong nước, công ty này nắm giữ hơn 80% thị phần trong lĩnh vực thanh
          toán kỹ thuật số. Tính đến năm 2022, ví điện tử MoMo có hơn 31 triệu
          người dùng sử dụng.
        </p>
        <p className="text-justify">
          Thanh toán qua VNPay: là ứng dụng công nghệ hiện đại, đột phá trong
          lĩnh vực thanh toán điện tử nhằm xây dựng hệ sinh thái dịch vụ đa dạng
          về sản phẩm, tiện ích, mang tới những trải nghiệm dịch vụ ưu việt phục
          vụ khách hàng và đối tác.
        </p>
        <p className="text-justify">
          Ví của website (xu): Người dùng có thể nạp tiền vào ví trên website
          Movie Store để sử dụng cho các giao dịch mua gói phim. Việc nạp tiền
          vào ví sẽ được thực hiện qua các phương thức thanh toán hỗ trợ trên
          website. Số dư trong ví có thể được sử dụng cho các giao dịch mua gói
          dịch vụ mà không cần phải điền lại thông tin thanh toán mỗi lần mua.
        </p>
        <li className="font-bold text-justify">
          Đổi từ 1000 thành 1 Xu trong ví thanh toán cá nhân
        </li>
        <p className="text-justify">
          1.1 Tại hệ thống của chúng tôi, bạn có thể đổi 1000 tiền trong tài
          khoản của mình thành 1 Xu để sử dụng cho các giao dịch và mua các gói
          dịch vụ trên nền tảng. Xu là đơn vị thanh toán chính thức, giúp bạn
          thuận tiện hơn trong việc thực hiện các giao dịch và quản lý tài chính
          cá nhân.
        </p>
        <p className="text-justify">
          1.2 Việc đổi tiền thành Xu sẽ giúp bạn dễ dàng theo dõi và sử dụng
          trong các giao dịch tiếp theo. Bạn có thể nạp thêm Xu bất cứ khi nào
          cần thiết và sử dụng chúng để mua gói phim hoặc tham gia các hoạt động
          khác trên nền tảng. Đừng quên kiểm tra tài khoản của bạn thường xuyên
          để tận dụng các ưu đãi và khuyến mãi đặc biệt.
        </p>
      </div>
    </div>
  );
};

export default AboutPayment;
