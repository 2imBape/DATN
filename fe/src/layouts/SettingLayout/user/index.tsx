import instance from "@/configs/axios";
import { User } from "@/interfaces/User";
import { EditOutlined } from "@ant-design/icons";
import { Avatar, Button, Form, Input, message, Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import { FaRegUser } from "react-icons/fa";

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [isEditPhoneModalVisible, setIsEditPhoneModalVisible] = useState(false);
  const [isEditAvatarModalVisible, setIsEditAvatarModalVisible] =
    useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await instance.get(`/user/profile`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        message.error("Failed to fetch user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditName = async (values: { name: string }) => {
    try {
      const response = await instance.put("/user/updateProfile", {
        name: values.name,
      });

      setUser((prevUser: any) => ({ ...prevUser, name: response.data.name }));
      setIsEditNameModalVisible(false);
      message.success("Đổi tên thành công");
      const userResponse = await instance.get("user/profile");
      const userData = userResponse.data;
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      message.error("Failed to update name.");
    }
  };

  const handleEditPhone = async (values: { phone: string }) => {
    try {
      const response = await instance.put("/user/updateProfile", {
        phone: values.phone,
      });

      setUser((prevUser: any) => ({ ...prevUser, phone: response.data.phone }));
      setIsEditPhoneModalVisible(false);
      message.success("Đổi số điện thoại thành công");
    } catch (error) {
      message.error("Failed to update phone.");
    }
  };

  const handleEditAvatar = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const response = await instance.put("/user/updateProfile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser((prevUser: any) => ({
        ...prevUser,
        avatar: response.data.avatar,
      }));
      const userResponse = await instance.get("user/profile");
      const userData = userResponse.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setIsEditAvatarModalVisible(false);
      setAvatarPreview(null);
      message.success("Đổi ảnh đại diện thành công");
    } catch (error) {
      message.error("Failed to update avatar.");
    }
  };

  const showEditNameModal = () => {
    setIsEditNameModalVisible(true);
  };

  const handleCancelEditName = () => {
    setIsEditNameModalVisible(false);
  };

  const showEditPhoneModal = () => {
    setIsEditPhoneModalVisible(true);
  };

  const handleCancelEditPhone = () => {
    setIsEditPhoneModalVisible(false);
  };

  const showEditAvatarModal = () => {
    setIsEditAvatarModalVisible(true);
  };

  const handleCancelEditAvatar = () => {
    setIsEditAvatarModalVisible(false);
    setAvatarPreview(null); // Reset preview
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      {user ? (
        <div
          style={{
            justifyContent: "center",
            marginTop: "10px",
            color: "white",
          }}
        >
          <div
            style={{
              marginRight: "20px",
              display: "flex",
              paddingLeft: "100px",
              border: "1px solid gray",
              borderRadius: "10px",
              width: "600px",
              marginLeft: "100px",
              padding: "20px",
              background: "gray",
            }}
          >
            <Avatar
              src={avatarPreview || user.avatar || null}
              size={100}
              style={{ border: "5px solid white", position: "relative" }}
              onClick={showEditAvatarModal}
            >
              {avatarPreview || user.avatar ? null : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "70px",
                    color: "white",
                  }}
                >
                  <FaRegUser />
                </div>
              )}
            </Avatar>
            <p
              style={{
                paddingLeft: "30px",
                fontSize: "2vw",
                fontWeight: "bold",
                paddingTop: "30px",
              }}
            >
              {user.name}
            </p>
          </div>
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  border: "1px solid gray",
                  borderRadius: "10px",
                  width: "600px",
                  marginLeft: "100px",
                  paddingLeft: "20px",
                  marginTop: "10px",
                  background: "gray",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p
                    style={{
                      padding: "10px 20px",
                      paddingLeft: "20px",
                      fontSize: "1.3vw",
                      flexGrow: 1,
                    }}
                  >
                    Phone: <strong>{user.phone}</strong>
                  </p>
                  <Button
                    type="link"
                    onClick={showEditPhoneModal}
                    icon={<EditOutlined />}
                  />
                </div>
                <hr style={{ margin: "3px 10px", marginLeft: "0" }} />
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p
                    style={{
                      padding: "10px 20px",
                      paddingLeft: "20px",
                      fontSize: "1.3vw",
                      flexGrow: 1,
                    }}
                  >
                    Name: <strong>{user.name || "No Name available."}</strong>
                  </p>
                  <Button
                    type="link"
                    onClick={showEditNameModal}
                    icon={<EditOutlined />}
                  />
                </div>
                <hr style={{ margin: "3px 10px", marginLeft: "0" }} />

                <p
                  style={{
                    padding: "10px 20px",
                    paddingLeft: "20px",
                    fontSize: "1.3vw",
                  }}
                >
                  Email: <strong>{user.email}</strong>
                </p>
                <p
                  style={{
                    padding: "10px 20px",
                    paddingLeft: "20px",
                    fontSize: "1.3vw",
                  }}
                >
                  Mã giới thiệu: <strong>{user.referralCode}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Modal Edit Avatar */}
          <Modal
            title="Sửa ảnh"
            visible={isEditAvatarModalVisible}
            onCancel={handleCancelEditAvatar}
            footer={null}
          >
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                style={{ width: "100px", height: "100px", marginTop: "10px" }}
              />
            )}
            <Button
              type="primary"
              onClick={handleEditAvatar}
              style={{ marginTop: "10px" }}
            >
              Lưu Ảnh
            </Button>
          </Modal>

          <Modal
            title="Sửa tên"
            visible={isEditNameModalVisible}
            onCancel={handleCancelEditName}
            footer={null}
          >
            <Form onFinish={handleEditName}>
              <Form.Item
                label="Name"
                name="name"
                initialValue={user.name || ""}
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title="Sửa số điện thoại"
            visible={isEditPhoneModalVisible}
            onCancel={handleCancelEditPhone}
            footer={null}
          >
            <Form onFinish={handleEditPhone}>
              <Form.Item
                label="Phone"
                name="phone"
                initialValue={user.phone || ""}
                rules={[
                  { required: true, message: "Please input your phone!" },
                  {
                    pattern: /^\+?[0-9]{10,10}$/,
                    message: "Please enter a valid phone number!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      ) : (
        <p>Tài khoản không tồn tại</p>
      )}
    </div>
  );
};

export default UserProfile;
