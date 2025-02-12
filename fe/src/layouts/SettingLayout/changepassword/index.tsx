import { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import instance from "@/configs/axios";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.provider;

    if (userRole !== null) {
      message.error("Bạn không thể đổi mật khẩu");
      navigate(-1);
    }
  }, [navigate]);

  const onFinish = async (values: any) => {
    const { currentPassword, newPassword, confirmPassword } = values;
    setLoading(true);
    try {
      const response = await instance.put("/auth/changePassword", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.status === 200) {
        message.success(response.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        message.error(error.response.data.message);
      } else {
        message.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "20px" }}>
      <h1 style={{ fontWeight: "bolder", fontSize: "1.2vw" }}>Đổi mật khẩu</h1>
      <hr style={{ marginBottom: "10px" }} />
      <Form
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }}
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
        >
          <Input.Password placeholder="Vui lòng nhập mật khẩu hiện tại"/>
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới của bạn"/>
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp")
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới của bạn"/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đổi mật khẩu
          </Button>
        </Form.Item>

      </Form>
    </div>
  );
};

export default ChangePassword;
