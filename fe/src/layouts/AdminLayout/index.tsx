import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./_components/Sidebar";
import HeaderComponent from "./_components/Header";
import { Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout className="site-layout">
        <HeaderComponent toggleTheme={toggleTheme} theme={theme} />
        <Outlet />
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
