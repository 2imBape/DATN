import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Cấu hình transporter để gửi email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác nhận đổi email",
      text: `Mã xác minh của bạn là ${verificationToken}. Mã này sẽ hết hạn sau 10 phút.`,
      html: `
        <div style=" font-family: "Roboto", Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Xác minh email</h2>
          <p>Xin chào,</p>
          <p>Mã xác minh của bạn là:</p>
          <h3 style="color: #4CAF50; font-size: 24px;">${verificationToken}</h3>
          <p>Mã này sẽ hết hạn sau <strong>1 giờ</strong>. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
          <br>
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Could not send verification email");
  }
};

export const sendEmailNotification = async (email, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
      html: `
        <h1>${subject}</h1>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email notification sent successfully");
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw new Error("Could not send email notification");
  }
};

const sendRecoveryEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thông báo xóa tài khoản",
      text: `Chào ${name},\n\nTài khoản của bạn đã được xóa thành công. Bạn có thể khôi phục tài khoản trong vòng 7 ngày.\n\nTrân trọng.`,
      html: `
        <p>Chào <strong>${name}</strong>,</p>
        <p>Tài khoản của bạn đã được xóa thành công. Bạn có thẻ khôi phục tài khoản trong vòng 7 ngày. Sau 7 ngày sẽ bị xóa vĩnh viễn</p>
        <p>Trân trọng,</p>
        <p>Đội ngũ hỗ trợ</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Lỗi khi gửi email khôi phục:", error);
    throw new Error("Không thể gửi email khôi phục.");
  }
};

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
export { sendVerificationEmail, sendRecoveryEmail };
