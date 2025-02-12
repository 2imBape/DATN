import React, { useEffect } from "react";
import { Button, Form, Input, InputNumber, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import instance from "@/configs/axios";

type FieldType = {
  name?: string;
  price?: number;
  durationInMonths?: number;
  description?: string;
  concurrentDevices?: number;
  channels?: boolean;
  premiumSports?: boolean;
  noAds?: boolean;
  kplusChannels?: boolean;
  hboGo?: boolean;
};

const EditPackage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["packages", id],
    queryFn: () => instance.get(`/package/${id}`),
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (packages: FieldType) =>
      instance.put(`/package/${id}`, packages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      message.success("Cập nhật gói phim thành công");
      navigate(`/admin/packages`);
    },
    onError: () => message.error("Cập nhật gói phim thất bại"),
  });

  useEffect(() => {
    if (data && data.data && data.data.data) {
      form.setFieldsValue({
        name: data.data.data.name,
        price: data.data.data.price,
        durationInMonths: data.data.data.durationInMonths,
        description: data.data.data.description,
        concurrentDevices: data.data.data.concurrentDevices,
        channels: data.data.data.channels || false,
        premiumSports: data.data.data.premiumSports || false,
        noAds: data.data.data.noAds || false,
        kplusChannels: data.data.data.kplusChannels || false,
        hboGo: data.data.data.hboGo || false,
      });
    }
  }, [data, form]);

  const onFinish = (values: FieldType) => {
    const updatedValues = {
      ...values,
      channels: values.channels ?? false,
      premiumSports: values.premiumSports ?? false,
      noAds: values.noAds ?? false,
      kplusChannels: values.kplusChannels ?? false,
      hboGo: values.hboGo ?? false,
    };

    console.log("Data being sent to API:", updatedValues);

    mutate(updatedValues);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4 min-h-screen">
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
          >
        <h1 className="text-2xl font-black mb-4 text-center">Chỉnh Sửa Gói Phim</h1>
        <Form.Item<FieldType>
            label={
              <span className="block text-gray-700 font-medium">Tên gói</span>
            }
            name="name"
            rules={[{ required: true, message: "Bắt buộc nhập!" }]}
          >
            <Input className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </Form.Item>

          <Form.Item<FieldType>
            label={
              <span className="block text-gray-700 font-medium">Giá gói</span>
            }
            name="price"
            rules={[
              { required: true, message: "Bắt buộc nhập!" },
              { type: "number", min: 0, message: "Phải là số dương" },
            ]}
          >
            <InputNumber className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </Form.Item>

          <Form.Item<FieldType>
            label={
              <span className="block text-gray-700 font-medium">
                Thời gian (tháng)
              </span>
            }
            name="durationInMonths"
            rules={[{ required: true, message: "Bắt buộc nhập!" }]}
          >
            <InputNumber className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </Form.Item>

          <Form.Item<FieldType>
            label={
              <span className="block text-gray-700 font-medium">
                Thiết bị xem đồng thời
              </span>
            }
            name="concurrentDevices"
            rules={[{ required: true, message: "Bắt buộc nhập!" }]}
          >
            <InputNumber className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </Form.Item>

          <Form.Item<FieldType>
            label={
              <span className="block text-gray-700 font-medium">
                Mô tả gói phim
              </span>
            }
            name="description"
            rules={[{ required: true, message: "Bắt buộc nhập!" }]}
          >
            <TextArea className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </Form.Item>

          {/* Các trường ẩn với giá trị mặc định */}
          <Form.Item name="channels" style={{ display: "none" }}>
            <Input value={false as unknown as string} />
          </Form.Item>
          <Form.Item name="premiumSports" style={{ display: "none" }}>
            <Input value={false as unknown as string} />
          </Form.Item>
          <Form.Item name="noAds" style={{ display: "none" }}>
            <Input value={false as unknown as string} />
          </Form.Item>
          <Form.Item name="kplusChannels" style={{ display: "none" }}>
            <Input value={false as unknown as string} />
          </Form.Item>
          <Form.Item name="hboGo" style={{ display: "none" }}>
            <Input value={false as unknown as string} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
    </div>
  );
};

export default EditPackage;