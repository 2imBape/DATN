import React from "react";
import type { FormProps } from "antd";
import { Button, Form, Input, Typography, notification } from "antd";
import { User } from "@/interfaces/User";
import useAuth from "@/hooks/useAuth";
import { NavLink } from "react-router-dom";

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const { Register } = useAuth();
  const [api, contextHolder] = notification.useNotification();

  const onFinish: FormProps<any>["onFinish"] = async (user: any) => {
    try {
      await Register(user);
    } catch (error) {
      api.error({
        message: "Đăng ký thất bại",
        description: "Có lỗi xảy ra trong quá trình đăng ký, vui lòng thử lại!",
        placement: "topRight",
      });
    }
  };

  const onFinishFailed: FormProps<any>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
    api.error({
      message: "Đăng ký thất bại",
      description: "Vui lòng kiểm tra lại các thông tin đã nhập!",
      placement: "topRight",
    });
  };

  return (
    <div
      style={{
        backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/04bef84d-51f6-401e-9b8e-4a521cbce3c5/null/VN-vi-20240903-TRIFECTA-perspective_b411f1a6-36f2-410a-ade4-2f6b95f21f7e_medium.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px",
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
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          marginTop: "-40px",
        }}
      >
        <div style={{ flex: 1 }}>
          <Title
            level={4}
            style={{
              textAlign: "center",
              color: "white",
              marginBottom: "20px",
            }}
          >
            Đăng ký thành viên
          </Title>

          <Form
            name="basic"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 13 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng không bỏ trống họ và tên!",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    if (/^\s/.test(value)) {
                      return Promise.reject(
                        new Error(
                          "Họ và tên không được bắt đầu bằng khoảng trắng!"
                        )
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
              style={{ color: "white" }}
            >
              <Input
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  color: "white",
                }}
              />
            </Form.Item>

            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Vui lòng không bỏ trống tên đăng nhập!",
                },
                { min: 4, message: "Tên đăng nhập phải chứa ít nhất 4 kí tự!" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (/\s/.test(value)) {
                      return Promise.reject(
                        new Error("Tên đăng nhập không được chứa khoảng trắng!")
                      );
                    }
                    if (
                      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
                        value
                      )
                    ) {
                      return Promise.reject(
                        new Error("Tên đăng nhập không được chứa dấu!")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ color: "white" }}
            >
              <Input
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  color: "white",
                }}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng không bỏ trống email!" },
                { type: "email", message: "" },
                {
                  pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                  message: "Email phải thuộc định dạng Gmail!",
                },
              ]}
              style={{ color: "white" }}
            >
              <Input
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  color: "white",
                }}
              />
            </Form.Item>

            <Form.Item<User>
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "" },
                {
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(
                        new Error("Vui lòng điền mật khẩu!")
                      );
                    }
                    if (value.length < 6) {
                      return Promise.reject(
                        new Error("Mật khẩu phải có ít nhất 6 ký tự!")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ color: "white" }}
            >
              <Input.Password
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  color: "white",
                }}
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu xác nhận!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu không trùng khớp!")
                    );
                  },
                }),
              ]}
              style={{ color: "white" }}
            >
              <Input.Password
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  color: "white",
                }}
              />
            </Form.Item>

            <Form.Item
              label="Mã giới thiệu"
              name="referredBy"
              rules={[
                {
                  required: false,
                  message: "Vui lòng kiểm tra mã giới thiệu hợp lệ!",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (/^\s/.test(value)) {
                      return Promise.reject(
                        new Error(
                          "Mã giới thiệu không được bắt đầu bằng khoảng trắng!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ color: "white" }}
            >
              <Input
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  color: "white",
                }}
                placeholder="Nhập mã giới thiệu (nếu có)"
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 13 }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: "white" }}>Bạn đã có tài khoản? </span>
                <NavLink to="/login" style={{ color: "#1890ff" }}>
                  Đăng nhập ngay
                </NavLink>
              </div>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
              <Button
                type="primary"
                style={{ backgroundColor: "red", width: "100%" }}
                htmlType="submit"
              >
                Đăng Ký
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
