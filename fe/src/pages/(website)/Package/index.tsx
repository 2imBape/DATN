import { Radio, message, notification, Modal } from "antd";
import instance from "@/configs/axios";
import { Package } from "@/interfaces/Package";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DiscountCodeModal from "@/components/Discount";

const PackageComponent: React.FC = () => {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPaymentStatus, setCurrentPaymentStatus] =
    useState<Boolean | null>(null);
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null); // State cho phương thức thanh toán
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );
  const [isModalCodeVisible, setIsModalCodeVisible] = useState<boolean>(false); // State cho modal mã giảm giá
  const [api, contextHolder] = notification.useNotification();

  const type = "withdraw";

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await instance.get("/package");
        setPackages(response.data.data || []);
      } catch (error) {
        console.error("Lỗi tải gói dịch vụ:", error);
        alert("Không thể tải gói dịch vụ, vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    const getPackageUser = async () => {
      try {
        const response = await instance.get(`/payment/package`);
        setCurrentPackage(response.data.data.package);
      } catch (error) {}
    };

    const checkPackageUserFromStorage =
      localStorage.getItem("checkPackageUser");

    setCurrentPaymentStatus(
      checkPackageUserFromStorage === "true"
        ? true
        : checkPackageUserFromStorage === "false"
          ? false
          : null
    );
    getPackageUser();
    fetchPackages();
  }, []);

  console.log(currentPackage);

  const HandlePaymentPackage = async (packageId: string | undefined) => {
    if (!packageId) {
      return message.error("Gói dịch vụ không hợp lệ.");
    }

    setSelectedPackageId(packageId);
    setIsModalVisible(true);
  };
  const HandlePaymentPackageUpgrade = async (packageId: string | undefined) => {
    if (!packageId) {
      return message.error("Gói dịch vụ không hợp lệ.");
    }

    setSelectedPackageId(packageId);
    setIsModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedPackageId || !paymentMethod) {
      return message.error("Vui lòng chọn phương thức thanh toán.");
    }
    setLoadingPackage(selectedPackageId);
    setIsModalVisible(false);
    setIsModalCodeVisible(true);
  };

  const handleConfirmPayment = async (promoCodeId: string | undefined) => {
    if (!selectedPackageId || !paymentMethod) {
      return message.error("Vui lòng chọn phương thức thanh toán.");
    }
    setLoadingPackage(selectedPackageId);
    setIsModalCodeVisible(false);

    const checkPackageUserFromStorage =
      localStorage.getItem("checkPackageUser");
    setCurrentPaymentStatus(
      checkPackageUserFromStorage === "true"
        ? true
        : checkPackageUserFromStorage === "false"
          ? false
          : null
    );
    const isUserHasPackage = checkPackageUserFromStorage === "false";
    const confirmMessage = isUserHasPackage
      ? "Bạn muốn mua gói này không?"
      : "Bạn muốn nâng cấp gói này không?";

    try {
      if (confirm(confirmMessage)) {
        const endpoint = isUserHasPackage ? "select" : "upgrade";
        const response = await instance.post(`/payment/${endpoint}`, {
          packageId: selectedPackageId,
          paymentMethod,
          type: type,
          discount: promoCodeId,
        });

        if (response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          notification.success({
            message: "Mua gói thành công",
            description:
              "Bạn đã mua gói dịch vụ thành công, vui lòng kiểm tra lịch sử!",
          });
          const { data } = await instance.get("payment/package-user");
          const status = data.status;
          localStorage.setItem("checkPackageUser", status);
          setLoadingPackage(null);
          return;
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendError =
          error.response.data.message || "Lỗi thanh toán từ máy chủ.";
        message.error(` ${backendError}`);
      } else {
        message.error("Thanh toán thất bại, vui lòng thử lại sau.");
      }
    } finally {
      setLoadingPackage(null);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Đang tải gói dịch vụ...</div>;
  }

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
      <div className="bg-black text-white py-10">
        <h2 className="text-3xl text-center mb-8">Chọn gói dịch vụ của bạn</h2>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="border border-gray-700 rounded-lg p-6 bg-gray-900 text-center flex flex-col h-full shadow-lg hover:shadow-2xl transition-shadow"
              style={{ borderRadius: "10px" }}
            >
              <h3 className="text-xl font-bold mb-4 text-red-500">
                {pkg.name}
              </h3>
              <p className="text-2xl font-bold mb-4">
                {pkg.price === 0 ? "Free" : `${pkg.price.toLocaleString()} Xu`}
                {pkg.price > 0 && <span className="text-sm"> / tháng</span>}
              </p>
              <ul className="flex items-center justify-center text-center mb-6 space-y-2 flex-1">
                <li>
                  <span>{pkg.description}</span>
                </li>
              </ul>

              {currentPaymentStatus === true && currentPackage ? (
                pkg.price > currentPackage.price ? (
                  <button
                    onClick={() => HandlePaymentPackageUpgrade(pkg._id)}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition transform active:scale-95"
                    disabled={loadingPackage === pkg._id}
                  >
                    {loadingPackage === pkg._id
                      ? "Đang nâng cấp..."
                      : "Nâng cấp"}
                  </button>
                ) : (
                  <button
                    className="bg-gray-600 text-white py-2 px-4 rounded opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Không thể nâng cấp
                  </button>
                )
              ) : (
                <button
                  onClick={() => HandlePaymentPackage(pkg._id)}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition transform active:scale-95"
                  disabled={loadingPackage === pkg._id}
                >
                  {loadingPackage === pkg._id ? "Đang xử lý..." : "Mua gói"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Modal để chọn phương thức thanh toán */}
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
                    openNotification("Thông báo", "Tính năng thanh toán bằng VNPay đang phát triển")
                  }
                >
                  <div className="flex flex-col cursor-pointer">
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

export default PackageComponent;
