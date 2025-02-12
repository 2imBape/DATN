import React, { useState, useEffect } from "react";
import { message, Card, Select, Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import instance from "@/configs/axios";

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await instance.get(`/user/${id}`);
        setUser(response.data);
        setRole(response.data.role);
      } catch (error) {
        console.error("Error fetching user details:", error);
        message.error("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
  };

  const handleSubmit = async () => {
    try {
      await instance.put(`/user/${id}`, { role });
      message.success("Cập nhật vai trò thành công.");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error updating user role:", error);
      message.error("Không thể cập nhật vai trò.");
    }
  };

  if (loading) return <div>Đang tải thông tin...</div>;

  if (!user) return <div>Không tìm thấy thông tin người dùng.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">
        Thông tin người dùng
      </h1>
      <Card className="max-w-md">
        <p>
          <strong>Tên:</strong> {user.name}
        </p>
        <p>
          <strong>Tài khoản:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {user.phone}
        </p>
        <p>
          <strong>Vai trò:</strong>
          <Select
            value={role}
            onChange={handleRoleChange}
            style={{ width: 200, marginLeft: 8 }}
          >
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="user">Người dùng</Select.Option>
            <Select.Option value="support">Chăm sóc khách hàng</Select.Option>
          </Select>
        </p>
        <Button type="primary" onClick={handleSubmit} className="mt-4">
          Lưu vai trò
        </Button>
      </Card>
    </div>
  );
};

export default UserEdit;
