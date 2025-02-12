import React from "react";
import { Modal, List, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { User } from "@/interfaces/User";

interface LikeDislikeModalProps {
  visible: boolean;
  onClose: () => void;
  users: User[];
  title: string;
}

const LikeDislikeModal: React.FC<LikeDislikeModalProps> = ({
  visible,
  onClose,
  users,
  title,
}) => {
  return (
    <Modal
      title={<h2 style={{ textAlign: "center" }}>{title}</h2>}
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ top: 20 }}
    >
      <List
        dataSource={users}
        renderItem={(user) => (
          <List.Item style={{ padding: "10px 0" }}>
            <List.Item.Meta
              avatar={
                <div style={{ display: "flex", alignItems: "center" }}>
                  {user.avatar ? (
                    <Avatar src={user.avatar} size={40} />
                  ) : (
                    <Avatar icon={<UserOutlined />} size={40} />
                  )}
                  <div style={{ marginLeft: 10 }}>
                    <span style={{ fontWeight: "bold" }}>{user.name}</span>
                    <br />
                    <span style={{ color: "#888" }}>{user.username}</span>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
        style={{ margin: 0 }}
      />
    </Modal>
  );
};

export default LikeDislikeModal;
