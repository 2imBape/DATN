import instance from "@/configs/axios";
import { Package } from "@/interfaces/Package";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Space, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const PackageList = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState(""); // Thêm state cho tìm kiếm
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await instance.get("/package");
        setPackages(response.data.data);
        setFilteredPackages(response.data.data); // Đặt giá trị ban đầu cho filteredPackages
      } catch (error) {
        console.error("Có lỗi xảy ra:", error);
      }
    };
    fetchPackages();
  }, []);

// Hàm lọc gói dịch vụ theo tên
  const handleSearch = (e: any) => {
    const value = e.target.value;
    setSearchText(value);

    if (value) {
      const filtered = packages.filter((pkg) =>
        pkg.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(packages); // Nếu không có gì tìm kiếm, hiển thị tất cả gói dịch vụ
    }
  };

  const handleShowDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Tên Gói",
      dataIndex: "name",
      key: "name",
      width: 500,
      render: (text: string) => <span className="text-blue-600">{text}</span>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 500,
      render: (price: number) => `${price.toLocaleString()}.000 đ`,
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_: any, record: Package) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleShowDetails(record)}
            className="hover:bg-blue-600"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`update/${record._id}`)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-5">
      <Title level={2}>Danh Sách Gói Dịch Vụ</Title>
      <Button
        type="primary"
        onClick={() => navigate("add")}
        className="mb-4 bg-green-500 text-white hover:bg-green-600"
      >
        Thêm Gói Mới
      </Button>
      <Input
        placeholder="Tìm kiếm theo tên gói"
        value={searchText}
        onChange={handleSearch}
        style={{ width: 300, marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredPackages}
        rowKey="_id"
        pagination={false}
      />
      <Modal
        title="Chi Tiết Gói Dịch Vụ"
        visible={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        width={600}
      >
        {selectedPackage && (
          <div className="space-y-4">
            <p>
              <strong>Tên Gói:</strong> {selectedPackage.name}
            </p>
            <p>
              <strong>Giá:</strong> {selectedPackage.price.toLocaleString()}.000
              đ
            </p>
            <p>
              <strong>Mô tả:</strong> {selectedPackage.description}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackageList;
