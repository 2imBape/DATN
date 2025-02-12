import { Outlet } from "react-router-dom";
import Sidebar from "./_components/bar/indext";

const TelegramLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default TelegramLayout;
