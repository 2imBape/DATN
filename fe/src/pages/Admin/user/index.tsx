import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Pagination,
  Input,
  Alert,
  Modal,
  Button,
  Tag,
  Popover,
} from "antd";
import { DollarOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";
import { debounce } from "lodash";
import { User } from "@/interfaces/User";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

const UserTable: React.FC = () => {
  const [payments, setPayments] = useState<User[]>([]);
  const [totalPayments, setTotalPayments] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userPackage, setUserPackage] = useState<any | null>(null);

  const limit = 8;

  const fetchUserPackage = async (userId: string | undefined) => {
    try {
      const response = await instance.get(`/payment/packages/${userId}`);
      setUserPackage(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin gói:", error);
      setUserPackage(null);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    setError("");

    const params: Record<string, any> = {
      page: currentPage,
      limit,
      search: searchTerm || undefined, // Tìm kiếm theo tên người dùng
    };

    try {
      const { data } = await instance.get("user/", { params });
      setPayments(data?.data || []);
      setTotalPayments(data?.pagination.totalUsers || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    }, 300),
    []
  );

  useEffect(() => {
    if (selectedPayment) {
      fetchUserPackage(selectedPayment._id); // Gọi API khi có userId
    }
  }, [selectedPayment]);

  const handleModalOpen = (payment: User) => {
    setSelectedPayment(payment);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPayment(null);
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar: string) =>
        avatar ? (
          <img
            src={avatar}
            alt="User Avatar"
            style={{ width: 50, height: 50, borderRadius: "50%" }}
          />
        ) : (
          <FaUserCircle style={{ width: 50, height: 50, color: "#ccc" }} />
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "Chưa cập nhật",
    },
    {
      key: "balance",
      title: "Số dư ví",
      render: (user: User) => (
        <div>
          {user.wallet && user.wallet.balance !== undefined
            ? `${user.wallet.balance}`
            : "0"}
          <DollarOutlined
            className="text-yellow-400"
            style={{ marginLeft: "5px" }}
          />
        </div>
      ),
    },
    {
      key: "role",
      title: "Vai trò",
      render: (user: User) => (
        <Tag color={user.role === "admin" ? "red" : "green"} key={user._id}>
          {user.role || "Chưa xác định"}
        </Tag>
      ),
    },
    {
      key: "Xác thực",
      title: "Xác thực",
      render: (user: User) => (
        <Tag color={user.isVerified ? "blue" : "orange"} key={user._id}>
          {user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
        </Tag>
      ),
    },
    {
      key: "action",
      title: "Hành động",
      render: (_: any, user: User) => (
        <>
          <Popover content="Xem chi tiết" trigger="hover">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleModalOpen(user)}
            />
          </Popover>
          <Popover content="Chỉnh sửa" trigger="hover">
            <Link to={`/admin/users/update/${user._id}`}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                style={{ marginLeft: "5px" }}
              />
            </Link>
          </Popover>
        </>
      ),
    },
  ];

  return (
    <div>
      {error && <Alert message={error} type="error" />}
      <Input
        style={{
          width: "300px",
          paddingLeft: "10px",
          marginLeft: "10px",
          borderRadius: "15px",
        }}
        placeholder="Tìm kiếm theo tên và email"
        onChange={(e) => debouncedSearch(e.target.value)}
        className="mb-4"
        prefix={<SearchOutlined />}
      />

      <Table
        columns={columns}
        dataSource={payments}
        rowKey="_id"
        pagination={false}
        loading={loading}
      />
      <Pagination
        current={currentPage}
        total={totalPayments}
        pageSize={limit}
        onChange={setCurrentPage}
        showSizeChanger={false}
        style={{ marginTop: 16 }}
      />
      <Modal
        title="Chi tiết người dùng"
        visible={isModalVisible}
        onOk={handleModalClose}
        onCancel={handleModalClose}
      >
        {selectedPayment && (
          <div className="p-6 bg-white rounded-lg shadow-md space-y-4 text-gray-800">
            {/* Avatar */}
            <div className="flex justify-center">
              {selectedPayment.avatar ? (
                <img
                  src={selectedPayment.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <FaUserCircle
                  style={{
                    width: 80,
                    height: 80,
                    color: "#ccc",
                    borderRadius: "50%",
                    border: "2px solid #3b82f6",
                  }}
                />
              )}
            </div>

            {/* User details */}
            <p className="text-lg font-semibold">
              <span className="font-bold text-blue-500">Tên: </span>
              {selectedPayment.name}
            </p>
            <p className="text-lg">
              <span className="font-bold text-blue-500">Email: </span>
              {selectedPayment.email}
            </p>
            <p className="text-lg">
              <span className="font-bold text-blue-500">Số điện thoại: </span>
              {selectedPayment.phone || "Chưa xác định"}
            </p>
            <p className="text-lg">
              <span className="font-bold text-blue-500">Role: </span>
              {selectedPayment.role}
            </p>
            <p className="text-lg">
              <span className="font-bold text-blue-500">Số dư còn lại: </span>
              {selectedPayment.wallet?.balance || "0"} Xu
            </p>
            <p className="text-lg">
              <span className="font-bold text-blue-500">Đang dùng gói: </span>
              {userPackage ? (
                <>
                  {userPackage.package.name} - Hạn sử dụng:{" "}
                  {(() => {
                    const expirationDate = new Date(userPackage.expirationDate);
                    const currentDate = new Date();

                    if (isNaN(expirationDate.getTime())) {
                      return "Ngày hết hạn không hợp lệ";
                    }

                    const timeDifference =
                      expirationDate.getTime() - currentDate.getTime();
                    const daysLeft = Math.floor(
                      timeDifference / (1000 * 3600 * 24)
                    );

                    if (daysLeft > 0) {
                      return `Còn ${daysLeft} ngày`;
                    } else if (daysLeft === 0) {
                      return "Hạn sử dụng hôm nay";
                    } else {
                      return "Hết hạn";
                    }
                  })()}
                </>
              ) : (
                "Chưa mua gói nào"
              )}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserTable;
