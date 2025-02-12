import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Avatar,
  message,
  DatePicker,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";
import { User } from "@/interfaces/User";
import { useNavigate } from "react-router-dom";

const CreateDiscount: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async (search: string = "") => {
      try {
        setCurrentPage;
        console.log(totalUsers);
        const query = `?search=${encodeURIComponent(search)}`;
        const response = await instance.get(`/user/all${query}`);
        const { data, pagination } = response.data;

        if (Array.isArray(data)) {
          setUsers(data);
          setTotalUsers(pagination.total || 0);
        } else {
          console.error("API returned unexpected user data format:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUsers();
  }, [currentPage, limit]);

  const onFinish = async (values: any) => {
    const { name, code, discountPercentage, expiry, applicableUsers } = values;
    setLoading(true);

    try {
      await instance.post("/discount", {
        name,
        code,
        discountPercentage,
        expiry,
        applicableUsers,
      });
      message.success("Tạo mã giảm giá thành công!");
      navigate("/admin/discount");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allUserIds = users.map((user) => user._id);
    form.setFieldsValue({ applicableUsers: allUserIds });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        className="bg-white shadow rounded-md p-4 min-h-screen"
        style={{ width: "800px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-2xl font-bold mb-4">Tạo mã giảm giá</h1>

          <Form.Item
            name="name"
            label={<span className="text-black">Tên Mã Gỉảm Giá</span>}
            rules={[{ required: true, message: "Tên mã không được để trống" }]}
          >
            <Input placeholder="Nhập tên mã giảm giá" />
          </Form.Item>

          <Form.Item
            name="code"
            label={<span className="text-black">Mã Gỉảm Giá</span>}
            rules={[
              { required: true, message: "Mã giảm giá không được để trống" },
            ]}
          >
            <Input placeholder="Nhập mã giảm giá" />
          </Form.Item>

          <Form.Item
            name="discountPercentage"
            label={<span className="text-black">Phần Trăm Gỉảm Giá</span>}
            rules={[
              {
                required: true,
                message: "Phần trăm giảm giá không được để trống",
              },
            ]}
          >
            <InputNumber
              min={1}
              max={100}
              placeholder="Nhập phần trăm giảm giá"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="expiry"
            label={<span className="text-black">Ngày hét hạn giảm giá </span>}
            rules={[{ required: true, message: "Vui lòng chọn ngày hết hạn" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Chọn ngày hết hạn"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="applicableUsers"
            label={<span className="text-black">Người Dùng Gỉảm Giá</span>}
            rules={[{ required: true, message: "Vui lòng chọn người dùng" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn người dùng"
              optionLabelProp="label"
              dropdownRender={(menu) => (
                <>
                  <Button
                    type="link"
                    style={{ width: "100%", textAlign: "left" }}
                    onClick={handleSelectAll}
                  >
                    Chọn tất cả
                  </Button>
                  {menu}
                </>
              )}
            >
              {users.map((user) => (
                <Select.Option
                  key={user._id}
                  value={user._id}
                  label={user.name}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={user.avatar}
                      icon={<UserOutlined />}
                      size="small"
                      style={{ marginRight: 8 }}
                    />
                    {user.name}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              Tạo mã giảm giá
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateDiscount;
