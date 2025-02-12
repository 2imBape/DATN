import React, { useEffect, useState } from "react";
import { Layout, Menu, Avatar, Typography, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import ProfileModal from "@/components/ProfileModal";
import instance from "@/configs/axios";
import { formatTime } from "@/utils/utils";

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const fetchUsersChattedWithAdmin = async () => {
    try {
      const response = await instance("contact/admin");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchUsersChattedWithAdmin();

    const interval = setInterval(() => {
      fetchUsersChattedWithAdmin();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sortedUsers = [...users].sort((a, b) => {
    const timeA = new Date(a.latestMessage.createdAt).getTime();
    const timeB = new Date(b.latestMessage.createdAt).getTime();
    return timeB - timeA;
  });

  const filteredUsers = sortedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <Sider
        width={280}
        collapsible
        style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
          <FaBars
            style={{
              fontSize: "24px",
              color: "rgb(0, 33, 64)",
              marginRight: "8px",
              cursor: "pointer",
            }}
            onClick={toggleModal}
          />
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              borderRadius: "20px",
              backgroundColor: "#f0f2f5",
              marginLeft: "8px",
            }}
          />
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ borderRight: 0, backgroundColor: "#ffffff" }}
        >
          {filteredUsers.map((user) => (
            <Menu.Item key={user.userId} style={{ height: 60, padding: 0 }}>
              <Avatar
                size="large"
                style={{
                  backgroundColor: "rgb(0, 33, 64)",
                  marginRight: "12px",
                }}
                src={user.avatar}
              >
                {user.avatar ? null : user.name.charAt(0)}
              </Avatar>
              <Link
                to={`contact/${user.id}`}
                style={{
                  marginLeft: "12px",
                  color: "rgb(0, 33, 64)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Text style={{ marginBottom: 4 }}>{user.name}</Text>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ fontSize: "12px", color: "#888", marginBottom: 0 }}
                  >
                    {user.latestMessage.message}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginLeft: "8px",
                      marginBottom: 0,
                    }}
                  >
                    {formatTime(user.latestMessage.createdAt)}
                  </Text>
                </div>
              </Link>
            </Menu.Item>
          ))}
        </Menu>
        <ProfileModal isOpen={isModalOpen} onClose={toggleModal} />
      </Sider>
    </div>
  );
};

export default Sidebar;
