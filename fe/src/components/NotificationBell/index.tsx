import instance from "@/configs/axios";
import { formatTime } from "@/utils/utils";
import { BellOutlined, GiftOutlined, WarningOutlined } from "@ant-design/icons";
import { Badge, Button, Dropdown, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { FaReadme } from "react-icons/fa";
import { FaMoneyCheckAlt } from "react-icons/fa";

// Định nghĩa interface cho Notification
interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await instance.get("notification");
        const fetchedNotifications: Notification[] = data;
        setNotifications(fetchedNotifications);
        setHasUnreadNotifications(
          fetchedNotifications.some((notification) => !notification.isRead)
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);
  const getNotificationIcon = (type: any) => {
    switch (type) {
      case "payment":
        return (
          <FaMoneyCheckAlt
            style={{
              color: "#52c41a",
              fontSize: "25px",
              transition: "color 0.3s ease",
            }}
          />
        );
      case "reminder":
        return (
          <FaReadme
            style={{
              color: "#faad14",
              fontSize: "25px",
              transition: "color 0.3s ease",
            }}
          />
        );
      case "error":
        return (
          <WarningOutlined
            style={{
              color: "#f5222d",
              fontSize: "25px",
              transition: "color 0.3s ease",
            }}
          />
        );
      case "present":
        return (
          <GiftOutlined
            style={{
              color: "#1890ff",
              fontSize: "25px",
              transition: "color 0.3s ease",
            }}
          />
        );
      default:
        return null;
    }
  };
  // Hàm đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = async () => {
    try {
      await instance.patch("notification/allread");

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setHasUnreadNotifications(false);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Hàm đánh dấu thông báo cụ thể là đã đọc
  const handleNotificationClick = async (notificationId: string) => {
    try {
      await instance.patch("notification/read", { notificationId });

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setHasUnreadNotifications(
        notifications.some((notification) => !notification.isRead)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const renderNotifications = (
    <Menu
      style={{
        width: 500,
        maxHeight: 400,
        overflowY: "auto",
        marginTop: 12,
      }}
    >
      {/* Thêm nút "Đánh dấu tất cả đã đọc" */}
      <Menu.Item key="mark-all-read">
        <Button
          type="link"
          onClick={markAllAsRead}
          style={{ width: "100%", textAlign: "left" }}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Menu.Item>

      {/* Hiển thị thông báo */}
      <Menu.Divider />
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <Menu.Item
            key={notification._id}
            onClick={() => handleNotificationClick(notification._id)}
            style={{
              fontWeight: notification.isRead ? "normal" : "bold",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "12px" }}>
                {" "}
                {/* Tăng marginRight ở đây */}
                {getNotificationIcon(notification.type)}
              </span>
              <div style={{ flex: 1 }}>
                <p>{notification.message}</p>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {formatTime(notification.createdAt)}
                </span>
              </div>
            </div>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item>Không có thông báo nào</Menu.Item>
      )}
    </Menu>
  );

  return (
    <Dropdown overlay={renderNotifications} trigger={["click"]}>
      <Badge
        count={
          hasUnreadNotifications
            ? notifications.filter((notification) => !notification.isRead)
                .length
            : 0
        }
        overflowCount={99}
      >
        <BellOutlined style={{ fontSize: "24px", color: "#fff" }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
