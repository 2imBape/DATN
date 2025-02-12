import { useState } from "react";
import { Button, Form, Input, Typography, notification } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import instance from "@/configs/axios";

const { Title } = Typography;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      notification.error({ message: "Mật khẩu xác nhận không khớp" });
      return;
    }

    try {
      await instance.post(`/auth/resetPassword/${token}`, {
        newPassword,
        confirmPassword,
      });

      api.success({ message: "Mật khẩu đã được đặt lại thành công" });
      navigate("/login");
    } catch (error) {
      notification.error({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/04bef84d-51f6-401e-9b8e-4a521cbce3c5/null/VN-vi-20240903-TRIFECTA-perspective_b411f1a6-36f2-410a-ade4-2f6b95f21f7e_medium.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      {contextHolder}
      <div
        style={{
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Title
          level={4}
          style={{ textAlign: "center", color: "white", marginBottom: "20px" }}
        >
          Đặt lại mật khẩu
        </Title>

        <Form
          name="reset-password"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={handleResetPassword}
          autoComplete="off"
          style={{ width: "100%" }}
        >
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
              }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
          >
            <Input.Password
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
              }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <Button
              type="primary"
              style={{ backgroundColor: "red", width: "100%" }}
              htmlType="submit"
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
