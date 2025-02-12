import { useEffect, useState } from "react";
import { Form, Input, Button, message, Modal } from "antd";
import OtpInput from "react-otp-input"; // Nhập thư viện OTP
import instance from "@/configs/axios";
import { useNavigate } from "react-router-dom";

const ChangeEmail = () => {
  const [otpCode, setOtpCode] = useState(""); // Chỉ cần một chuỗi cho mã OTP
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.provider;
    console.log(loading);

    if (userRole) {
      message.error("Bạn không thể đổi email.");
      navigate(-1);
    }
  }, [navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setSendingCode(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const onFinish = async (values: any) => {
    const { email } = values;
    setLoading(true);

    try {
      const response = await instance.put("/user/updateEmail", {
        email,
        verificationToken: otpCode,
      });

      if (response.status === 200) {
        message.success(response.data.message);
        form.resetFields();
        setIsModalVisible(false);
      }
    } catch (error: any) {
      if (error.response) {
        message.error(
          error.response.data.message || "Đã xảy ra lỗi, vui lòng thử lại sau."
        );
      } else {
        message.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    setSendingCode(true);
    const email = form.getFieldValue("email");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      message.error("Vui lòng nhập email hợp lệ trước khi gửi mã xác minh.");
      setSendingCode(false);
      return;
    }

    try {
      const response = await instance.post("/user/sendUpdateEmail", { email });
      if (response.status === 200) {
        message.success("Mã xác minh đã được gửi đến email của bạn.");
        setCountdown(60);
        setIsModalVisible(true);
      }
    } catch (error: any) {
      if (error.response) {
        message.error(
          error.response.data.message || "Đã xảy ra lỗi, vui lòng thử lại sau."
        );
      } else {
        message.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
      }
    } finally {
      setSendingCode(false);
    }
  };

  const handleModalOk = () => {
    if (otpCode.length !== 6 || isNaN(Number(otpCode))) {
      message.error("Mã xác minh phải gồm 6 chữ số.");
    } else {
      form.submit();
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "20px" }}>
      <h1 style={{ fontWeight: "bolder", fontSize: "1.2vw" }}>Cập nhật Email</h1>
      <hr style={{ marginBottom: "10px" }} />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{
          email: "",
        }}
      >
        <Form.Item label="Email mới">
          <Input.Group compact>
            <Form.Item
              name="email"
              noStyle
              rules={[
                { required: true, message: "Vui lòng nhập email mới" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input style={{ width: "calc(70% - 8px)" }} placeholder="Vui lòng nhập email mới" />
            </Form.Item>
            <Button
              type="primary"
              onClick={sendVerificationCode}
              disabled={sendingCode || countdown !== null}
              loading={sendingCode}
              style={{
                width: "30%",
                backgroundColor: countdown ? "#33CCFF" : "#1890ff",
                borderColor: countdown ? "#33CCFF" : "#1890ff",
                fontWeight: "bold",
              }}
            >
              {countdown ? (
                <span style={{ fontWeight: "bold" }}>{`${countdown}s`}</span>
              ) : (
                <span style={{ fontWeight: "bold" }}>Gửi mã</span>
              )}
            </Button>
          </Input.Group>
        </Form.Item>
      </Form>

      <Modal
        title="Nhập mã xác minh"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Xác nhận"
        cancelText="Hủy bỏ"
      >
        <p>Vui lòng nhập mã xác minh 6 chữ số:</p>
        <OtpInput
          value={otpCode}
          onChange={(value) => {
            // Chỉ cho phép nhập số
            if (/^\d*$/.test(value)) {
              setOtpCode(value);
            }
          }}
          numInputs={6}
          renderInput={(props) => (
            <input
              {...props}
              pattern="[0-9]*" // Chỉ cho phép số
              inputMode="numeric" // Thay đổi bàn phím trên thiết bị di động
              onKeyDown={(e) => {
                // Ngăn không cho nhập chữ
                if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                  e.preventDefault();
                }
              }}
            />
          )}
          inputStyle={{
            width: "40px",
            height: "40px",
            margin: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            textAlign: "center",
            fontSize: "24px",
          }}
          containerStyle={{
            justifyContent: "space-between",
            maxWidth: "300px",
            margin: "auto",
          }}
        />
        <Button
          type="primary"
          onClick={sendVerificationCode}
          disabled={sendingCode || countdown !== null}
          loading={sendingCode}
          style={{
            width: "30%",
            backgroundColor: countdown ? "#33CCFF" : "#1890ff",
            borderColor: countdown ? "#33CCFF" : "#1890ff",
            fontWeight: "bold",
          }}
        >
          {countdown ? (
            <span style={{ fontWeight: "bold" }}>{`${countdown}s`}</span>
          ) : (
            <span style={{ fontWeight: "bold" }}>Gửi mã</span>
          )}
        </Button>
      </Modal>
    </div>
  );
};

export default ChangeEmail;
