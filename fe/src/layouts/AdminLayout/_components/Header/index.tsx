import React, { useEffect, useState } from "react";
import { Dropdown, Menu, notification } from "antd";
import { FaUserCircle } from "react-icons/fa";
import styled from "styled-components";
import instance from "@/configs/axios";
import { useNavigate } from "react-router-dom";

interface GreetingTextProps {
  color: string;
}

const HeaderContainer = styled.header`
  padding: 20px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.textColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const GreetingWrapper = styled.div`
  overflow: hidden;
  width: 1200px;
`;

const GreetingText = styled.span<GreetingTextProps>`
  font-size: 22px;
  font-weight: bold;
  color: ${({ color }) => color};
  display: inline-block;
  white-space: nowrap;
  animation: moveText 20s linear infinite;

  @keyframes moveText {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
`;

const getGreeting = (name: string) => {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 0 && hours < 12) {
    return {
      message: `Chào buổi sáng, ${name}! Chúc bạn ngày mới vui vẻ!`,
      color: "#FF6347",
    };
  } else if (hours >= 12 && hours < 18) {
    return {
      message: `Chào buổi chiều, ${name}! Hy vọng bạn có một buổi chiều tốt lành!`,
      color: "#FFD700",
    };
  } else {
    return {
      message: `Chào buổi tối, ${name}! Chúc bạn một buổi tối thư giãn!`,
      color: "#8A2BE2",
    };
  }
};

const HeaderComponent: React.FC<{
  theme: string;
  toggleTheme: () => void;
}> = ({}) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await instance.get("/user/profile");
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };

    const localUser = localStorage.getItem("user");
    if (localUser) {
      setUser(JSON.parse(localUser));
    } else {
      fetchUser();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await instance.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      notification.success({
        message: "Đăng xuất thành công",
      });
      navigate("/login");
    } catch (error) {
      notification.error({
        message: "Đăng xuất thất bại",
      });
      console.log(error);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="2" onClick={handleLogout}>
        {"Đăng xuất"}
      </Menu.Item>
    </Menu>
  );

  const greetingMessage = user
    ? getGreeting(user.name)
    : { message: "Chào bạn!", color: "#FF6347" };

  return (
    <HeaderContainer>
      <div style={{ flexGrow: 1 }}>
        <GreetingWrapper>
          <GreetingText color={greetingMessage.color}>
            {greetingMessage.message}
          </GreetingText>
        </GreetingWrapper>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Dropdown overlay={userMenu} trigger={["click"]}>
          {user && user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User Avatar"}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                cursor: "pointer",
                objectFit: "cover",
              }}
              onClick={(e) => e.preventDefault()}
            />
          ) : (
            <FaUserCircle
              style={{ fontSize: 50, cursor: "pointer", color: "#808080" }} // Màu đen nhạt
            />
          )}
        </Dropdown>
      </div>
    </HeaderContainer>
  );
};

export default HeaderComponent;
