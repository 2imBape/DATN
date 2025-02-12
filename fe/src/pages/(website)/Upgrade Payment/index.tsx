import React, { useEffect, useState } from "react";
import { Package } from "@/interfaces/Package"; // Đảm bảo import đúng từ vị trí của bạn
import instance from "@/configs/axios";
import { useParams } from "react-router-dom";
import { Radio, Button, Spin, Card, Typography, message } from "antd";

const { Title, Text } = Typography;

const UpgradePayment: React.FC = () => {
  const [packageDetails, setPackageDetails] = useState<Package | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const { id } = useParams();

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const response = await instance.get(`/package/${id}`);
        if (response.data.data) {
          setPackageDetails(response.data.data);
        } else {
          console.error("Unexpected response structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching package:", error);
        message.error("Không thể tải gói dịch vụ, vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [id]);

  const handlePayment = async () => {
    try {
      const response = await instance.post(`/payment/upgrade`, {
        packageId: id,
        paymentMethod: paymentMethod,
      });

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        message.error("Nâng cấp thanh toán thất bại, vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      message.error("Nâng cấp thanh toán thất bại, vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div className="flex flex-col items-center p-5">
      <Card className="w-full max-w-lg">
        <Title level={2}>Nâng Cấp Gói Dịch Vụ</Title>
        {packageDetails && (
          <>
            <Text strong>{packageDetails.name}</Text>
            <br />
            <Text className="mb-2">Giá: {packageDetails.price} VNĐ</Text>
            <Text className="mb-4">
              <br />
              Thời gian: {packageDetails.durationInMonths} tháng
            </Text>
            <br />
            <Text className="mb-4">Mô tả: {packageDetails.description}</Text>

            <Title level={4}>Chọn Phương Thức Thanh Toán</Title>
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="mb-4"
            >
              <Radio value="MoMo">Thanh Toán MoMo</Radio>
              <Radio value="VNPay">Thanh Toán VNPay</Radio>
              <Radio value="Wallet">Thanh Toán Bằng Ví</Radio>
            </Radio.Group>

            <Button type="primary" onClick={handlePayment} block>
              Nâng Cấp
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default UpgradePayment;
