import instance from "@/configs/axios";
import { User } from "@/interfaces/User";
import { formatTime } from "@/utils/utils";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Message {
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  senderName: string;
  senderAvatar: string;
}

const ChatWindow: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchMessages = async () => {
    setModalOpen(!isModalOpen);
    try {
      const response = await instance.get(`contact/messages/${userId}`, {
        params: {
          page: 1,
          limit: 10,
        },
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
      setError("Đã xảy ra lỗi khi lấy tin nhắn.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await instance.get(`/user/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      setError("Đã xảy ra lỗi khi lấy thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchUser();

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await instance.post(`/contact/admin`, {
        userId,
        message,
      });
      setMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setError("Đã xảy ra lỗi khi gửi tin nhắn.");
    }
  };

  return (
    <div className="flex flex-col flex-grow bg-gray-800">
      <div className="p-4 border-b bg-gray-700 text-white flex items-center justify-between">
        <h2 className="text-lg font-bold">
          Chat với {user ? user.name : "Người dùng"}
        </h2>
        <button className="text-gray-300">⋮</button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-900 text-white">
        {loading ? (
          <div className="text-gray-500">Đang tải tin nhắn...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div>Không có tin nhắn nào.</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col">
              <div
                className={`flex items-start space-x-2 ${msg.senderId === userId ? "justify-start" : "justify-end"
                  }`}
              >
                {msg.senderId !== userId ? (
                  <div className="p-3 rounded-[20px] max-w-sm bg-blue-500 text-white border border-blue-700">
                    <span>{msg.message}</span>
                    <div className="text-xs text-gray-300 mt-1 text-right">
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex items-start space-x-2 ${msg.senderId === userId ? "justify-start" : "justify-end"}`}
                  >
                    {msg.senderId !== userId ? (
                      <div className="p-3 rounded-[20px] max-w-sm bg-blue-500 text-white border border-blue-700">
                        <span>{msg.message}</span>
                        <div className="text-xs text-gray-300 mt-1 text-right">
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2 p-3 rounded-[20px] max-w-sm bg-gray-500 text-white border border-gray-700">
                        {/* Kiểm tra avatar */}
                        <div className="w-8 h-8 rounded-full mr-2 bg-gray-600 flex items-center justify-center text-white">
                          {msg.senderAvatar ? (
                            <img
                              src={msg.senderAvatar}
                              alt={`${msg.senderName}'s avatar`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {msg.senderName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <strong>{msg.senderName}: </strong>
                          <span>{msg.message}</span>
                          <div className="text-xs text-gray-300 mt-1 text-right">
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t bg-gray-700 flex items-center">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-600 bg-gray-600 text-white rounded-md"
          placeholder="Nhập tin nhắn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={handleSend}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
