import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Avatar,
  message,
} from "antd";
import instance from "@/configs/axios";
import { User } from "@/interfaces/User";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const UpdateDiscount = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<{ value: string; avatar: string }[]>(
    []
  );
  const [form] = Form.useForm();

  // Fetch thông tin khuyến mãi và người dùng
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        console.log(options);
        const response = await instance.get(`/discount/${id}/user`);
        const discountData = response.data.data;
        setDiscount(discountData);

        // Đặt giá trị ban đầu cho applicableUsers
        form.setFieldsValue({
          applicableUsers: discountData.applicableUsers.map(
            (user: any) => user._id
          ),
        });

        // Thiết lập options cho Select
        const newOptions = discountData.applicableUsers.map((user: any) => ({
          value: user._id,
          avatar: user.avatar || "https://joeschmoe.io/api/v1/random",
          name: user.name,
        }));
        setOptions(newOptions);
      } catch (error) {
        message.error("Không thể tải thông tin khuyến mãi.");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await instance.get("/user");
        setUsers(response.data.data);
      } catch (error) {
        message.error("Không thể tải thông tin người dùng.");
      }
    };

    fetchDiscount();
    fetchUsers();
  }, [id, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await instance.put(`/discount/${id}`, values);

      message.success("Cập nhật khuyến mãi thành công!");
      navigate("/admin/discount");
    } catch (error) {
      message.error("Cập nhật khuyến mãi thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    // Chọn tất cả người dùng
    const allUserIds = users.map((user) => user._id);
    form.setFieldsValue({ applicableUsers: allUserIds });
  };

  if (!discount) {
    return <div>Đang tải thông tin khuyến mãi...</div>;
  }

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
          initialValues={discount}
          layout="vertical"
          onFinish={onFinish}
        >
          <h1 className="text-2xl font-bold mb-4">Cập nhật mã giảm giá</h1>

          <Form.Item
            name="name"
            label={<span className="text-black">Tên Mã Giảm Giá</span>}
            rules={[
              {
                required: true,
                message: "Tên mã giảm giá không được để trống",
              },
            ]}
          >
            <Input placeholder="Nhập tên mã giảm giá" />
          </Form.Item>

          <Form.Item
            name="code"
            label={<span className="text-black">Mã Giảm Giá</span>}
            rules={[
              { required: true, message: "Mã giảm giá không được để trống" },
            ]}
          >
            <Input placeholder="Nhập mã giảm giá" />
          </Form.Item>

          <Form.Item
            name="discountPercentage"
            label={<span className="text-black">Phần trăm giảm giá</span>}
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
            label={<span className="text-black">Ngày giảm giá</span>}
            rules={[{ required: true, message: "Vui lòng nhập ngày hết hạn" }]}
          >
            <InputNumber
              min={1}
              placeholder="Nhập ngày hết hạn"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="applicableUsers"
            label={<span className="text-black">Người dùng áp dụng</span>}
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
              {users.map((user: User) => (
                <Option key={user._id} value={user._id} label={user.name}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={user.avatar}
                      size="small"
                      style={{ marginRight: 8 }}
                    />
                    {user.name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%" }}
            >
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default UpdateDiscount;
