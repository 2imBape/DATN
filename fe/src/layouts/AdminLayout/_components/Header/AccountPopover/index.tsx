import React from "react";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";

const AccountPopover: React.FC = (): JSX.Element => {
  return (
    <div className="w-[140px] font-medium">
      <li className="h-[40px] w-[100%] inline-flex items-center pl-2 pr-2 hover:cursor-pointer hover:bg-[#E6F4FF] rounded-lg">
        <FaRegUser className="mr-2" /> Trang cá nhân
      </li>
      <div className="border-[0.1px]"></div>
      <li className="h-[40px] w-[100%] inline-flex items-center pl-2 pr-2 hover:cursor-pointer hover:bg-[#E6F4FF] rounded-lg">
        <MdOutlineLogout className="mr-2" />
        Đăng xuất
      </li>
    </div>
  );
};

export default AccountPopover;
