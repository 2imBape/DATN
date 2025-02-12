import { useEffect } from "react";

const AboutPrivacy = () => {
  useEffect(() => {
    // Khi chuyển trang, cuộn lên đầu trang
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-6 py-12" id="section6">
      {/* Tiêu đề */}
      <h1 className="text-4xl md:text-5xl font-cursive text-center mb-8 text-white">
        Chính sách chung
      </h1>

      {/* Nội dung chi tiết */}
      <div className="space-y-6 text-white text-base leading-relaxed">
        <li className="font-bold">Chính sách bảo mật</li>
        <p className="text-justify">
          1.1 Thông tin thu thập: Movie Store có thể thu thập thông tin cá nhân
          của khách hàng bao gồm: họ tên, địa chỉ và số điện thoại di động, địa
          chỉ email và bất kỳ thông tin nào khác nếu bạn đồng ý cung cấp.
        </p>
        <p className="text-justify">
          1.2 Mục đích sử dụng thông tin: Movie Store có thể sử dụng thông tin
          cá nhân do khách hàng cung cấp để cung cấp hàng hóa và dịch vụ, thực
          hiện các chương trình của Movie Store và/hoặc các đối tác của chúng
          tôi, với điều kiện các chương trình này được thực hiện một cách công
          khai và minh bạch.
        </p>
        <p className="text-justify">
          1.3 Chia sẻ thông tin: Movie Store sẽ không cung cấp thông tin cá nhân
          của khách hàng cho bên thứ ba không liên quan đến Movie Store và không
          cho phép bên thứ ba sử dụng thông tin này để tiếp thị trực tiếp đến
          khách hàng. Chúng tôi có thể sử dụng các công ty liên quan để vận hành
          và duy trì website hoặc cho các mục đích khác liên quan đến hoạt động
          kinh doanh, và các công ty này sẽ nhận thông tin khách hàng để thực
          hiện các yêu cầu của Movie Store. Chúng tôi có quyền chia sẻ thông tin
          cá nhân của khách hàng trong một số trường hợp khi cơ quan chính phủ
          có yêu cầu thông tin, phục vụ mục đích điều tra hoặc các yêu cầu khác
          theo quy định của pháp luật.
        </p>
        <p className="text-justify">
          {" "}
          1.4 Bảo mật thông tin: Movie Store sẽ thực hiện các biện pháp an ninh
          để bảo vệ thông tin cá nhân của khách hàng khỏi mất mát, lạm dụng hoặc
          thay đổi thông tin cá nhân. Chúng tôi sử dụng các biện pháp an ninh
          như mã hóa thông tin cá nhân, sử dụng phần mềm bảo mật, mật khẩu để
          bảo vệ thông tin cá nhân của khách hàng. Chúng tôi cũng yêu cầu các
          nhân viên của chúng tôi tuân thủ các quy định về bảo mật thông tin cá
          nhân của khách hàng.
        </p>
        <li className="font-bold">Chính sách thanh toán</li>
        <p className="text-justify">
          1.1 Các gói phim trên Website Movie Store được cung cấp dưới dạng đăng
          ký theo tháng, quý, hoặc năm.
        </p>
        <p className="text-justify">
          1.2 Người dùng cần thanh toán trước khi có thể sử dụng dịch vụ.
          Website hỗ trợ nhiều hình thức thanh toán, bao gồm thẻ tín dụng, ví
          điện tử, chuyển khoản ngân hàng.
        </p>
        <p className="text-justify">
          1.3 Các giao dịch thanh toán sẽ được xử lý qua cổng thanh toán an toàn
          và bảo mật. Website cam kết bảo vệ thông tin thanh toán của người
          dùng.
        </p>
        <p className="text-justify">
          1.4 Người dùng cần thanh toán trước khi có thể sử dụng dịch vụ. Các
          gói dịch vụ này sẽ tự động gia hạn vào cuối kỳ nếu không có yêu cầu
          hủy bỏ từ người dùng.
        </p>
        <li className="font-bold">Chính sách hoàn tiền</li>
        <p className="text-justify">
          1.1 Điều kiện hoàn tiền: Chính sách hoàn tiền chỉ áp dụng trong trường
          hợp dịch vụ không đáp ứng được kỳ vọng của người dùng hoặc có sự cố kỹ
          thuật ngoài tầm kiểm soát của MovieStore. Nếu bạn gặp phải sự cố không
          thể sử dụng dịch vụ, bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày kể
          từ ngày thanh toán.
        </p>
        <p>
          1.2 Quy trình hoàn tiền: Để yêu cầu hoàn tiền, người dùng cần liên hệ
          với bộ phận hỗ trợ khách hàng của MovieStore thông qua email hoặc số
          điện thoại hỗ trợ. Sau khi nhận được yêu cầu, chúng tôi sẽ xem xét và
          xác nhận các điều kiện hoàn tiền trước khi thực hiện hoàn trả. Việc
          hoàn tiền sẽ được xử lý trong vòng 7 ngày làm việc kể từ khi yêu cầu
          được xác nhận.
        </p>
        <p className="text-justify">
          1.3 Các trường hợp không hoàn tiền: Chúng tôi không thể hoàn tiền
          trong các trường hợp như người dùng đã sử dụng hết thời gian đăng ký
          dịch vụ, đã hủy gói dịch vụ trước khi hết hạn, hoặc khi có vi phạm các
          điều khoản và quy định của MovieStore.
        </p>
        <p className="text-red-400 text-justify">
          Lưu ý: Chính sách hoàn tiền không áp dụng đối với các trường hợp người
          dùng đã sử dụng dịch vụ quá lâu hoặc đã xem phim trong thời gian dài.
          Các trường hợp yêu cầu hoàn tiền sẽ được xem xét dựa trên từng tình
          huống cụ thể.
        </p>
      </div>
    </div>
  );
};

export default AboutPrivacy;
