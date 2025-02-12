import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import instance from "@/configs/axios";
import { User } from "@/interfaces/User";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: User) => {
    setLoading(true);
    try {
      const response = await instance.post("/auth/forgotPassword", {
        email: values.email,
      });
      message.success(response.data.message);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "20px" }}>
      <h2>Quên mật khẩu</h2>
      <Form onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ email!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Gửi yêu cầu đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;
