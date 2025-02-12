import { Router } from "express";
import {
  paymentStatus,
  payMoMo,
  payVNPay,
  createPayment,
  selectPackageAndPay,
  upgradeSelectPackageAndPay,
  checkPackageUser,
  cancelPayment,
  continuePayment,
  getUserPackageByUserId,
  renewPackage,
  getUserPackageByUserIds,
} from "../controllers/Payment.js";
import { authentication } from "../middleware/authentication.js";

const paymentRouter = new Router();

paymentRouter.post("/MoMo", payMoMo);
paymentRouter.post("/VNPay", payVNPay);
paymentRouter.post("/status", authentication, paymentStatus);
paymentRouter.post("/upgrade", authentication, upgradeSelectPackageAndPay);
paymentRouter.post("/renew", authentication, renewPackage);
paymentRouter.post("/", authentication, createPayment);
paymentRouter.post("/select", authentication, selectPackageAndPay);
paymentRouter.get("/package-user", authentication, checkPackageUser);
paymentRouter.get("/package", authentication, getUserPackageByUserId);
paymentRouter.get("/packages/:userId", getUserPackageByUserIds);
paymentRouter.post("/cancel", authentication, cancelPayment);
paymentRouter.post("/continue", authentication, continuePayment);

export default paymentRouter;
