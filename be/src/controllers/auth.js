import { loginValidate, registerValidate } from "../validations/auth.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Types } from "mongoose";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { keyDelete, keys, setRedis } from "../config/redis.js";
import Discount from "../models/Discount.js";
import Notification from "../models/Notification.js";

dotenv.config();

// Cấu hình Nodemailer với Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Đăng ký
export const Register = async (req, res, next) => {
  try {
    const {
      name,
      username,
      password,
      email,
      confirmPassword,
      phone,
      avatar,
      referredBy,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Xác nhận mật khẩu không đúng" });
    }

    // Validate dữ liệu đăng ký
    const { error } = registerValidate.validate(
      { username, password, email },
      { abortEarly: false }
    );
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Kiểm tra email đã tồn tại
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Kiểm tra username đã tồn tại
    const checkUsername = await User.findOne({ username });
    if (checkUsername) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    function generateReferralCode(length = 8) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let referralCode = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters[randomIndex];
      }
      return referralCode;
    }
    const referralCode = generateReferralCode();

    // Tạo người dùng mới
    const newUser = await User.create({
      name,
      referralCode: referralCode,
      username,
      password: hashedPassword,
      email,
      phone,
      verificationToken,
    });

    // Tạo nội dung email cảm ơn
    const mailOptions = {
      to: newUser.email,
      from: process.env.EMAIL_USER,
      subject: "Xác thực tài khoản của bạn",
      html: `<p>Xin chào ${newUser.name},</p>
             <p>Cảm ơn bạn đã đăng ký tài khoản với chúng tôi! Để hoàn tất quá trình đăng ký, vui lòng xác thực tài khoản của bạn bằng cách nhấp vào liên kết dưới đây:</p>
             <a href="${process.env.FRONTEND_URL}/confirm-email/${newUser.verificationToken}">Xác thực tài khoản</a>
             <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và tài khoản của bạn sẽ không bị thay đổi.</p>
             <p>Trân trọng,</p>
             <p>Đội ngũ hỗ trợ</p>`,
    };
    // Gửi email cảm ơn
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email:", error);
        return res.status(500).json({ message: "Có lỗi xảy ra khi gửi email" });
      }
    });

    const userByReferralCode = await User.findOne({ referralCode: referredBy });

    if (userByReferralCode) {
      // Người giới thiệu tồn tại -> Gán mã giảm giá cho cả hai bên
      const discountIdForReferrer = "6760218947a6adcead825d7b";
      const discountForReferrer = await Discount.findOne({
        _id: discountIdForReferrer,
      });
      if (discountForReferrer) {
        discountForReferrer.applicableUsers = userByReferralCode._id;
        await discountForReferrer.save();
        await Notification.create({
          userId: userByReferralCode._id,
          title: discountForReferrer.name,
          message:
            "Chúc mừng bạn đã giới thiệu bạn bè thành công. Vui lòng kiểm tra mã giảm giá.",
          type: "present",
        });
      } else {
        console.error(`Discount with ID ${discountIdForReferrer} not found.`);
      }

      const discountIdForNewUser = "6760217147a6adcead825d75";
      const discountForNewUser = await Discount.findOne({
        _id: discountIdForNewUser,
      });
      if (discountForNewUser) {
        discountForNewUser.applicableUsers = newUser._id;
        await discountForNewUser.save();
        await Notification.create({
          userId: newUser._id,
          title: discountForNewUser.name,
          message:
            "Chúc mừng bạn đã sử dụng mã giới thiệu. Vui lòng kiểm tra mã giảm giá.",
          type: "present",
        });
      } else {
        console.error(`Discount with ID ${discountIdForNewUser} not found.`);
      }
    } else {
      // Không có mã giới thiệu -> Gán mã giảm giá cho đăng ký lần đầu
      const discountIdForFirstTime = "6760215447a6adcead825d72";
      const discountForFirstTime = await Discount.findOne({
        _id: discountIdForFirstTime,
      });
      if (discountForFirstTime) {
        discountForFirstTime.applicableUsers = newUser._id;
        await discountForFirstTime.save();
        await Notification.create({
          userId: newUser._id,
          title: discountForFirstTime.name,
          message:
            "Chào mừng bạn đến với chúng tôi! Bạn đã nhận được mã giảm giá lần đầu tiên. Vui lòng kiểm tra bảng giảm giá để biết chi tiết và áp dụng mã.",
          type: "present",
        });
      } else {
        console.error(`Discount with ID ${discountIdForFirstTime} not found.`);
      }
    }

    res.status(201).json({
      message: "Thêm người dùng thành công. Email chào mừng đã được gửi.",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

//Đăng nhập
export const Login = async (req, res, next) => {
  try {
    const { username, password, rememberMe } = req.body;

    // Validate dữ liệu đăng nhập
    const { error } = loginValidate.validate(
      { username, password },
      { abortEarly: false }
    );
    if (error) {
      return res.status(400).json({
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }

    // Tìm người dùng theo username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Tên người dùng không tồn tại" });
    }

    // Kiểm tra xem tài khoản đã được xác thực chưa
    if (!user.isVerified) {
      return res.status(400).json({ message: "Tài khoản chưa được xác thực" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }

    const checkRedis = await keys(user._id);
    if (checkRedis.length >= 3) {
      return res
        .status(400)
        .json({ message: "Tài khoản đã đăng nhập quá 3 thiết bị" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: rememberMe ? "30d" : "1h",
    });

    user.password = undefined;

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 60 * 60,
    });

    let time;
    if (rememberMe) {
      time = 30 * 24 * 60 * 60;
    } else {
      time = 60 * 60;
    }
    const userId = user._id;
    setRedis(`${userId}:${token}`, ` ${token}`, time);

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      const newWallet = new Wallet({
        userId: user._id,
        balance: 0,
        currency: "Xu",
      });
      await newWallet.save();
    }

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//xac thuc email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Kiểm tra token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Tìm người dùng theo id
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { isVerified: true, verificationToken: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    res.status(200).json({ message: "Xác thực email thành công" });
  } catch (error) {
    next(error);
  }
};

//Đăng xuất
export const logout = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { token } = req.body;

    keyDelete(`${userId}:${token}`);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({
            message: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
          });
        }

        res.status(200).json({ message: "Đăng xuất thành công." });
      });
    } else {
      res.status(200).json({ message: "Đăng xuất thành công." });
    }
  } catch (error) {
    console.error("Unexpected error during logout:", error);
    next(error);
  }
};

