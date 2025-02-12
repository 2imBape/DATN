import React, { useEffect, useState } from "react";
import { Modal, List, Typography, message, Button } from "antd";
import instance from "@/configs/axios";

interface PromoCode {
  _id: string;
  code: string;
  name: string;
  discountPercentage: number;
  isActive: boolean;
  expiry?: Date;
}

const DiscountCodeModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onPayment: (promoCodeId?: string | undefined) => void;
}> = ({ visible, onClose, onPayment }) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [selectedPromoCodeId, setSelectedPromoCodeId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        const response = await instance.get("/discount/user");
        if (Array.isArray(response.data)) {
          setPromoCodes(response.data);
        } else if (response.data && response.data._id) {
          const promoCode: PromoCode = {
            _id: response.data._id,
            code: response.data.code,
            name: response.data.name,
            discountPercentage: response.data.discountPercentage,
            isActive: response.data.isActive,
          };
          setPromoCodes([promoCode]);
        } else {
          console.error("Dữ liệu không hợp lệ");
          message.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
        }
      } catch (error) {
        console.error("Lỗi tải danh sách mã khuyến mãi:", error);
        message.error(
          "Không thể tải danh sách mã khuyến mãi, vui lòng thử lại sau."
        );
      }
    };

    if (visible) {
      fetchPromoCodes();
    }
  }, [visible]);

  const handlePromoCodeSelect = (promoCodeId: string) => {
    setSelectedPromoCodeId(promoCodeId);
  };

  return (
    <Modal
      title="Mã khuyến mãi"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="payment"
          type="primary"
          onClick={() => onPayment(selectedPromoCodeId || undefined)} // Gửi `undefined` nếu không chọn mã
        >
          Thanh toán
        </Button>,
      ]}
    >
      <h3 className="text-lg font-semibold mb-4">Danh sách mã khuyến mãi</h3>
      <List
        bordered
        dataSource={promoCodes}
        locale={{
          emptyText: "Bạn hiện đang không có mã khuyến mãi nào",
        }}
        renderItem={(item) => (
          <List.Item
            style={{
              backgroundColor:
                item._id === selectedPromoCodeId ? "#f0f5ff" : "white",
              opacity: item.isActive ? 1 : 0.5,
              cursor: item.isActive ? "pointer" : "not-allowed",
            }}
            onClick={() => item.isActive && handlePromoCodeSelect(item._id)}
          >
            <Typography.Text
              strong
              style={{
                color: item.isActive
                  ? item._id === selectedPromoCodeId
                    ? "#1890ff" // Màu chữ nổi bật
                    : "black"
                  : "gray",
              }}
            >
              {item.code}
            </Typography.Text>
            <span>{item.isActive ? " (Còn hạn)" : " (Hết hạn)"}</span>
            <br />
            <Typography.Text type="secondary">
              {item.name} - Giảm {item.discountPercentage}%
            </Typography.Text>
            <Typography.Text type="secondary">
              {item.expiry
                ? (() => {
                    const currentDate = new Date();
                    const expiryDate = new Date(item.expiry);
                    const timeDifference =
                      expiryDate.getTime() - currentDate.getTime();
                    const daysRemaining = Math.ceil(
                      timeDifference / (1000 * 60 * 60 * 24)
                    );

                    if (daysRemaining > 0) {
                      return `Còn ${daysRemaining} ngày`;
                    } else {
                      return "Đã hết hạn";
                    }
                  })()
                : "Không có thông tin"}
            </Typography.Text>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default DiscountCodeModal;
