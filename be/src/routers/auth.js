import { Router } from "express";
import passport from "passport";
import axios from "axios";
import jwt from "jsonwebtoken";

import {
  changePassword,
  confirmEmail,
  forgotPassword,
  Login,
  logout,
  Register,
  resetPassword,
} from "../controllers/auth.js";
import { authentication } from "../middleware/authentication.js";
import User from "../models/User.js";

const authRouter = new Router();

authRouter.post("/register", Register);
authRouter.post("/login", Login);
authRouter.post("/logout", authentication, logout);
authRouter.post("/forgotPassword", forgotPassword);
authRouter.post("/resetPassword/:token", resetPassword);
authRouter.put("/changePassword", authentication, changePassword);
authRouter.post("/login", Login);
authRouter.get("/confirm-email/:token", confirmEmail);

authRouter.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["public_profile", "email"] })
);

authRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    if (req.user && req.user.token) {
      const redirectUrl = `${process.env.FRONTEND_URL}?token=${req.user.token}`;
      console.log(redirectUrl);
      res.redirect(redirectUrl);
    } else {
      res.redirect(`${process.env.BACKEND_URL}/api/auth/login/failed`);
    }
  }
);
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (req.user && req.user.token) {
      const redirectUrl = `${process.env.FRONTEND_URL}?token=${req.user.token}`;
      res.redirect(redirectUrl);
    } else {
      res.redirect(`${process.env.BACKEND_URL}/api/auth/login/failed`);
    }
  }
);

authRouter.get("/login/success", async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Người dùng chưa đăng nhập hoặc token không tồn tại.",
    });
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn.",
      });
    }

    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại.",
        });
      }

      const userInfo = {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        provider: user.provider,
        socialId: user.socialId,
        token,
      };

      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: userInfo,
      });
    } catch (error) {
      console.error("Error retrieving user:", error);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi lấy thông tin người dùng.",
      });
    }
  });
});

authRouter.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Đăng nhập thất bại.",
  });
});

export default authRouter;