export const confirmEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Xác thực không thành công" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Tài khoản đã được xác thực thành công" });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

// Quên mật khẩu
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    console.log(resetPasswordToken);
    user.resetPasswordToken = resetPasswordToken;
    console.log(resetPasswordToken);
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Đặt lại mật khẩu của bạn",
      html: `
        <p>Xin chào ${user.name},</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để đặt lại mật khẩu, vui lòng nhấp vào liên kết dưới đây hoặc dán liên kết vào trình duyệt của bạn:</p>
        <a href="${process.env.FRONTEND_URL}/resetPassword/${resetPasswordToken}" style="color: #007bff; text-decoration: none;">Đặt lại mật khẩu</a>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không bị thay đổi.</p>
        <p>Trân trọng,</p>
        <p>Đội ngũ hỗ trợ</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email:", error);
        return res.status(500).json({ message: "Có lỗi xảy ra khi gửi email" });
      }
      console.log("Email đã được gửi:", info.response);
      res.status(200).json({ message: "Email đã được gửi." });
    });
  } catch (error) {
    next(error);
  }
};

// Đổi mật khẩu dự vào token của quên mật khẩu
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Mật khẩu đã được đặt lại thành công" });
  } catch (error) {
    next(error);
  }
};

// Đổi mật khẩu dự vào mật khẩu cũ
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Người dùng không xác thực" });
    }

    const user = await User.findById(new Types.ObjectId(userId));

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tìm thấy" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Kiểm tra nếu mật khẩu mới trùng với mật khẩu cũ
    const isSame = await bcryptjs.compare(newPassword, user.password);
    if (isSame) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới không được giống mật khẩu cũ" });
    }

    // Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    // Hash mật khẩu mới
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Mật khẩu đã được đổi thành công" });
  } catch (error) {
    next(error);
  }
};
