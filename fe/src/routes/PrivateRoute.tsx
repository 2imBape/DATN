import { Modal } from "antd";
import { type ReactElement, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactElement;
  redirectTo?: string;
  allowedRoles?: string[];
  checkPackageUser?: boolean;
}

const PrivateRoute: React.FC<Props> = ({
  children,
  redirectTo = "/login",
  allowedRoles = [],
  checkPackageUser = false,
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const isAuthenticated = !!token;

  const checkPackageUserFromStorage = localStorage.getItem("checkPackageUser");

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("loginRedirect", window.location.pathname);

      Modal.confirm({
        title: "Bạn chưa đăng nhập",
        content: "Bạn có muốn đăng nhập không?",
        okText: "Có",
        cancelText: "Không",
        onOk() {
          navigate(redirectTo);
        },
        onCancel() {
          navigate(-1);
        },
      });
    }
    // Kiểm tra quyền truy cập dựa trên vai trò
    else if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      navigate("/unauthorized");
    }
    // Kiểm tra nếu người dùng chưa mua gói
    else if (checkPackageUser && checkPackageUserFromStorage === "false") {
      Modal.confirm({
        title: "Bạn chưa mua gói",
        content: "Bạn có muốn mua gói không?",
        okText: "Có",
        cancelText: "Không",
        onOk() {
          navigate("/package");
        },
        onCancel() {
          navigate(-1);
        },
      });
    }
  }, [
    isAuthenticated,
    navigate,
    redirectTo,
    allowedRoles,
    userRole,
    checkPackageUser,
    checkPackageUserFromStorage,
  ]);

  return isAuthenticated ? children : null;
};

export default PrivateRoute;
