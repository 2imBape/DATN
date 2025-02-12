import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Image,
} from "antd";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import instance from "@/configs/axios";
import { Person } from "@/interfaces/Person";

const { Option } = Select;

const AddPerson: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (fileList: any[]) => {
    setFileList(fileList.slice(-1));
  };

  const handleSubmit = async (values: Person) => {
    console.log(values); // Kiểm tra giá trị của form trước khi gửi
  
    if (fileList.length === 0) {
      message.error("Vui lòng tải lên ảnh đại diện.");
      return;
    }
  
    setUploading(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("age", String(values.age));
    formData.append("role", values.role);
    formData.append("description", values.description || '');
  
    // Thêm ảnh đại diện vào formData nếu có
    const thumbnailFile = fileList[0]?.originFileObj;
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    } else {
      message.error("Ảnh đại diện không hợp lệ.");
      setUploading(false);
      return;
    }
  
    try {
      await instance.post("/person", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      message.success("Thêm người thành công!");
      form.resetFields();
      setFileList([]);
      navigate("/admin/person");
    } catch (error: any) {
      console.error("Lỗi khi thêm người:", error.response?.data);
      message.error(
        error.response?.data?.message ||
          "Không thể thêm người. Kiểm tra lại dữ liệu!"
      );
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="p-4 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-black mb-4 text-center">Thêm người mới</h1>

        <div className="grid grid-cols-2 gap-4">
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

          <Form.Item
            name="role"
            label={<span className="text-black">Vai trò</span>}
            rules={[{ required: true, message: "Không được bỏ trống" }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="actors">Diễn viên</Option>
              <Option value="directors">Đạo diễn</Option>
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
          name="thumbnail"
          label={<span className="text-black">Ảnh đại diện</span>}
          rules={[{ required: true, message: "Vui lòng tải lên ảnh đại diện." }]}
        >
          <Upload
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList }) => handleFileChange(fileList)}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Form.Item>

        {fileList.length > 0 && (
          <Image
            width={100}
            src={URL.createObjectURL(fileList[0].originFileObj)}
            preview={false}
          />
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={uploading}
            className="w-full"
          >
            {uploading ? "Đang tải lên..." : "Thêm người"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddPerson;
