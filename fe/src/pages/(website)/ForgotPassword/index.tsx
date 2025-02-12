import { useState } from "react";
import { Button, Form, Input, Typography, notification } from "antd";
import instance from "@/configs/axios";

const { Title } = Typography;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [api, contextHolder] = notification.useNotification();

  const handleForgotPassword = async () => {
    try {
      await instance.post("/auth/forgotPassword", { email });
      api.success({
        message: "Email đã được gửi",
        description: "Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.",
      });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        api.error({
          message: "Email không tồn tại",
          description: "Vui lòng nhập địa chỉ email hợp lệ.",
        });
      } else if (error.response && error.response.status === 500) {
        api.error({
          message: "Lỗi khi gửi email",
          description: "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.",
        });
      } else {
        api.error({
          message: "Có lỗi xảy ra",
          description: "Vui lòng thử lại.",
        });
      }
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
          Quên mật khẩu
        </Title>

        <Form
          name="forgot-password"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          style={{ width: "100%" }}
          onFinish={handleForgotPassword}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ email!" },
            ]}
          >
            <Input
              type="email"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 24 }}>
            <Button
              type="primary"
              style={{ backgroundColor: "red", width: "100%" }}
              htmlType="submit"
            >
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
