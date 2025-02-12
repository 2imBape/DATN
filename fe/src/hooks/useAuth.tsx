import instance from "@/configs/axios";
import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
const useAuth = () => {
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const Register = async (user: {
    name: string;
    email: string;
    password: string;
    username: string;
  }) => {
    try {
      await instance.post("/auth/register", user);

      notification.success({
        message: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email của bạn để xác thực tài khoản.",
        placement: "topRight",
      });
      console.log(error);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Đăng ký thất bại, vui lòng kiểm tra lại thông tin.";
      notification.error({
        message: "Lỗi Đăng Ký",
        description: errorMessage,
      });
    }
  };

  const Login = async (user: {
    username: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    try {
      const response = await instance.post("/auth/login", user);

      const token = response.data.token;
      if (!token) {
        throw new Error("Đăng nhập thất bại: không nhận được token.");
      }

      localStorage.setItem("accessToken", token);

      const userResponse = await instance.get("user/profile");
      const userData = userResponse.data;
      localStorage.setItem("user", JSON.stringify(userData));
      notification.success({
        message: "Đăng nhâp thành công",
      });
      const { data } = await instance.get("payment/package-user");
      const status = data.status;
      localStorage.setItem("checkPackageUser", status);

      if (userData.role === "admin") {
        return { success: true, redirectTo: "/admin" };
      } else if (userData.role === "support") {
        return { success: true, redirectTo: "/support" };
      } else {
        return { success: true, redirectTo: "/" };
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.";
      notification.error({
        message: "Đăng nhập thất bại",
        description: errorMessage,
      });
      return { error: errorMessage };
    }
  };

  const Logout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await instance.post("/auth/logout", {
        token: token,
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("checkPackageUser");
      notification.success({
        message: "Đăng xuất thành công",
      });
      navigate("/");
    } catch (error: any) {
      setError((error as AxiosError)?.message);
      notification.error({
        message: "Đăng xuất thất bại",
        description: error?.response?.data?.message,
      });
    }
  };

  return {
    Register,
    Login,
    Logout,
  };
};

export default useAuth;
