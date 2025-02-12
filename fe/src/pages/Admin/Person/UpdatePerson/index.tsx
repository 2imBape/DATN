import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "@/configs/axios";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Spin,
  Image,
  Typography,
  InputNumber,
} from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";

const { Title } = Typography;

const PersonEditPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [person, setPerson] = useState<any | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      try {
        const response = await instance.get(`/person/${id}`);
        setPerson(response.data.person);
        setThumbnail(response.data.person.thumbnail);
      } catch (error) {
        message.error("Không thể tải thông tin người dùng.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const updatedPerson = {
        ...values,
        thumbnail: thumbnail || values.thumbnail,
      };

      await instance.put(`/person/${id}`, updatedPerson);
      message.success("Cập nhật thông tin thành công!");
      navigate("/admin/person");
    } catch (error) {
      message.error("Cập nhật thông tin thất bại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (fileList: any[]) => {
    setThumbnail(
      fileList.length > 0
        ? URL.createObjectURL(fileList[0].originFileObj)
        : null
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  if (!person) {
    return <div className="text-center">Không có dữ liệu người dùng</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Title level={2} className="text-center mb-6">
        Chỉnh sửa thông tin người dùng
      </Title>
      <Form
        initialValues={person}
        onFinish={handleFinish}
        layout="vertical"
        className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Form.Item
            name="name"
            label={<span className="text-black">Tên người</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input placeholder="Nhập tên người" />
          </Form.Item>

          <Form.Item
            name="age"
            label={<span className="text-black">Tuổi</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="Nhập tuổi"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Form.Item
            label={<span className="text-black">Vai trò</span>}
            name="role"
            rules={[{ required: true, message: "Vai trò là bắt buộc" }]}
          >
            <Select placeholder="Chọn vai trò">
              <Select.Option value="actors">Diễn viên</Select.Option>
              <Select.Option value="directors">Đạo diễn</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-black">Mô tả</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả" />
          </Form.Item>
        </div>

        <Form.Item 
          label={<span className="text-black">Ảnh đại diện</span>}
          name="thumbnail"
        >
          <Upload
            beforeUpload={() => false} // Prevent automatic upload
            onChange={({ fileList }) => handleFileChange(fileList)}
            accept="image/*"
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
          </Upload>
        </Form.Item>

        {/* Hiển thị ảnh đại diện dưới phần tải lên */}
        {thumbnail && (
          <div className="mt-4">
            <Image
              width={100}
              src={thumbnail}
              alt="Current thumbnail"
              preview={false}
            />
          </div>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PersonEditPage;
