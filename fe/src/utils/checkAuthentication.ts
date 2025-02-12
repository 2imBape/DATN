// checkAuthentication.ts

import { Modal } from "antd";
import { NavigateFunction } from "react-router-dom";

export const checkAuthentication = (
  redirectTo: string,
  navigate: NavigateFunction
): boolean => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    Modal.confirm({
      title: "Bạn chưa đăng nhập",
      content: "Bạn có muốn đăng nhập không?",
      okText: "Có",
      cancelText: "Không",
      onOk() {
        navigate(redirectTo);
      },
    });
    return false;
  }

  return true;
};
