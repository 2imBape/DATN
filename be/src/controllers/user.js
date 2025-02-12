import User from "../models/User.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { Types } from "mongoose";
import crypto from "crypto";
import moment from "moment-timezone";

import Wallet from "../models/Wallet.js";
import {
  sendRecoveryEmail,
  sendVerificationEmail,
} from "../utils/sendVerificationEmail.js";
import Favorite from "../models/Favorite.js";
import Comment from "../models/Comment.js";
import Discount from "../models/Discount.js";
import MovieSubscription from "../models/MovieSubscription.js";
import UserPackage from "../models/UserPackage.js";
import Contact from "../models/Contact.js";
import Payment from "../models/Payment.js";

//In ra tất cả user
export const getAllUsers = async (req, res, next) => {
  const { search, page = 1, limit = 8, sort = "asc", role } = req.query;

  try {
    let query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    if (role) {
      query.role = role;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { name: sort === "asc" ? 1 : -1 },
    };

    const users = await User.paginate(query, options);

    const usersWithWallets = await Promise.all(
      users.docs.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          wallet: wallet
            ? { balance: wallet.balance, currency: wallet.currency }
            : null,
        };
      })
    );

    return res.status(200).json({
      message: "Get users successfully",
      data: usersWithWallets,
      pagination: {
        totalUsers: users.totalDocs,
        totalPages: users.totalPages,
        currentPage: users.page,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUser = async (req, res, next) => {
  const { search, sort = "asc" } = req.query;

  try {
    let query = { role: "user", isVerified: true };

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    const sortOption = { name: sort === "asc" ? 1 : -1 };

    const users = await User.find(query).sort(sortOption);

    // Trả kết quả
    return res.status(200).json({
      message: "Get users successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

//In ra 1 user
export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(new Types.ObjectId(userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// In ra thông tin người dùng
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(new Types.ObjectId(userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
//sửa role người dùng
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Xử lý ảnh đẩy lên cloudinary
export const createImage = async (req, res) => {
  try {
    const images = req.files.map((file) => file.path);

    const uploadedImages = [];

    for (const image of images) {
      const result = await cloudinary.uploader.upload(image);

      uploadedImages.push({
        publicId: result.public_id,
        url: result.secure_url,
      });
    }

    res.status(200).json({
      data: uploadedImages,
      message: "Images uploaded successfully!",
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({
      message: "Error uploading images.",
      error: error.message,
    });
  }
};

// Sửa người dùng
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone } = req.body;
    let avatarUrl;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatar",
      });
      avatarUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone, avatar: avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Gửi email về để đổi email
export const sendOldEmailVerification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    if (user.email === email) {
      return res
        .status(400)
        .json({ message: "Email trùng với email hiện tại" });
    }

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const verificationToken = crypto.randomInt(100000, 999999).toString();
    const resetPasswordExpires = Date.now() + 3600000;

    user.verificationToken = verificationToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken).catch((err) => {
      throw new Error("Không thể gửi email xác minh. Vui lòng thử lại sau.");
    });

    res.json({
      message: "Mã xác minh đã được gửi đến email cũ.",
    });
  } catch (error) {
    next(error);
  }
};

// Sửa email người dùng
export const updateEmail = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { email, verificationToken } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tìm thấy." });
    }

    if (
      user.verificationToken !== verificationToken ||
      (user.resetPasswordExpires && user.resetPasswordExpires < Date.now())
    ) {
      return res.status(400).json({
        message: "Mã xác minh không đúng hoặc đã hết hạn, vui lòng nhập lại.",
      });
    }
    // Cập nhật email mới
    user.email = email;
    user.verificationToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Đã đổi email thành công.",
    });
  } catch (error) {
    next(error);
  }
};

//xóa tài khoản mềm cho user
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.deleteOtp = otp;
    user.deleteOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, otp);

    res.status(200).json({ message: "OTP đã được gửi đến email của bạn." });
  } catch (error) {
    next(error);
  }
};

