import React, { useEffect, useState } from "react";
import instance from "@/configs/axios";
import {
  AutoComplete,
  Button,
  Table,
  Tag,
  notification,
  Pagination,
  Space,
  Popover,
  Drawer,
  Spin,
  Descriptions,
  Avatar,
  List,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, UserOutlined, PercentageOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const DiscountPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalDiscounts, setTotalDiscounts] = useState<number>(0);
  const [limit] = useState<number>(8);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const fetchDiscounts = async (page: number = 1, limit: number = 8, search: string = "") => {
    try {
      const query = `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      const response = await instance.get(`/discount/${query}`);
      setDiscounts(response.data.docs);
      setTotalDiscounts(response.data.totalDocs || 0);
    } catch (error) {
      notification.error({
        message: "Lỗi tải danh sách khuyến mãi",
        description: "Không thể lấy danh sách khuyến mãi, vui lòng thử lại sau.",
      });
    }
  };

  const fetchDiscountDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const response = await instance.get(`/discount/${id}/user`);
      setSelectedDiscount(response.data.data);
    } catch (error) {
      notification.error({
        message: "Lỗi tải chi tiết",
        description: "Không thể tải chi tiết mã giảm giá.",
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchDiscounts(currentPage, limit, searchTerm);
  }, [currentPage, limit, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRemove = async (id: string | undefined) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
        await instance.delete(`/discount/${id}`);
        setDiscounts(discounts.filter((discount) => discount._id !== id));
        notification.success({ message: "Khuyến mãi đã được xóa thành công." });
      }
    } catch (error) {
      notification.error({
        message: "Xóa thất bại",
        description: "Không thể xóa khuyến mãi, vui lòng thử lại sau.",
      });
    }
  };

  const showDrawer = (id: string) => {
    fetchDiscountDetail(id);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedDiscount(null);
  };

  const columns = [
    {
      title: "Mã khuyến mãi",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Tên khuyến mãi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phần trăm giảm giá",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (discount: number) => `${discount}%`,
    },
    {
      title: "Ngày giảm giá",
      dataIndex: "expiry",
      key: "expiry",
    },
    {
      title: "Trạng thái",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "active" ? "green" : "red"}>
          {type === "active" ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (record: any) => (
        <Space size="middle">
          <Popover content="Xem chi tiết" trigger="hover">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => showDrawer(record._id)}
            />
          </Popover>
          <Popover content="Chỉnh sửa" trigger="hover">
            <Link to={`update/${record._id}`}>
              <Button type="primary" icon={<EditOutlined />} />
            </Link>
          </Popover>
        </Space>
      ),
    },
  ];  

  return (
    <div className="p-4 bg-gray-80 min-h-screen">
      <h1 className="text-2xl font-bold text-black mb-4">Danh sách mã giảm giá</h1>
      <div className="mb-4 flex flex-col sm:flex-row items-center">
        <Button type="primary" className="mb-4 bg-green-500 text-white hover:bg-green-600">
          <Link to="/admin/discount/create">Thêm Mã Giảm</Link>
        </Button>
        <AutoComplete
          style={{ width: 300, marginBottom: 16, marginLeft: "5px" }}
          placeholder="Tìm kiếm mã..."
          size="large"
          onSearch={(value) => setSearchTerm(value)}
        />
      </div>
      
      <Table
        columns={columns}
        dataSource={discounts}
        rowKey="_id"
        pagination={false}
        className="bg-white shadow-md rounded-lg overflow-hidden"
      />
      <Pagination current={currentPage} pageSize={limit} total={totalDiscounts} onChange={handlePageChange} style={{marginTop: "10px"}}/>

      <Drawer
        title={`Chi tiết mã giảm giá`}
        placement="right"
        onClose={closeDrawer}
        visible={drawerVisible}
        width={400}
      >
        {loadingDetail ? (
          <Spin size="large" />
        ) : selectedDiscount ? (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên mã">{selectedDiscount.name}</Descriptions.Item>
              <Descriptions.Item label="Mã">{selectedDiscount.code}</Descriptions.Item>
              <Descriptions.Item label="Phần trăm giảm giá">
                {selectedDiscount.discountPercentage} <PercentageOutlined />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giảm giá">{selectedDiscount.expiry} ngày</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedDiscount.isActive ? "green" : "red"}>
                {selectedDiscount.isActive ? "Đang hoạt động" : "Không hoạt động"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <h3 style={{ marginTop: "24px" }}>Người dùng áp dụng</h3>
            {selectedDiscount.applicableUsers?.length ? (
              <List
                itemLayout="horizontal"
                dataSource={selectedDiscount.applicableUsers}
                renderItem={(user: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={user.avatar} icon={<UserOutlined />} />}
                      title={user.name}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <p>Không có người dùng áp dụng.</p>
            )}
          </>
        ) : (
          <p>Không tìm thấy chi tiết.</p>
        )}
      </Drawer>
    </div>
  );
};

export default DiscountPage;