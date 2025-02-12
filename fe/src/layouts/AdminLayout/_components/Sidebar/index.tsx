import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CreditCardOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { FaProductHunt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false); // Quản lý trạng thái thu gọn

  // Helper function to find the matching menu key based on pathname
  const getMenuKey = (pathname: any) => {
    if (pathname.startsWith("/admin/users")) return "2";
    if (pathname.startsWith("/admin/person")) return "3";
    if (pathname.startsWith("/admin/discount")) return "7";
    if (pathname.startsWith("/admin/movies")) return "4";
    if (pathname.startsWith("/admin/payments")) return "5";
    if (pathname.startsWith("/admin/packages")) return "6";
    return "1";
  };

  // Get the current menu key based on the pathname
  const currentKey = getMenuKey(location.pathname);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(collapsedState) => setCollapsed(collapsedState)}
    >
      {/* Logo hiển thị dựa trên trạng thái collapsed */}
      <div
        className="logo"
        style={{
          padding: "16px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: collapsed ? "0" : "10px", // Giãn cách khi mở rộng
        }}
      >
        <i
          className="bx bx-movie-play bx-tada main-color"
          style={{ fontSize: "24px" }}
        ></i>
        {!collapsed && ( // Chỉ hiển thị chữ khi sidebar mở rộng
          <span
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "opacity 0.3s", // Hiệu ứng mờ dần
            }}
          >
            Movie Store
          </span>
        )}
      </div>

      <Menu theme="dark" selectedKeys={[currentKey]} mode="inline">
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/admin">Thống kê</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />}>
          <Link to="/admin/users">Quản lý người dùng</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<TeamOutlined />}>
          <Link to="/admin/person">Quản lý đạo diễn/diễn viên</Link>
        </Menu.Item>
        <Menu.Item key="7" icon={<DollarCircleOutlined />}>
          <Link to="/admin/discount">Quản lý mã giảm giá</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<FaProductHunt />}>
          <Link to="/admin/movies">Quản lý phim</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<CreditCardOutlined />}>
          <Link to="/admin/payments">Quản lý thanh toán</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<FolderOpenOutlined />}>
          <Link to="/admin/packages">Quản lý gói phim</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
