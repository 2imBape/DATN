import instance from "@/configs/axios";
import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Spin,
  Alert,
  Button,
  Modal,
  Radio,
  message,
  notification,
} from "antd";
import { useNavigate } from "react-router-dom";
import DiscountCodeModal from "@/components/Discount";
import axios from "axios";

const { Title, Text } = Typography;

const ManagePackage: React.FC = () => {
  const [currentPackage, setCurrentPackage] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isModalCodeVisible, setIsModalCodeVisible] = useState<boolean>(false);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentPackage = async () => {
      try {
        setLoading(true);
        const response = await instance.get("/payment/package");
        if (response.data?.data) {
          setCurrentPackage(response.data.data);
        } else {
          setCurrentPackage(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPackage();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full min-h-screen bg-black text-white">
        <Spin tip="Đang tải thông tin gói..." size="large" />
      </div>
    );
  }

  if (!currentPackage) {
    return (
      <div className="flex justify-center items-center w-full h-full min-h-screen bg-black text-white">
        <div className="text-center">
          <Alert
            message="Thông báo"
            description="Bạn chưa đăng ký gói dịch vụ nào."
            type="warning"
            showIcon
          />
          <Button
            type="primary"
            className="mt-4"
            onClick={() => navigate("/package")}
          >
            Đăng ký gói
          </Button>
        </div>
      </div>
    );
  }

  const expirationDate = new Date(currentPackage.expirationDate);
  const updatedAt = new Date(currentPackage.updatedAt);
  const now = new Date();

  const daysRemaining = Math.ceil(
    (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysSinceUpdate = Math.ceil(
    (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Điều kiện hiển thị nút nâng cấp, gia hạn, hoặc hạ gói
  const showUpgrade =
    daysSinceUpdate <= 3 && currentPackage.status === "active";
  const showDowngrade =
    daysSinceUpdate > 3 && currentPackage.status === "active";
  const showRenewal = daysRemaining <= 3 && daysRemaining >= 0;
  const showPostExpirationRenewal = daysRemaining < 0 && daysRemaining >= -3;

  // Điều kiện hiển thị mua gói
  const showBuyPackage = daysRemaining < 0;

  const handleUpgradeClick = () => {
    navigate("/package");
  };

  const handleConfirm = async () => {
    if (!paymentMethod) {
      return message.error("Vui lòng chọn phương thức thanh toán.");
    }
    setIsModalVisible(false);
    setIsModalCodeVisible(true); // Mở modal nhập mã giảm giá
  };

  const handleConfirmPayment = async (promoCodeId: string | undefined) => {
    if (!paymentMethod) {
      return message.error("Vui lòng chọn phương thức thanh toán.");
    }
    setIsModalCodeVisible(false);

    try {
      const response = await instance.post("/payment/renew", {
        paymentMethod,

        discount: promoCodeId,
      });
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        notification.success({
          message: "Gia hạn gói thành công",
          description:
            "Bạn đã gia hạn gói dịch vụ thành công, vui lòng kiểm tra lịch sử!",
        });
        const { data } = await instance.get("payment/package-user");
        const status = data.status;
        localStorage.setItem("checkPackageUser", status);
        return;
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const backendError =
          err.response.data.message || "Lỗi thanh toán từ máy chủ.";
        message.error(` ${backendError}`);
      }
    }
  };

  const formattedExpirationDate =
    daysRemaining > 0
      ? `Còn ${daysRemaining} ngày`
      : daysRemaining === 0
        ? "Hết hạn hôm nay"
        : `Đã hết hạn ${-daysRemaining} ngày`;

  const openNotification = (message: string, description: string) => {
    api.info({
      message: message,
      description: description,
      placement: "topRight",
    });
  };

  return (
    <>
      {contextHolder}
      <div className="flex justify-center w-full h-full bg-black text-white">
        <Card
          title="Thông tin gói hiện tại"
          bordered={false}
          className="w-full max-w-md shadow-lg rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 text-white"
          headStyle={{ color: "white" }}
        >
          <div className="mb-4">
            <Title level={5} className="!text-white">
              Tên gói:
            </Title>
            <Text className="text-white">
              {currentPackage.package?.name || "Không xác định"}
            </Text>
          </div>

          <div className="mb-4">
            <Title level={5} className="!text-white">
              Giá:
            </Title>
            <Text className="text-white">
              {currentPackage.package?.price || "Không rõ"} Xu
            </Text>
          </div>

          <div className="mb-4">
            <Title level={5} className="!text-white">
              Ngày hết hạn:
            </Title>
            <Text className="text-white">
              {formattedExpirationDate.includes("Hết hạn")
                ? formattedExpirationDate
                : ` ${formattedExpirationDate}`}
            </Text>
          </div>

          <div>
            <Title level={5} className="!text-white">
              Trạng thái:
            </Title>
            <Text
              className="text-white"
              type={currentPackage.status === "active" ? "success" : "danger"}
            >
              {currentPackage.status === "active" ? (
                <span className="text-green-500">Đang hoạt động</span>
              ) : (
                <span className="text-red-500">Hết hạn</span>
              )}
            </Text>
          </div>

          <div className="mt-4">
            {showUpgrade && (
              <Button
                type="primary"
                className="w-full"
                style={{ marginBottom: "10px" }}
                onClick={handleUpgradeClick}
              >
                Nâng cấp gói
              </Button>
            )}
            {showDowngrade && (
              <Button
                danger
                className="w-full cursor-pointer"
                style={{ marginBottom: "10px" }}
                onClick={() =>
                  openNotification(
                    "Thông báo",
                    "Chức năng hạ gói đang được phát triển."
                  )
                }
              >
                Hạ gói
              </Button>
            )}
            {showRenewal && (
              <Button
                type="default"
                className="w-full"
                onClick={() => setIsModalVisible(true)}
              >
                Gia hạn gói
              </Button>
            )}
            {showPostExpirationRenewal && (
              <Button
                type="default"
                className="w-full"
                onClick={() => setIsModalVisible(true)}
              >
                Gia hạn gói
              </Button>
            )}
            {showBuyPackage && (
              <Button
                type="primary"
                className="w-full cursor-pointer"
                onClick={() => {
                  navigate("/package");
                }}
              >
                Mua gói
              </Button>
            )}
          </div>
        </Card>

        {/* Modal chọn phương thức thanh toán */}
        <Modal
          title={null}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          className="custom-modal"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Chọn phương thức thanh toán
            </h3>
            <p className="text-gray-500 mb-4">
              An toàn để an tâm. Hủy trực tuyến dễ dàng.
            </p>
          </div>
          <div className="border-t border-gray-300 pt-4">
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="mb-4 w-full"
            >
              {/* Tùy chọn thanh toán MoMo */}
              <div className="flex flex-col space-y-4 w-full px-4">
                {/* Tùy chọn thanh toán MoMo */}
                <div
                  className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:shadow-lg w-full"
                  style={{ borderRadius: "5px" }}
                  onClick={() => setPaymentMethod("MoMo")}
                >
                  <div className="flex flex-col">
                    <Radio value="MoMo">Thanh Toán MoMo</Radio>
                    <p className="font-medium">Ví điện tử MoMo</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/MOMOPAY@2x.png"
                      alt="MoMo"
                      className="w-10 h-6"
                    />
                    <i className="fa fa-chevron-right text-gray-400"></i>
                  </div>
                </div>

                {/* Tùy chọn thanh toán VNPay */}
                <div
                  className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:shadow-lg w-full"
                  style={{ borderRadius: "5px" }}
                  onClick={() =>
                    openNotification(
                      "Thông báo",
                      "Chức năng thanh toán bằng VNPay đang phát triển"
                    )
                  }
                >
                  <div className="flex flex-col">
                    <Radio disabled value="VNPay">
                      Thanh Toán VNPay
                    </Radio>
                    <p className="font-medium">Cổng thanh toán VNPay</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="https://tse3.mm.bing.net/th?id=OIP.kklIaX3TV97u5KnjU_Kr4wHaHa&pid=Api&P=0&h=180"
                      alt="VNPay"
                      className="w-8 h-6"
                    />
                    <i className="fa fa-chevron-right text-gray-400"></i>
                  </div>
                </div>

                {/* Tùy chọn thanh toán Ví tiền online */}
                <div
                  className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:shadow-lg w-full"
                  style={{ borderRadius: "5px" }}
                  onClick={() => setPaymentMethod("Wallet")}
                >
                  <div className="flex flex-col">
                    <Radio value="Wallet">Thanh Toán Ví Tiền</Radio>
                    <p className="font-medium">Ví tiền trực tuyến</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="https://tse2.mm.bing.net/th?id=OIP.lcDvZgYIHHzsOt4HRmvMYwHaGW&pid=Api&P=0&h=180"
                      alt="Wallet"
                      className="w-8 h-6"
                    />
                    <i className="fa fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              </div>
            </Radio.Group>
            <div className="flex justify-center mt-4">
              <button
                className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
                onClick={handleConfirm}
                disabled={!paymentMethod}
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </Modal>
        {/* Modal mã giảm giá */}
        <DiscountCodeModal
          visible={isModalCodeVisible}
          onClose={() => setIsModalCodeVisible(false)}
          onPayment={handleConfirmPayment}
        />
      </div>
    </>
  );
};

export default ManagePackage;
