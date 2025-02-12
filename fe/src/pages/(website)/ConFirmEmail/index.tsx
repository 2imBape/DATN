import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Typography, Spin, Button, Tooltip } from "antd";
import { MdOutlineError } from "react-icons/md";
import { AiOutlineCheck } from "react-icons/ai";
import instance from "@/configs/axios";

const { Title } = Typography;

const ConfirmEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await instance.get(`auth/confirm-email/${token}`);
        console.log(message);
        // Lưu token vào localStorage nếu có trong phản hồi
        if (response.data.token) {
          localStorage.setItem("accessToken", response.data.token);
        }

        setMessage(response.data.message);
        setSuccess(true);
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
          setMessage(error.response.data.message || "Có lỗi xảy ra");
        } else {
          setMessage("Có lỗi xảy ra");
        }
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div
      style={{
        backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/04bef84d-51f6-401e-9b8e-4a521cbce3c5/null/VN-vi-20240903-TRIFECTA-perspective_b411f1a6-36f2-410a-ade4-2f6b95f21f7e_medium.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {loading ? (
        <Spin size="large" />
      ) : (
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)", // Thêm nền tối để làm nổi bật văn bản
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "800px",
            width: "100%", // Đảm bảo responsive
          }}
        >
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div className="flex items-center justify-center p-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500">
                  <AiOutlineCheck
                    style={{ fontSize: "24px", color: "white" }}
                  />
                </div>
              </div>
              <Title level={2} style={{ color: "white" }}>
                Chúc mừng bạn đã xác thực tài khoản thành công!
              </Title>
              <Button
                type="primary"
                onClick={() => navigate("/login")}
                style={{ marginTop: "10px" }}
              >
                Đăng nhập
              </Button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div className="flex items-center justify-center p-4 relative">
                <div className="absolute w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-16 border-b-blue-500"></div>
                <Tooltip title="Error" placement="bottom">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 relative z-10">
                    <MdOutlineError
                      style={{ fontSize: "24px", color: "white" }}
                    />
                  </div>
                </Tooltip>
              </div>
              <Title level={2} style={{ color: "white" }}>
                Rất tiếc tài khoản của bạn không được xác thực. Vui lòng kiểm
                tra lại email hoặc đăng ký!
              </Title>
              <Button
                type="primary"
                style={{ color: "white", marginTop: "10px" }}
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfirmEmail;
