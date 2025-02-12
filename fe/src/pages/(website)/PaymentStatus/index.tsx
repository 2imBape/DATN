import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Typography, Divider, Button, Spin, message } from "antd";
import instance from "@/configs/axios";

const { Title, Text } = Typography;

const Bill: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromUrl = searchParams.get("orderId");
    if (idFromUrl) {
      fetchInvoiceDetails(idFromUrl);
    }
  }, [location]);

  const fetchInvoiceDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await instance.post("/payment/status", { orderId });
      if (response.data.packageId) {
        await instance.post(`/payment/select`, {
          packageId: response.data.packageId,
        });
      }
      const { data } = await instance.get("payment/package-user");
      const staTus = data.status;
      localStorage.setItem("checkPackageUser", staTus);

      const {
        status,
        transactionId,
        amount,
        paymentMethod,
        packageName,
        type,
      } = response.data;

      setInvoiceDetails({
        status,
        transactionId,
        amount,
        paymentMethod,
        packageName,
        type,
      });

      message.success("Thông tin hóa đơn đã được tải thành công!");
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      message.error("Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    const printContent = document.getElementById("invoice-content");
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <Card
        id="invoice-content"
        className="w-full max-w-2xl shadow-md"
        bodyStyle={{
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <Title level={3} className="text-center">
          Hóa Đơn Thanh Toán
        </Title>
        <Divider />

        {loading ? (
          <div className="flex justify-center items-center">
            <Spin size="large" />
          </div>
        ) : invoiceDetails ? (
          <>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="mb-4">
                <Text strong>Mã giao dịch: </Text>
                <Text>{invoiceDetails.transactionId}</Text>
              </div>
              {invoiceDetails.type !== "deposit" && (
                <div className="mb-4">
                  <Text strong>Thanh toán: </Text>
                  <Text>{invoiceDetails.packageName}</Text>
                </div>
              )}
              <div className="mb-4">
                <Text strong>Số tiền: </Text>
                <Text>{invoiceDetails.amount} Xu</Text>
              </div>
              <div className="mb-4">
                <Text strong>Phương thức thanh toán: </Text>
                <Text>{invoiceDetails.paymentMethod}</Text>
              </div>
              <div className="mb-4">
                <Text strong>Trạng thái: </Text>
                <Text>{invoiceDetails.status}</Text>
              </div>
              {invoiceDetails.type === "deposit" && (
                <div className="mb-4">
                  <Text strong>Thanh toán: </Text>
                  <Text>Nạp tiền vào ví</Text>
                </div>
              )}
            </div>
          </>
        ) : (
          <Text>Không có thông tin hóa đơn nào để hiển thị.</Text>
        )}
      </Card>

      <div className="flex justify-end mt-5">
        <Button
          type="primary"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handlePrintInvoice}
        >
          In Hóa Đơn
        </Button>
      </div>
    </div>
  );
};

export default Bill;
