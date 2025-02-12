import React, { ReactNode } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import instance from "@/configs/axios";

interface Props {
  url: string;
  title: string;
  children: ReactNode;
}

const OpenWindowPopup: React.FC<Props> = (props) => {
  const { url, title, children } = props;
  const navigate = useNavigate();

  const openPopup = () => {
    const width = 450;
    const height = 730;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const options = `width=${width},height=${height},top=${top},left=${left},menubar=no,location=yes,resizable=no,scrollbars=no,status=no`;

    const popup: Window | null = window.open(url, title, options);

    if (!popup) {
      toast.error("Popup bị chặn. Vui lòng cho phép popup để tiếp tục.");
      return;
    }

    popup.focus();

    const interval = setInterval(async () => {
      try {
        const popupUrl = new URL(popup.location.href);
        const token = popupUrl.searchParams.get("token") || "";

        if (token) {
          localStorage.setItem("accessToken", token);

          try {
            const response = await instance.get("user/profile");
            const userData = response.data;
            localStorage.setItem("user", JSON.stringify(userData));

            // Fetch package user status
            const { data } = await instance.get("payment/package-user");
            const status = data.status;
            localStorage.setItem("checkPackageUser", status);

            toast.success("Đăng nhập thành công!");
            clearInterval(interval);
            popup.close();
            navigate("/");
          } catch (error) {
            toast.error("Không thể lấy thông tin người dùng.");
            clearInterval(interval);
          }
        }
      } catch (error) {
        // Check if the popup is closed, clear the interval
        if (popup.closed) {
          clearInterval(interval);
        }
      }
    }, 1000);
  };

  return (
    <div className="cursor-pointer" onClick={openPopup}>
      {children}
    </div>
  );
};

export default OpenWindowPopup;
