import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  UnlockFilled,
  WalletOutlined,
  DollarCircleFilled,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { MdOutlineEmail } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";

const { Content, Sider } = Layout;

const Profile: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userProvider = user.provider;

  const menuItems = [
    {
      label: "Hồ sơ",
      key: "1",
      icon: <UserOutlined />,
      path: "/setting",
    },
    userProvider === null && {
      label: "Đổi mật khẩu",
      key: "2",
      icon: <UnlockFilled />,
      path: "/setting/changepassword",
    },
    userProvider === null && {
      label: "Cập nhật email",
      key: "3",
      icon: <MdOutlineEmail />,
      path: "/setting/change-email",
    },
    {
      label: "Lịch sử giao dịch",
      key: "4",
      icon: <DollarCircleFilled />,
      path: "/setting/history",
    },
    {
      label: "Ví tiền",
      key: "5",
      icon: <WalletOutlined />,
      path: "/setting/wallet",
    },
    {
      label: "Quản lý gói",
      key: "6",
      icon: <RiAdminLine />,
      path: "/setting/manage-package",
    },
  ].filter((item): item is Exclude<typeof item, false> => Boolean(item)); // Lọc phần tử không hợp lệ

  const selectedKey = menuItems.find(
    (item) => item.path === location.pathname
  )?.key;

  const selectedKeys = selectedKey ? [selectedKey] : [];

  const handleMenuClick = ({ key }: { key: string }) => {
    const routes: Record<string, string> = {
      "1": "/setting",
      "2": "/setting/changepassword",
      "3": "/setting/change-email",
      "4": "/setting/history",
      "5": "/setting/wallet",
      "6": "/setting/manage-package",
    };
    navigate(routes[key]);
  };

  return (
    <div
      style={{
        width: "1232px",
        margin: "0 auto",
        marginTop: "1%",
        background: "black",
      }}
    >
      <h1 style={{ marginLeft: "5%", fontSize: "2vw", fontWeight: "bolder" }}>
        Cài đặt và quyền riêng tư
      </h1>
      <hr style={{ marginBottom: "10px", marginTop: "5px" }} />
      <Layout style={{ minHeight: "100vh", background: "black" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ background: "black", paddingTop: "30px" }}
        >
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            selectedKeys={selectedKeys}
            mode="inline"
            items={menuItems}
            onClick={handleMenuClick}
            style={{ background: "black" }}
            className="custom-menu"
          />
        </Sider>
        <Layout style={{ background: "black" }}>
          <Content style={{ margin: 0, padding: 24, background: "black" }}>
            <div style={{ minHeight: 360, color: "white" }}>
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Profile;
