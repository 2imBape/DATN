import React, { useEffect, useState } from "react";
import { Package } from "@/interfaces/Package"; // Đảm bảo import đúng từ vị trí của bạn
import instance from "@/configs/axios";
import { useParams } from "react-router-dom";
import { message, Spin } from "antd";

const Payment: React.FC = () => {
  const [packageDetails, setPackageDetails] = useState<Package | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await instance.post(`/payment/select`, {
          packageId: id,
        });
        if (response.data.data) {
          setPackageDetails(response.data.data);
          console.log(packageDetails);
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

    fetchPayment();
  }, [id]);

  if (loading) {
    return <Spin size="large" />;
  }

  return <div className="flex flex-col items-center p-5"></div>;
};

export default Payment;
