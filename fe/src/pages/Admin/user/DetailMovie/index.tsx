import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import instance from "@/configs/axios";
import { Spin, message } from "antd";

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await instance.get(`user/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        message.error("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) return <Spin tip="Đang tải thông tin..." />;

  if (!user) return <div>Không tìm thấy thông tin người dùng.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Thông tin người dùng
      </h1>
      <div className="bg-white shadow-2xl rounded-xl p-8">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4 mb-4">
            <div className="flex justify-between items-center text-gray-800 p-4 rounded-lg border border-gray-200">
              <span className="font-bold text-lg">Tên:</span>
              <span>{user.name}</span>
            </div>
          </div>
          <div className="w-full px-4 mb-4">
            <div className="flex justify-between items-center bg-transparent text-gray-800 p-4 rounded-lg border border-gray-200">
              <span className="font-bold text-lg">Tài khoản:</span>
              <span>{user.username}</span>
            </div>
          </div>
          <div className="w-full px-4 mb-4">
            <div className="flex justify-between items-center bg-transparent text-gray-800 p-4 rounded-lg border border-gray-200">
              <span className="font-bold text-lg">Email:</span>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="w-full px-4 mb-4">
            <div className="flex justify-between items-center bg-transparent text-gray-800 p-4 rounded-lg border border-gray-200">
              <span className="font-bold text-lg">Số điện thoại:</span>
              <span>{user.phone || "Chưa xác định"}</span>
            </div>
          </div>
          <div className="w-full px-4 mb-4">
            <div className="flex justify-between items-center bg-transparent text-gray-800 p-4 rounded-lg border border-gray-200">
              <span className="font-bold text-lg">Loại:</span>
              <span>{user.role || "Chưa xác định"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
