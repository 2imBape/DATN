import ChatModal from "@/components/ChatModal/ChatModal";
import { User } from "@/interfaces/User";
import React, { useEffect, useState } from "react";
import { FaComment } from "react-icons/fa";
import { Outlet } from "react-router-dom";
import Footer from "./_components/Footer";
import Header from "./_components/Header";

const WebsiteLayout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const userData: User = JSON.parse(storedUser);
      setUserId(userData._id ?? null);
    } else {
      setUserId(null);
    }
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
        }}
      >
        <Outlet />
      </div>
      <Footer />
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          cursor: "pointer",
        }}
        onClick={toggleChat}
      >
        <FaComment size={30} />
      </div>
      {isChatOpen && <ChatModal onClose={toggleChat} userId={userId} />}
    </div>
  );
};

export default WebsiteLayout;