export const confirmDeleteUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { otp } = req.body;

    const user = await User.findOne({ _id: userId });

    const remainingTime = user.deleteOtpExpires - Date.now();
    if (remainingTime <= 0) {
      return res
        .status(400)
        .json({ message: "Hết hạn OTP, vui lòng gửi lại OTP." });
    }

    if (user.deleteOtp !== otp) {
      return res.status(400).json({ message: "Mã OTP không đúng" });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deleteOtp = null;
    user.deleteOtpExpires = null;
    await user.save();
    await sendRecoveryEmail(user.email, user.name);

    res.status(200).json({ message: "Tài khoản đã được xóa thành công" });
  } catch (error) {
    next(error);
  }
};

export const requestEmailRecovery = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (user.isDeleted === false) {
      return res.status(400).json({
        message:
          "Tài khoản chưa vẫn còn, nếu bạn quên mật khẩu hãy chọn vào quên mật khẩu",
      });
    }

    const secondsDifference = moment().diff(moment(user.deletedAt), "seconds");
    if (secondsDifference >= 7 * 24 * 60 * 60) {
      return res.status(400).json({
        message:
          "Tài khoản đã xóa và đã quá 7 ngày, vui lòng tạo mới tài khoản.",
      });
    }

    const recoveryToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const recoveryExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.recoveryToken = recoveryToken;
    user.recoveryExpires = recoveryExpires;
    await user.save();

    await sendVerificationEmail(email, recoveryToken);

    res.status(200).json({ message: "Email khôi phục đã được gửi." });
  } catch (error) {
    next(error);
  }
};

export const confirmEmailRecovery = async (req, res, next) => {
  try {
    const { recoveryToken } = req.body;

    const user = await User.findOne({
      recoveryToken,
      recoveryExpires: { $gt: Date.now() },
    });
    const remainingTime = user.recoveryExpires - Date.now();
    if (remainingTime <= 0) {
      return res
        .status(400)
        .json({ message: "Hết hạn OTP, vui lòng gửi lại OTP." });
    }

    user.recoveryToken = null;
    user.deletedAt = null;
    user.isDeleted = false;
    user.recoveryExpires = null;
    await user.save();

    res.status(200).json({ message: "Email đã được khôi phục thành công." });
  } catch (error) {
    next(error);
  }
};

const checkAnUpdateUser = async () => {
  try {
    const users = await User.find({ isDeleted: true });
    const currentDate = moment();
    for (const user of users) {
      const expiry = user.deletedAt;

      const expirationDate = moment(expiry);

      const secondsDifference = currentDate.diff(expirationDate, "seconds");

      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      if (secondsDifference >= sevenDaysInSeconds) {
        await User.deleteOne({ _id: user._id });
        await Favorite.deleteOne({ user: user._id });
        await Comment.deleteOne({ userId: user._id });

        const comments = await Comment.find({
          $or: [{ likedBy: user._id }, { dislikedBy: user._id }],
        });

        for (const comment of comments) {
          if (comment.likedBy.includes(user._id)) {
            await Comment.updateOne(
              { _id: comment._id },
              {
                $inc: { likes: -1 },
                $pull: { likedBy: user._id },
              }
            );
          } else if (comment.dislikedBy.includes(user._id)) {
            await Comment.updateOne(
              { _id: comment._id },
              {
                $inc: { dislikes: -1 },
                $pull: { dislikedBy: user._id },
              }
            );
          }
        }
        await Contact.deleteOne({ senderId: user._id });
        const discounts = await Comment.find({
          $or: [{ discountPercentage: user._id }],
        });
        for (const discount of discounts) {
          if (discount.discountPercentage.includes(user._id)) {
            await Discount.updateOne(
              { _id: discount._id },
              {
                $pull: { applicableUsers: user._id },
              }
            );
          }
        }
        await Discount.deleteOne({ applicableUsers: user._id });
        await MovieSubscription.deleteOne({ user: user._id });
        await Notification.deleteOne({ userId: user._id });
        await Payment.deleteOne({ user: user._id });
        await UserPackage.deleteOne({ userId: user._id });
        await Wallet.deleteOne({ userId: user._id });
      }
    }
  } catch (error) {
    console.error("Error checking for expired discounts:", error);
    console.log("Failed to check for expired discounts.");
  }
};

export default checkAnUpdateUser;
