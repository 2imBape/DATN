import React, { useEffect, useState } from "react";
import { Input, Button, List, notification } from "antd";
import instance from "@/configs/axios";
import { formatTime } from "@/utils/utils";

interface ChatModalProps {
  onClose: () => void;
  userId: string | null;
}

interface ChatMessage {
  senderId: string | null;
  senderName: string;
  senderAvatar: string;
  message: string;
  createdAt: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose, userId }) => {
  const [messageText, setMessageText] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false); // Thêm state để kiểm soát trạng thái gửi
  const limit = 20;

  useEffect(() => {
    fetchChatHistory();
    const interval = setInterval(() => {
      fetchChatHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await instance.get<{ chatHistory: ChatMessage[] }>(
        `/contact/?page=1&limit=${limit}`
      );
      const newMessages = response.data.chatHistory.map((msg: ChatMessage) => ({
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        message: msg.message,
        createdAt: msg.createdAt,
      }));

      setChatHistory((prev) => {
        const uniqueMessages = newMessages.filter(
          (msg) => !prev.some((prevMsg) => prevMsg.createdAt === msg.createdAt)
        );
        return [...prev, ...uniqueMessages];
      });
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử trò chuyện:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await instance.post("contact", { message: messageText });
      // Giả sử response.data.messageData chứa dữ liệu của tin nhắn vừa gửi
      if (response.data.messageData) {
        setChatHistory((prev) => [...prev, response.data.messageData]);
      }

      setMessageText("");
      notification.success({ message: response.data.message });
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      notification.error({
        message: "Đã xảy ra lỗi trong quá trình gửi tin nhắn",
      });
    } finally {
      setIsSending(false); // Đánh dấu kết thúc gửi
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "20px",
        width: "400px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #ddd",
          color: "black",
        }}
      >
        <strong>Liên hệ với chúng tôi</strong>
        <Button onClick={onClose} style={{ float: "right" }}>
          Đóng
        </Button>
      </div>
      <List
        bordered
        dataSource={chatHistory}
        renderItem={(item) => (
          <List.Item
            style={{
              display: "flex",
              justifyContent:
                item.senderId === userId ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: item.senderId === userId ? "row-reverse" : "row",
                maxWidth: "100%",
              }}
            >
              {/* Hiển thị avatar nếu không phải người dùng */}
              {item.senderId !== userId && (
                <img
                  src={item.senderAvatar}
                  alt={`${item.senderName}'s avatar`}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    margin:
                      item.senderId === userId ? "0 0 0 10px" : "0 10px 0 0",
                  }}
                />
              )}
              <div
                style={{
                  backgroundColor:
                    item.senderId === userId ? "#e6f7ff" : "#fafafa",
                  color: "black",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  padding: "10px",
                  borderRadius: "10px",
                  display: "inline-block",
                  textAlign: "left",
                  wordBreak: "break-word",
                }}
              >
                <strong>
                  {item.senderId === userId ? "Bạn" : item.senderName}:
                </strong>
                <div>{item.message}</div>
                <div
                  style={{ fontSize: "0.8em", color: "gray", marginTop: "5px" }}
                >
                  {formatTime(item.createdAt)}
                </div>
              </div>
            </div>
          </List.Item>
        )}
        style={{ maxHeight: "300px", overflowY: "auto", padding: "10px" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "10px",
          marginBottom: "20px",
        }}
      >
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          style={{ borderRadius: "4px", width: "80%" }}
        />
        <Button
          type="primary"
          onClick={handleSendMessage}
          disabled={isSending} // Vô hiệu hóa nút nếu đang gửi
          style={{ marginLeft: "10px" }}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default ChatModal;
