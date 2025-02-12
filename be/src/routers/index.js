import { Router } from "express";
import movieRouter from "./movie.js";
import categoryRouter from "./category.js";
import routerCountry from "./country.js";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import favoriteRouter from "./favorite.js";
import commentRouter from "./comment.js";
import packageRouter from "./package.js";
import { createImage } from "../controllers/user.js";
import upload from "../config/multerConfig.js";
import paymentRouter from "./payment.js";
import generateStatistics from "./generateStatistics.js";
import contactRouter from "./contact.js";
import walletRouter from "./wallet.js";
import notificationRouter from "./notification.js";
import discountRouter from "./discount.js";
import personRouter from "./person.js";

const router = new Router();

router.use("/movie", movieRouter);
router.use("/category", categoryRouter);
router.use("/country", routerCountry);
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/favorite", favoriteRouter);
router.use("/comment", commentRouter);
router.use("/payment", paymentRouter);
router.use("/notification", notificationRouter);
router.use("/package", packageRouter);
router.use("/contact", contactRouter);
router.use("/wallet", walletRouter);
router.use("/generateStatistics", generateStatistics);
router.use("/discount", discountRouter);
router.use("/person", personRouter);
router.post("/upload", upload.array("Movies"), createImage);

export default router;
