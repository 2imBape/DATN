import React, { ReactNode, useEffect, useState } from "react";
import type { FormProps } from "antd";
import {
  Button,
  Form,
  Input,
  Typography,
  notification,
  Divider,
  Checkbox,
} from "antd";
import { GoogleOutlined, FacebookFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import OpenWindowPopup from "@/components/OpenWindowPopup";
import { User } from "@/interfaces/User";

const { Title } = Typography;

interface Props {
  url: string;
  title: string;
  children?: ReactNode;
}

const LoginPage: React.FC<Props> = () => {
  const { Login } = useAuth();
  const [api, contextHolder] = notification.useNotification();
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const onFinish: FormProps<any>["onFinish"] = async (user: User) => {
    setLoading(true);
    try {
      const result = await Login({ ...user, rememberMe });

      if (result.error) {
        throw new Error(result.error);
      }

      localStorage.setItem("username", user.username);

      api.success({
        message: "Đăng nhập thành công",
        description: "Bạn đã đăng nhập tài khoản thành công!",
        placement: "topRight",
      });

      // Điều hướng dựa trên kết quả từ hàm Login
      const redirectTo = result.redirectTo || "/";
      navigate(redirectTo);
    } catch (error) {
      console.error("Login error:", error);

      api.error({
        message: "Đăng nhập thất bại",
        description:
          (error as Error).message ||
          "Có lỗi xảy ra trong quá trình đăng nhập, vui lòng thử lại!",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<any>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
    api.error({
      message: "Đăng nhập thất bại",
      description: "Vui lòng kiểm tra lại các thông tin đã nhập!",
      placement: "topRight",
    });
  };

  return (
    <div
      className="bg-cover bg-center p-5 flex justify-center items-center min-h-screen"
      style={{
        backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/04bef84d-51f6-401e-9b8e-4a521cbce3c5/null/VN-vi-20240903-TRIFECTA-perspective_b411f1a6-36f2-410a-ade4-2f6b95f21f7e_medium.jpg')`,
      }}
    >
      {contextHolder}
      <div className="p-5 bg-black bg-opacity-80 rounded-lg max-w-md w-full flex flex-col items-center shadow-lg">
        <Title
          level={4}
          style={{ color: "white", textAlign: "center", marginBottom: "20px" }}
        >
          Đăng nhập
        </Title>

        <Form
          name="basic"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="w-full"
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              {
                required: true,
                message: "Vui lòng không bỏ trống tên đăng nhập!",
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/\s/.test(value)) {
                    return Promise.reject(
                      new Error("Tên đăng nhập không được chứa khoảng trắng!")
                    );
                  }
                  if (
                    /[àáạảãâầấậ̉ẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
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
                    return Promise.reject(new Error("Vui lòng điền mật khẩu!"));
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
          >
            <Input.Password
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                color: "white",
              }}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <div className="mb-2 flex justify-between items-center">
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="text-white"
              >
                Nhớ mật khẩu
              </Checkbox>
              <Link to="/forgot-password" className="text-blue-500">
                <u>Bạn quên mật khẩu?</u>
              </Link>
            </div>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <Button
              type="primary"
              style={{ backgroundColor: "red" }}
              htmlType="submit"
              loading={loading}
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider style={{ color: "white" }}>Hoặc</Divider>

          {/* Thêm liên kết đến trang đăng ký */}
          <div className="flex justify-center mb-4">
            <span className="text-white mr-2">Chưa có tài khoản?</span>
            <Link to="/register" className="text-blue-500">
              <u>Đăng ký ngay</u>
            </Link>
          </div>

          <OpenWindowPopup
            url="https://movie.bachtv.click/api/auth/google"
            title="Đăng nhập bằng Google"
          >
            <Button
              type="default"
              icon={<GoogleOutlined />}
              block
              className="bg-red-500 text-white mb-4"
            >
              Google
            </Button>
          </OpenWindowPopup>

          <OpenWindowPopup
            url="https://movie.bachtv.click/api/auth/facebook"
            title="Đăng nhập bằng Facebook"
          >
            <Button
              type="default"
              icon={<FacebookFilled />}
              block
              className="bg-blue-500 text-white"
            >
              Facebook
            </Button>
          </OpenWindowPopup>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
