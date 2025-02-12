import React, { useEffect, useState } from "react";
import instance from "@/configs/axios";
import {
  Table,
  Spin,
  Space,
  Popover,
  Button,
  message,
  Modal,
  Image,
  Drawer,
  Typography,
  Input,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Person } from "@/interfaces/Person";

const { Title, Text } = Typography;

const Persons: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [viewMode, setViewMode] = useState<string>("actors"); // Chế độ hiển thị "actors" hoặc "directors"

  useEffect(() => {
    const fetchPersons = async () => {
      setLoading(true);
      try {
        const response = await instance.get("/person");
        setPersons(response.data.persons);
        setFilteredPersons(response.data.persons);
      } catch (err) {
        setError("Failed to fetch persons.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersons();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    const filteredData = persons.filter((person) =>
      person.name.toLowerCase().includes(value.toLowerCase()) ||
      person.role.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredPersons(filteredData);
  };

  const showDetails = (person: any) => {
    setSelectedPerson(person);
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
    setSelectedPerson(null);
  };

  const deletePerson = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa người này không?",
      okText: "Có",
      cancelText: "Không",
      onOk: async () => {
        try {
          await instance.delete(`/person/${id}`);
          setPersons(persons.filter((person) => person._id !== id));
          setFilteredPersons(filteredPersons.filter((person) => person._id !== id));

          message.info({
            content: "Người này đã được xóa khỏi danh sách.",
            duration: 3,
          });
        } catch (err) {
          message.error({
            content: "Có lỗi xảy ra khi xóa người này.",
            duration: 3,
          });
          console.error(err);
        }
      },
      onCancel: () => {
        message.info("Hủy xóa", 3);
      },
      icon: <DeleteOutlined style={{ color: "red" }} />,
      okButtonProps: { danger: true },
      cancelButtonProps: { danger: false },
    });
  };

  // Lọc dữ liệu theo chế độ hiển thị (actors hoặc directors)
  const filteredByRole = filteredPersons.filter(
    (person) => person.role.toLowerCase() === viewMode
  );

  const columns = [
    {
      key: "thumbnail",
      title: "Ảnh",
      dataIndex: "thumbnail",
      width: 200,
      render: (thumbnail: string) => (
        <Image
          width={50}
          src={thumbnail}
          alt="Thumbnail"
          preview={{ src: thumbnail }}
        />
      ),
    },
    { key: "name", title: "Tên", dataIndex: "name", width: 300 },
    { key: "age", title: "Tuổi", dataIndex: "age", width: 200 },
    {
      key: "role",
      title: "Chức vụ",
      dataIndex: "role",
      width: 300,
      render: (text: string) => (
        <Text
          strong
          style={{ color: text === "directors" ? "red" : "#1890ff" }}
        >
          {text.toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (record: any) => (
        <Space size="middle">
          <Popover content="Xem chi tiết" trigger="hover">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => showDetails(record)}
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

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="p-4 bg-gray-80 min-h-screen">
        <h1 className="text-2xl font-bold text-black mb-4">Danh sách {viewMode === "actors" ? "Diễn viên" : "Đạo diễn"}</h1>
        <div className="mb-4 flex flex-col sm:flex-row items-center">
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300, marginBottom: 16, marginLeft: "5px" }}
          />
          <Button type="primary" className="mb-4 text-white hover:bg-green-604" style={{marginLeft: "5px"}}>
            <Link to="/admin/person/add">Thêm người mới</Link>
          </Button>
          <Button
            className={`mb-4 text-white ${viewMode === "actors" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700" }`}
            style={{ marginLeft: "800px" }}
            onClick={() => setViewMode(viewMode === "actors" ? "directors" : "actors")}
          >
            Chuyển sang {viewMode === "actors" ? "Đạo diễn" : "Diễn viên"}
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredByRole}
          rowKey="_id"
          pagination={false}
          className="bg-white shadow-md rounded-lg overflow-hidden"
          style={{ textAlign: "center" }}
        />
      </div>

      <Drawer
        title={
          <Title level={4} style={{ color: "#1890ff" }}>
            Chi tiết người
          </Title>
        }
        placement="right"
        visible={visible}
        onClose={closeDrawer}
        width={400}
        bodyStyle={{ padding: "20px", backgroundColor: "#f0f5ff" }}
      >
        {selectedPerson && (
          <div>
            <div>
              <Text strong style={{ color: "#1890ff" }}>Ảnh:</Text>
              <Image
                width="100%"
                height={"100%"}
                src={selectedPerson.thumbnail}
                alt="Person thumbnail"
                preview={{ src: selectedPerson.thumbnail }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ color: "#1890ff" }}>Tên:</Text>
              <p>{selectedPerson.name}</p>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ color: "#1890ff" }}>Tuổi:</Text>
              <p>{selectedPerson.age}</p>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ color: "#1890ff" }}>Chức vụ:</Text>
              <p style={{ color: "#d40000" }}>{selectedPerson.role.toUpperCase()}</p>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ color: "#1890ff" }}>Mô tả:</Text>
              <p>{selectedPerson.description || "Không có mô tả"}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Persons;
