import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Wallet from "../models/Wallet.js";
import dotenv from "dotenv";
import { setRedis } from "./redis.js";
import Notification from "../models/Notification.js";
import Discount from "../models/Discount.js";

dotenv.config();
const handleOAuthLogin = async (profile, provider, done) => {
  try {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(
        new Error(`${provider} account does not have an email.`),
        false
      );
    }

    // Tìm người dùng dựa trên email
    let user = await User.findOne({ email });

    if (!user) {
      // Tạo mã giới thiệu
      const generateReferralCode = (length = 8) => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          code += characters[randomIndex];
        }
        return code;
      };

      const referralCode = generateReferralCode();

      // Tạo người dùng mới
      user = await User.create({
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value,
        provider: provider,
        socialId: profile.id,
        email,
        isVerified: true,
        referralCode: referralCode,
      });

      // Gắn mã giảm giá nếu tồn tại
      const discountIdForFirstTime = "6760215447a6adcead825d72";
      const discountForFirstTime = await Discount.findOne({
        _id: discountIdForFirstTime,
      });

      if (discountForFirstTime) {
        discountForFirstTime.applicableUsers = user._id;
        await discountForFirstTime.save();
        await Notification.create({
          userId: user._id,
          title: discountForFirstTime.name,
          message:
            "Chào mừng bạn đến với chúng tôi! Bạn đã nhận được mã giảm giá lần đầu tiên. Vui lòng kiểm tra bảng giảm giá để biết chi tiết và áp dụng mã.",
          type: "present",
        });
      }
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    // Lưu token vào Redis
    const time = 60 * 60;
    setRedis(`${user._id}:${token}`, ` ${token}`, time);

    // Kiểm tra và tạo ví nếu chưa tồn tại
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({
        userId: user._id,
        balance: 0,
        currency: "VND",
      });
      await wallet.save();
    }

    return done(null, { user, token });
  } catch (error) {
    console.error(`Lỗi trong quá trình xác thực ${provider}:`, error);
    return done(error, false);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
      scope: ["profile", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      handleOAuthLogin(profile, "google", done);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      handleOAuthLogin(profile, "facebook", done);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
