import instance from "@/configs/axios";
import { Button, Form, Input, InputNumber, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddPackage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    durationInMonths: "",
    description: "",
    concurrentDevices: "",
    channels: false, // Đặt mặc định là false vì channels yêu cầu boolean
    premiumSports: false,
    hboGo: false,
    noAds: false,
    kplusChannels: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await instance.post(`/package`, formData);
      message.success(response.data.message);
      navigate(`/admin/packages`);
    } catch (err) {
      const error = err as any;
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  return (
    <div
      className="p-4 min-h-screen"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="bg-white shadow rounded-md p-4 min-h-screen"
        style={{ width: "800px" }}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-2xl font-bold mb-4">
            Tạo Gói Phim
            <Form.Item
              label={<span className="text-black">Tên gói</span>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên gói." }]}
            >
              <Input
                name="name"
                placeholder="Tên gói"
                onChange={handleChange}
                value={formData.name}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-black">Giá</span>}
              name="price"
              rules={[{ required: true, message: "Vui lòng nhập giá." }]}
            >
              <InputNumber
                name="price"
                placeholder="Giá"
                onChange={(value) =>
                  setFormData({ ...formData, price: value || "" })
                }
                value={formData.price}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-black">Thời gian (tháng)</span>}
              name="durationInMonths"
              rules={[{ required: true, message: "Vui lòng nhập thời gian." }]}
            >
              <InputNumber
                name="durationInMonths"
                placeholder="Thời gian (tháng)"
                onChange={(value) =>
                  setFormData({ ...formData, durationInMonths: value || "" })
                }
                value={formData.durationInMonths}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-black">Số thiết bị xem đồng thời</span>
              }
              name="concurrentDevices"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số thiết bị xem đồng thời.",
                },
              ]}
            >
              <InputNumber
                name="concurrentDevices"
                placeholder="Thiết bị xem đồng thời"
                onChange={(value) =>
                  setFormData({ ...formData, concurrentDevices: value || "" })
                }
                value={formData.concurrentDevices}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-black">Mô tả</span>}
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả." }]}
            >
              <Input
                name="description"
                placeholder="Mô tả"
                onChange={handleChange}
                value={formData.description}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Thêm Gói
              </Button>
            </Form.Item>
          </h1>
        </Form>
      </div>
    </div>
  );
}

export default AddPackage;
