import express from "express";
import cron from "node-cron";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routers/index.js";
import { connectDB } from "./config/db.js";
import "./config/passport.js"; // Cấu hình passport cần được import trước khi sử dụng
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import { connectRedis } from "./config/redis.js";
import { updateExpiredPayments } from "./controllers/Payment.js";
import checkAndUpdateMovieStatus from "./controllers/MovieSubscription.js";
import checkAnUpdateDiscount from "./controllers/discount.js";
import checkAnUpdateUser from "./controllers/user.js";

dotenv.config();

const app = express();
app.use(cookieParser());

const URL_DB = process.env.URL_DB;
connectDB(URL_DB);
connectRedis();

// setRedis("userLogin:1:token2", "token");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cron.schedule("0 * * * * *", () => {
  updateExpiredPayments();
  checkAndUpdateMovieStatus();
  checkAnUpdateDiscount();
  checkAnUpdateUser();
});

// Cấu hình session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Khởi tạo Passport và sử dụng session
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use("/api", router);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
