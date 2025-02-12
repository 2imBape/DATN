import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import instance from "@/configs/axios";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState<string>("");

  // Get user name from localStorage when the modal is opened
  useEffect(() => {
    if (!isOpen) return;

    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserName(parsedUser?.username || "User");
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await instance.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      notification.success({
        message: "Đăng xuất thành công",
      });
      navigate("/login");
    } catch (error) {
      notification.error({
        message: "Đăng xuất thất bại",
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100%",
        backgroundColor: "rgba(107, 114, 128, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        zIndex: 50,
      }}
    >
      <div
        ref={modalRef}
        className="bg-white w-[280px] h-full p-6 shadow-lg relative"
        style={{ color: "black" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-lg font-bold"
          style={{ color: "black" }}
        >
          <IoMdClose />
        </button>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBS9bJEXw5AYRgmLY_9Nyr79oQFPYEtJjmhA&s"
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2
          className="text-center text-xl font-semibold"
          style={{ color: "black" }}
        >
          {userName}
        </h2>
        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
