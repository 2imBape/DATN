import Package from "../models/Package.js";
import Payment from "../models/Payment.js";
import axios from "axios";
import crypto from "crypto";
import querystring from "qs";
import { Buffer } from "buffer";
import moment from "moment-timezone";
import User from "../models/User.js";
import dotenv from "dotenv";
import Wallet from "../models/Wallet.js";
import UserPackage from "../models/UserPackage.js";
import Notification from "../models/Notification.js";
import Discount from "../models/Discount.js";
import { sendEmail } from "../utils/sendVerificationEmail.js";
import mongoose from "mongoose";

dotenv.config();
// function removeVietnameseTones(str) {
//   str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/gi, "a");
//   str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/gi, "e");
//   str = str.replace(/ì|í|ị|ỉ|ĩ/gi, "i");
//   str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/gi, "o");
//   str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/gi, "u");
//   str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/gi, "y");
//   str = str.replace(/đ/gi, "d");
//   str = str.replace(/[^a-zA-Z0-9\s]/g, "");

//   str = str.trim();
//   return str;
// }

const generateTransactionId = () => {
  return "TRANS" + new Date().getTime();
};

const generateOrderId = (paymentMethod) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const vnpayTmnCode = process.env.VNPAY_PARTNER_CODE;

  if (paymentMethod === "MoMo") {
    return partnerCode + new Date().getTime();
  } else if (paymentMethod === "VNPay") {
    return vnpayTmnCode + new Date().getTime();
  }
  return "DEFAULT" + new Date().getTime();
};

export const createPayment = async (req, res, next) => {
  try {
    const { coin, paymentMethod, packageId, type } = req.body;
    const userId = req.user.userId;

    const wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy ví của người dùng." });
    }

    if (coin <= 0) {
      return res.status(400).json({ message: "Số xu nạp phải lớn hơn 0." });
    } else if (coin >= 10000) {
      return res.status(400).json({ message: "Số xu nạp phải nhỏ hơn 10000." });
    }
    const existingPayment = await Payment.findOne({
      user: userId,
      status: "Đang xử lý",
      notification: "Nạp xu vào ví",
    });

    if (existingPayment) {
      return res.status(400).json({
        message:
          "Có giao dịch đang được xử lý. Vui lòng hủy hoặc thanh toán nốt giao dịch cũ ",
      });
    }
    const amount = coin * 1000;
    const transactionId = generateTransactionId();
    const orderId = generateOrderId(paymentMethod);

    const newPayment = new Payment({
      transactionId,
      orderId,
      walletId: wallet._id,
      type: type,
      amount: coin,
      packageId,
      paymentMethod,
      status: "Đang xử lý",
      user: userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    await newPayment.save();

    const newPayments = new Payment({
      transactionId,
      orderId,
      walletId: wallet._id,
      type: type,
      amount,
      packageId,
      paymentMethod,
      status: "Đang xử lý",
      user: userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    let paymentUrl;
    if (paymentMethod === "MoMo") {
      paymentUrl = await payMoMo(newPayments);
    } else if (paymentMethod === "VNPay") {
      paymentUrl = await payVNPay(newPayments);
    } else {
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    return res.status(200).json({ paymentUrl });
  } catch (error) {
    next(error);
  }
};

export const checkAndUpdatePaymentStatus = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error("Không tìm thấy giao dịch.");
    }

    if (Date.now() > payment.expiresAt) {
      if (payment.status === "Đang xử lý") {
        payment.status = "Thất bại";
        await payment.save();
      }
      throw new Error("Giao dịch đã hết hạn.");
    }
  } catch (error) {
    console.error("Error in checkAndUpdatePaymentStatus:", error);
    throw error;
  }
};

export const selectPackage = async (req, res, next) => {
  try {
    const { packageId, paymentMethod, email, type } = req.body;
    const userId = req.user.userId;

    const activePayment = await Payment.findOne({
      user: userId,
      status: { $in: ["Thành công", "Đang xử lý"] },
      packageExpiresAt: { $gt: new Date() },
    });

    if (activePayment) {
      return res.status(400).json({
        message:
          "Bạn đã có gói đang hoạt động. Vui lòng nâng cấp hoặc chờ gói hiện tại hết hạn.",
      });
    }

    const existingPayment = await Payment.findOne({
      user: userId,
      package: packageId,
      status: "Đang xử lý",
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Đã có giao dịch vui lòng thanh toán trước.",
      });
    }

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return res.status(404).json({ message: "Gói không tìm thấy." });
    }

    const transactionId = generateTransactionId();
    const orderId = generateOrderId(paymentMethod);

    const packageExpiresAt = new Date(
      Date.now() + selectedPackage.durationInMonths * 30 * 24 * 60 * 60 * 1000
    );

    const newPayment = new Payment({
      transactionId,
      orderId,
      package: packageId,
      amount: selectedPackage.price,
      paymentMethod,
      status: "Đang xử lý",
      user: userId,
      email,
      expiresAt: Date.now() + 3600000,
      packageExpiresAt,
    });

    await newPayment.save();

    let paymentUrl;
    if (paymentMethod === "MoMo") {
      paymentUrl = await payMoMo(newPayment, selectedPackage.name);
    } else if (paymentMethod === "VNPay") {
      paymentUrl = await payVNPay(newPayment, selectedPackage.name);
    } else {
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    return res.status(200).json({ paymentUrl });
  } catch (error) {
    next(error);
  }
};

export const upgradePackage = async (req, res, next) => {
  try {
    const { packageId, paymentMethod } = req.body;
    const userId = req.user.userId;

    const existingPayment = await Payment.findOne({
      user: userId,
      status: "Thành công",
    });

    if (!existingPayment) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy gói bạn đã mua." });
    }

    const recentPayment = await Payment.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate("package");

    if (!recentPayment) {
      return res.status(400).json({ message: "Người dùng chưa mua gói nào." });
    }

    const timeElapsed =
      Date.now() - new Date(recentPayment.createdAt).getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    if (timeElapsed > threeDays) {
      return res
        .status(400)
        .json({ message: "Không thể nâng cấp gói vì đã quá 3 ngày." });
    }

    const oldPackage = recentPayment.package;
    const newPackage = await Package.findById(packageId);

    if (!newPackage) {
      return res.status(404).json({ message: "Gói mới không hợp lệ." });
    }

    const discountAmount = oldPackage.price * 0.8;
    const amountToPay = newPackage.price - discountAmount;

    if (amountToPay <= 0) {
      return res.status(400).json({ message: "Gói mới phải lớn hơn gói cũ." });
    }

    const transactionId = generateTransactionId();
    const orderId = generateOrderId(paymentMethod);

    const packageExpiresAt = new Date(
      Date.now() + newPackage.durationInMonths * 30 * 24 * 60 * 60 * 1000
    );

    const newPayment = new Payment({
      transactionId,
      orderId,
      package: packageId,
      amount: amountToPay,
      paymentMethod,
      status: "Đang xử lý",
      user: userId,
      email: recentPayment.email,
      packageExpiresAt,
      notification: "Đang nâng cấp gói. Vui lòng hoàn tất thanh toán.",
    });

    await newPayment.save();

    let paymentUrl;
    if (paymentMethod === "MoMo") {
      paymentUrl = await payMoMo(newPayment, newPackage.name);
    } else if (paymentMethod === "VNPay") {
      paymentUrl = await payVNPay(newPayment, newPackage.name);
    } else {
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    // Trả về URL thanh toán
    return res
      .status(200)
      .json({ message: "Vui lòng hoàn tất thanh toán", paymentUrl });
  } catch (error) {
    next(error);
  }
};

export const payVNPay = async (payment, packageName) => {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  let vnpUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.FRONTEND_URL;
  const vnp_IpAddr = "127.0.0.1";

  const orderId = payment.orderId;
  const amount = payment.amount;
  const orderInfo = packageName;
  const locale = "vn";
  const currCode = "VND";
  const orderType = "other";
  const bankCode = "VNPAYQR";

  const createDate = moment().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmss");
  const expireDate = moment()
    .tz("Asia/Ho_Chi_Minh")
    .add(15, "minutes")
    .format("YYYYMMDDHHmmss");

  // Khởi tạo tham số VNPay
  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: currCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Locale: locale,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: vnp_IpAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
    vnp_BankCode: bankCode,
    // vnp_SecureHashType: "SHA512",
  };
  console.log(11, vnp_Params);

  vnp_Params = sortObject(vnp_Params);

  vnp_Params["vnp_SecureHash"] = crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(JSON.stringify(vnp_Params), "utf-8"))
    .digest("hex");

  const paymentUrl = (vnpUrl +=
    "?" + querystring.stringify(vnp_Params, { encode: false }));

  console.log(111, paymentUrl);

  return paymentUrl;
};

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

export const payMoMo = async (payment) => {
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const redirectUrl = `${process.env.FRONTEND_URL}/bill`;
  const ipnUrl = `${process.env.BACKEND_URL}/api/payment/callbackMoMo`;
  const requestType = "payWithMethod";
  const amount = payment.amount;
  const orderInfo = `Nạp tiền vào ví`;
  const orderId = payment.orderId;
  const requestId = orderId;
  const autoCapture = true;
  const lang = "vi";
  const extraData = "";
  const orderGroupId = "";

  // Tạo chuỗi chữ ký để mã hóa
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  // Tạo chữ ký HMAC-SHA256
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  // Tạo body request
  const requestBody = JSON.stringify({
    partnerCode,
    partnerName: "Test",
    storeId: "Momo Store",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId,
    signature,
  });

  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody, "utf-8"),
    },
    data: requestBody,
  };

  try {
    // Gửi yêu cầu đến MoMo
    const response = await axios(options);
    return response.data.payUrl;
  } catch (error) {
    throw new Error("Thất bại khi khởi tạo thanh toán với MoMo");
  }
};

export const paymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const userId = req.user.userId;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy ví của người dùng." });
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch." });
    }
    const packageId = payment.packageId;

    const packages = await Package.findOne({ _id: packageId });

    if (payment.status === "Thành công") {
      if (payment.type === "deposit") {
        return res.status(200).json({
          message: "Thanh toán thành công!",
          status: payment.status,
          amount: payment.amount,
          type: payment.type,
          transactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
        });
      } else if (payment.type === "withdraw" || payment.type === "renewal") {
        return res.status(200).json({
          message: "Thanh toán thành công!",
          status: payment.status,
          amount: payment.amount,
          type: payment.type,
          transactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
          packageName: packages.name,
        });
      }
    }

    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${orderId}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      orderId,
      partnerCode,
      signature,
      requestId: orderId,
      lang: "vi",
    });

    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/query",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody, "utf-8"),
      },
      data: requestBody,
    };

    const result = await axios(options);
    const { resultCode, message } = result.data;

    let notificationTitle = "";
    let notificationMessage = "";

    if (resultCode === 0) {
      if (payment.type === "deposit") {
        payment.status = "Thành công";
        payment.notification = "Đã nạp xu thành công";
        await payment.save();
        wallet.balance += payment.amount;
        wallet.type = "deposit";
        await wallet.save();

        notificationTitle = "Nạp xu vào ví thành công";
        notificationMessage = `Bạn đã nạp xu thành công với số xu ${payment.amount} .`;
      } else if (payment.type === "withdraw") {
        const paymentOld = await Payment.findOne({
          user: userId,
          status: "Thành công",
          type: "withdraw",
        });

        if (paymentOld) {
          paymentOld.status = "Đã hủy";
          paymentOld.notification = "Đã nâng cấp thành công";
          await paymentOld.save();
        }
        payment.status = "Thành công";
        payment.notification = `Thanh toán ${packages.name}`;
        await payment.save();
        notificationTitle = "Thanh toán thành công";
        notificationMessage = `Bạn đã thanh toán thành công cho ${packages.name} với ${payment.amount} xu.`;
        try {
          const userPackage = await UserPackage.findOne({
            userId: userId,
          });
          const durationInMonths = packages.durationInMonths || 0;

          if (!userPackage) {
            const newUserPackage = new UserPackage({
              userId: wallet.userId,
              packageId: [packages._id],
              expirationDate: moment().add(durationInMonths * 30, "days"),
              status: "active",
            });
            await newUserPackage.save();
          } else {
            userPackage.packageId = packages._id;
            const newExpirationDate = moment().add(
              durationInMonths * 30,
              "days"
            );
            userPackage.expirationDate = newExpirationDate;
            userPackage.status = "active";
            await userPackage.save();
          }

          await payment.save();

          const user = await User.findById(userId);
          const emailHtml = `
          <h3>Xin chào ${user.name},</h3>
          <p>Bạn đã thanh toán thành công gói dịch vụ <b>${packages.name}</b>.</p>
          <p>Số tiền thanh toán: <b>${payment.amount} xu</b>.</p>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
          `;

          await sendEmail(
            user.email,
            "Xác nhận thanh toán thành công",
            emailHtml
          );
          await Notification.create({
            userId,
            title: notificationTitle,
            message: notificationMessage,
            type: "payment",
          });

          return res.status(200).json({
            message: "Thanh toán thành công!",
            status: payment.status,
            amount: payment.amount,
            type: payment.type,
            transactionId: payment.transactionId,
            paymentMethod: payment.paymentMethod,
            packageName: packages.name,
          });
        } catch (error) {
          console.error("Error in saving payment:", error);
          return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
        }
      } else if (payment.type === "renewal") {
        payment.status = "Thành công";
        payment.notification = `Gia hạn gói ${packages.name}`;
        await payment.save();

        notificationTitle = "Gia hạn gói thành công";
        notificationMessage = `Bạn đã gia hạn gói thành công cho ${packages.name} với ${payment.amount} xu.`;

        try {
          const userPackage = await UserPackage.findOne({ userId: userId });
          const durationInMonths = packages.durationInMonths || 0;
          const currentExpirationDate = moment(userPackage.expirationDate);

          if (!userPackage) {
            const newUserPackage = new UserPackage({
              userId: wallet.userId,
              packageId: [packages._id],
              expirationDate: currentExpirationDate.add(
                durationInMonths * 30,
                "days"
              ),
              status: "active",
            });
            await newUserPackage.save();
          } else {
            // Cộng thời gian cũ và mới vào expirationDate

            const newExpirationDate = currentExpirationDate.isAfter(moment())
              ? currentExpirationDate.add(durationInMonths * 30, "days")
              : moment().add(durationInMonths * 30, "days");
            userPackage.packageId = packages._id;
            userPackage.expirationDate = newExpirationDate;
            userPackage.status = "active";
            await userPackage.save();
          }
          const user = await User.findById(userId);
          const emailHtml = `
            <h3>Xin chào ${user.name},</h3>
            <p>Bạn đã gia hạn thành công gói dịch vụ <b>${
              packages.name
            }</b>.</p>
            <p>Số tiền thanh toán: <b>${payment.amount} xu</b>.</p>
            <p>Ngày hết hạn mới của bạn là: <b>${moment(
              userPackage.expirationDate
            ).format("DD/MM/YYYY")}</b>.</p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
          `;

          await sendEmail(
            user.email,
            "Xác nhận thanh toán thành công",
            emailHtml
          );

          await Notification.create({
            userId,
            title: notificationTitle,
            message: notificationMessage,
            type: "payment",
          });

          return res.status(200).json({
            message: "Thanh toán thành công!",
            status: payment.status,
            amount: payment.amount,
            type: payment.type,
            transactionId: payment.transactionId,
            paymentMethod: payment.paymentMethod,
            packageName: packages.name,
            newExpirationDate: moment(userPackage.expirationDate).format(
              "DD/MM/YYYY"
            ),
          });
        } catch (error) {
          console.error("Error in saving payment:", error);
          return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
        }
      }

      await Notification.create({
        userId,
        title: notificationTitle,
        message: notificationMessage,
        type: "payment",
      });

      return res.status(200).json({
        message: "Giao dịch thành công!",
        status: payment.status,
        transactionId: payment.transactionId,
        amount: payment.amount,
        type: payment.type,
        paymentMethod: payment.paymentMethod,
        notification: payment.notification,
        packageId: payment?.packageId,
      });
    } else {
      payment.status = "Thất bại";
      payment.notification = message;
      await payment.save();

      await Notification.create({
        userId,
        title: "Thanh toán thất bại",
        message: `Giao dịch thanh toán của bạn đã thất bại: ${message}`,
        type: "error",
      });

      return res.status(400).json({
        message: `Thanh toán không thành công: ${message}`,
        status: payment.status,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        reason: message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const selectPackageAndPay = async (req, res, next) => {
  try {
    const { packageId, type, paymentMethod, discount } = req.body;
    const userId = req.user.userId;

    const selectedPackage = await Package.findById(packageId);

    if (!selectedPackage) {
      return res.status(404).json({ message: "Gói dịch vụ không tồn tại." });
    }
    const UserPayment = await UserPackage.findOne({
      user: userId,
      status: "active",
    });

    if (UserPayment) {
      return res
        .status(400)
        .json({ message: "Bạn đã đăng ký gói dịch vụ này rồi." });
    }

    const UserStatus = await Payment.findOne({
      user: userId,
      status: "Đang xử lý",
    });
    if (UserStatus) {
      return res.status(400).json({
        message: "Bạn đang có giao dịch vui lòng hoàn thành giao dịch trước đó",
      });
    }

    const wallet = await Wallet.findOne({ userId: userId });
    if (paymentMethod === "Wallet") {
      return await processPayment(
        wallet,
        selectedPackage,
        res,
        0,
        userId,
        type,
        discount
      );
    } else if (paymentMethod === "MoMo" || paymentMethod === "VNPay") {
      return await handlePayment(
        wallet,
        selectedPackage,
        res,
        0,
        userId,
        type,
        paymentMethod,
        discount
      );
    }
  } catch (error) {
    console.error("Error in selectPackageAndPay:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const upgradeSelectPackageAndPay = async (req, res, next) => {
  try {
    const { packageId, type, paymentMethod, discount } = req.body;
    const userId = req.user.userId;

    const UserStatus = await Payment.findOne({
      user: userId,
      status: "Đang xử lý",
    });
    if (UserStatus) {
      return res.status(400).json({
        message: "Bạn đang có giao dịch vui lòng hoàn thành giao dịch trước đó",
      });
    }
    const selectedPackage = await Package.findById({ _id: packageId });

    if (!selectedPackage) {
      return res.status(404).json({ message: "Gói dịch vụ không tồn tại." });
    }

    let discountAmount = 0;

    const userPackage = await UserPackage.findOne({ userId: userId });
    if (!userPackage) {
      return res
        .status(404)
        .json({ message: "Bạn chưa đăng ký gói dịch vụ nào." });
    }
    const packageIdOld = userPackage.packageId;
    const existingPackage = await Package.findById({ _id: packageIdOld });

    if (!existingPackage) {
      return res.status(404).json({ message: "Gói dịch vụ cũ không tồn tại." });
    }

    if (existingPackage.price >= selectedPackage.price) {
      return res
        .status(400)
        .json({ message: "Giá gói mới phải cao hơn giá gói cũ" });
    }
    const wallet = await Wallet.findOne({ userId: userId });
    const expiryDate = moment(userPackage.expirationDate);
    const currentDate = moment();
    const diffDays = currentDate.diff(expiryDate, "days");

    // Nếu gói cũ đã hết hạn hơn 3 ngày
    if (diffDays > 3) {
      return res
        .status(400)
        .json({ message: "Bạn không thể nâng cấp gói sau 3 ngày" });
    }
    discountAmount = selectedPackage.price - existingPackage.price * 0.8;
    if (paymentMethod === "Wallet") {
      return await processPayment(
        wallet,
        selectedPackage,
        res,
        discountAmount,
        userId,
        type,
        discount
      );
    } else if (paymentMethod === "MoMo" || paymentMethod === "VNPay") {
      return await handlePayment(
        wallet,
        selectedPackage,
        res,
        discountAmount,
        userId,
        type,
        paymentMethod,
        discount
      );
    }
  } catch (error) {
    next(error);
  }
};

export const renewPackage = async (req, res, next) => {
  try {
    const { paymentMethod, discount } = req.body;
    const userId = req.user.userId;

    const UserStatus = await Payment.findOne({
      user: userId,
      status: "Đang xử lý",
    });
    if (UserStatus) {
      return res.status(400).json({
        message: "Bạn đang có giao dịch vui lòng hoàn thành giao dịch trước đó",
      });
    }

    const userPackage = await UserPackage.findOne({ userId: userId });

    if (!userPackage) {
      return res
        .status(404)
        .json({ message: "Bạn chưa đăng ký gói dịch vụ nào." });
    }

    const currentPackage = await Package.findById(userPackage.packageId);

    if (!currentPackage) {
      return res.status(404).json({ message: "Gói dịch vụ không tồn tại." });
    }
    const type = "renewal";

    let discountAmount = 0;
    if (discount) {
      discountAmount = currentPackage.price;
    } else {
      discountAmount = currentPackage.price * 0.9;
    }
    const wallet = await Wallet.findOne({ userId: userId });

    if (paymentMethod === "Wallet") {
      return await processPayment(
        wallet,
        currentPackage,
        res,
        discountAmount,
        userId,
        type,
        discount
      );
    } else if (paymentMethod === "MoMo" || paymentMethod === "VNPay") {
      return await handlePayment(
        wallet,
        currentPackage,
        res,
        discountAmount,
        userId,
        type,
        paymentMethod,
        discount
      );
    }
  } catch (error) {
    next(error);
  }
};

const processPayment = async (
  wallet,
  selectedPackage,
  res,
  discountAmount,
  userId,
  type,
  discount
) => {
  if (wallet.balance < selectedPackage.price) {
    return res.status(400).json({
      message: "Số dư ví không đủ để thanh toán gói dịch vụ.",
    });
  }
  const balance = wallet.balance;

  if (isNaN(balance) || balance < 0) {
    return res.status(400).json({ message: "Số dư ví không hợp lệ." });
  }

  const amount =
    !isNaN(discountAmount) && discountAmount > 0
      ? discountAmount
      : !isNaN(selectedPackage.price) && selectedPackage.price > 0
      ? selectedPackage.price
      : 0;

  if (amount <= 0) {
    return res
      .status(400)
      .json({ message: "Số tiền thanh toán không hợp lệ." });
  }
  if (discount === null) {
    discount = 0;
  }
  const discounts = await Discount.findOne({ _id: discount });
  const percentDiscount = discounts?.discountPercentage || 0;
  const discountedAmount = amount - (amount * percentDiscount) / 100;
  let notificationTitle = "";
  let notificationMessage = "";

  if (discount) {
    await Discount.updateOne(
      { _id: discount },
      { $pull: { applicableUsers: userId } }
    );
  }

  wallet.balance -= discountedAmount;
  await wallet.save();
  if (type === "withdraw") {
    notificationTitle = "Thanh toán gói dịch vụ thành công";
    notificationMessage = `Bạn đã thanh toán thành công cho gói ${selectedPackage.name} với  ${amount} xu.`;

    await Notification.create({
      userId,
      title: notificationTitle,
      message: notificationMessage,
      type: "payment",
    });

    const transactionId = generateTransactionId();

    const paymentOld = await Payment.findOne({
      user: userId,
      status: "Thành công",
      type: "withdraw",
    });
    if (paymentOld) {
      paymentOld.status = "Đã hủy";
      paymentOld.notification = "Đã nâng cấp thành công";
      await paymentOld.save();
    }
    const payment = new Payment({
      packageId: selectedPackage._id,
      user: wallet.userId,
      amount: amount,
      type: type,
      walletId: wallet._id,
      paymentMethod: "Wallet",
      transactionId: transactionId,
      status: "Thành công",
      notification: `Thanh toán ${selectedPackage.name}`,
    });
    //// gửi email
    const user = await User.findById(wallet.userId);
    const emailHtml = `
      <h3>Xin chào ${user.name},</h3>
      <p>Bạn đã thanh toán thành công gói dịch vụ <b>${selectedPackage.name}</b>.</p>
      <p>Số tiền thanh toán: <b>${amount} xu</b>.</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
    `;

    await sendEmail(user.email, "Xác nhận thanh toán thành công", emailHtml);

    try {
      const userPackage = await UserPackage.findOne({ userId: wallet.userId });
      const durationInMonths = selectedPackage.durationInMonths || 0;

      if (!userPackage) {
        const newUserPackage = new UserPackage({
          userId: wallet.userId,
          packageId: [selectedPackage._id],
          expirationDate: moment().add(durationInMonths * 30, "days"),
        });
        await newUserPackage.save();
      } else {
        userPackage.packageId = selectedPackage._id;
        const newExpirationDate = moment().add(durationInMonths * 30, "days");
        userPackage.expirationDate = newExpirationDate;
        await userPackage.save();
      }

      await payment.save();
      return res.status(200).json({
        message: "Thanh toán thành công!",
        status: payment.status,
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        packageName: selectedPackage.name,
      });
    } catch (error) {
      console.error("Error in saving payment:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  } else if (type === "renewal") {
    notificationTitle = "Gia hạn gói thành công";
    notificationMessage = `Bạn đã gia hạn gói thành công cho gói ${selectedPackage.name} với ${amount} xu.`;

    await Notification.create({
      userId,
      title: notificationTitle,
      message: notificationMessage,
      type: "payment",
    });

    const transactionId = generateTransactionId();

    const payment = new Payment({
      packageId: selectedPackage._id,
      user: wallet.userId,
      amount: amount,
      type: type,
      walletId: wallet._id,
      paymentMethod: "Wallet",
      transactionId: transactionId,
      status: "Thành công",
      notification: `Gia hạn gói ${selectedPackage.name}`,
    });

    // Gửi email
    const user = await User.findById(wallet.userId);
    const emailHtml = `
      <h3>Xin chào ${user.name},</h3>
      <p>Bạn đã gia hạn thành công gói dịch vụ <b>${selectedPackage.name}</b>.</p>
      <p>Số tiền thanh toán: <b>${amount} xu</b>.</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
    `;

    await sendEmail(user.email, "Xác nhận gia hạn thành công", emailHtml);

    try {
      const userPackage = await UserPackage.findOne({ userId: wallet.userId });
      const durationInMonths = selectedPackage.durationInMonths || 0;

      // Tính ngày hết hạn mới
      const currentExpirationDate = moment(userPackage.expirationDate);
      const newExpirationDate = currentExpirationDate.isValid()
        ? currentExpirationDate.add(durationInMonths * 30, "days")
        : moment().add(durationInMonths * 30, "days");

      if (!userPackage) {
        const newUserPackage = new UserPackage({
          userId: wallet.userId,
          packageId: [selectedPackage._id],
          expirationDate: newExpirationDate.toDate(),
          status: "active",
        });
        await newUserPackage.save();
      } else {
        // Nếu đã có userPackage, cập nhật
        userPackage.packageId = selectedPackage._id;
        userPackage.expirationDate = newExpirationDate.toDate();
        userPackage.status = "active";
        await userPackage.save();
      }

      await payment.save();
      return res.status(200).json({
        message: "Thanh toán thành công!",
        status: payment.status,
        type: payment.type,
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        packageName: selectedPackage.name,
      });
    } catch (error) {
      console.error("Error in saving payment:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
};

const handlePayment = async (
  wallet,
  selectedPackage,
  res,
  discountAmount,
  userId,
  type,
  paymentMethod,
  discount
) => {
  try {
    const amount =
      discountAmount !== 0 && discountAmount !== undefined
        ? discountAmount
        : selectedPackage.price;

    const discounts = await Discount.findOne({ _id: discount });
    const percentDiscount = discounts?.discountPercentage || 0;
    const discountedAmount = amount - (amount * percentDiscount) / 100;
    if (discount) {
      await Discount.updateOne(
        { _id: discount },
        { $pull: { applicableUsers: userId } }
      );
    }

    const packageId = selectedPackage._id;
    const transactionId = generateTransactionId();
    const orderId = generateOrderId(paymentMethod);
    const newPayment = new Payment({
      transactionId,
      orderId,
      walletId: wallet._id,
      type: type,
      amount: discountedAmount,
      packageId,
      paymentMethod,
      status: "Đang xử lý",
      user: userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    await newPayment.save();

    const newPayments = new Payment({
      transactionId,
      orderId,
      walletId: wallet._id,
      type: type,
      amount: discountedAmount * 1000,
      packageId,
      paymentMethod,
      status: "Đang xử lý",
      user: userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    let paymentUrl;
    if (paymentMethod === "MoMo") {
      paymentUrl = await payMoMo(newPayments);
    } else if (paymentMethod === "VNPay") {
      paymentUrl = await payVNPay(newPayments);
    } else {
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    return res.status(200).json({ paymentUrl });
  } catch (error) {
    console.error("Error in handlePayment:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateExpiredPayments = async () => {
  const now = moment().startOf("second");

  try {
    const nearExpiryPayments = await UserPackage.find({});

    for (const userPackage of nearExpiryPayments) {
      const expirationDate = moment(userPackage.expirationDate).startOf(
        "second"
      );
      const diffSeconds = expirationDate.diff(now, "seconds");

      if (diffSeconds === 0) {
        userPackage.status = "expired";
        await userPackage.save();

        const payment = await Payment.findOne({
          user: userPackage.userId,
          status: "Thành công",
        });
        payment.status = "Đã hết hạn";
        await payment.save();
      }
      const packages = userPackage.packageId;
      const daysInSeconds = packages.durationInMonths * 30 * 24 * 60 * 60;
      if (daysInSeconds <= diffSeconds) {
        const dayDiff = diffSeconds - daysInSeconds;
        if (dayDiff === 0) {
          const payment = await Payment.findOne({
            user: userPackage.userId,
            status: "Thành công",
            type: "withdraw",
          });
          if (payment) {
            payment.status = "Đã hết hạn";
            await payment.save();
          }
          const payment2 = await Payment.findOne({
            user: userPackage.userId,
            status: "Thành công",
            type: "renewal",
          });
          if (payment2) {
            payment2.type = "withdraw";
            await payment2.save();
          }
        }
      }
      if (diffSeconds === 3 * 24 * 60 * 60) {
        const user = await User.findById(userPackage.userId);
        if (user) {
          const emailHtml = `
          <h3>Xin chào ${user.name},</h3>
          <p>Gói dịch vụ của bạn sẽ hết hạn trong ${Math.floor(
            diffSeconds / (60 * 60 * 24)
          )} ngày nữa. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.</p>
          <p>Đặc biệt, bạn sẽ được giảm 10% khi gia hạn gói dịch vụ trước khi hết hạn.</p>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
        `;

          await sendEmail(
            user.email,
            "Thông báo gia hạn gói dịch vụ",
            emailHtml
          );
          console.log(
            `Đã gửi email thông báo gia hạn cho người dùng ${user._id}`
          );
        }
      }
    }

    const payments = await Payment.find({});
    for (const payment of payments) {
      const expirationDate = moment(payment.packageExpiresAt).startOf("second");
      const diffSeconds = expirationDate.diff(now, "seconds");
      if (
        payment.status === "Thành công" &&
        payment.type === "withdraw" &&
        diffSeconds === 0
      ) {
        payment.status = "Đã hết hạn";
        await payment.save();
        const payment2 = await Payment.findOne({
          user: payment.user,
          type: "renewal",
        });
        if (payment2) {
          payment2.type = "withdraw";
          await payment2.save();
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái các giao dịch hết hạn:", error);
  }
};

export const checkPackageUser = async (req, res, next) => {
  const userId = req.user.userId;
  const userPackage = await UserPackage.findOne({ userId: userId });
  if (!userPackage) {
    return res
      .status(200)
      .json({ message: "Chưa mua gói hoặc hết hạn", status: false });
  }
  const PackageId = userPackage.packageId;

  const expirationDate = moment(userPackage.expirationDate);
  const now = moment();

  if (expirationDate.diff(now, "day") <= 0) {
    const payment = await Payment.findOne({
      packageId: PackageId,
      user: userId,
    });
    payment.status = "Đã hết hạn";
    await payment.save();
    return res.status(200).json({ message: "Hết hạn gói", status: false });
  }
  return res.status(200).json({ status: true });
};

//Hủy giao dịch
export const cancelPayment = async (req, res, next) => {
  const userId = req.user.userId;
  const { id } = req.body;

  try {
    const transaction = await Payment.findOne({
      user: userId,
      _id: id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    if (transaction.status !== "Đang xử lý") {
      return res.status(400).json({
        message: "Chỉ có thể tiếp tục giao dịch đã hủy",
      });
    }

    transaction.status = "Đã hủy";
    await transaction.save();
    return res.status(200).json({ message: "Hủy giao dịch thành công" });
  } catch (error) {
    next(error);
  }
};

//Tiếp tự giao dịch
export const continuePayment = async (req, res, next) => {
  const { id } = req.body;
  const userId = req.user.userId;

  try {
    const newPayment = await Payment.findOne({
      _id: id,
      user: userId,
    });
    console.log(newPayment);

    if (!newPayment) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    if (newPayment.status !== "Đang xử lý") {
      return res.status(400).json({
        message: "Chỉ có thể tiếp tục giao dịch đang giao dịch",
      });
    }
    const newPayments = new Payment({
      transactionId: newPayment.transactionId,
      orderId: newPayment.orderId,
      walletId: newPayment.walletId,
      type: newPayment.type,
      amount: newPayment.amount * 1000,
      packageId: newPayment.packageId,
      paymentMethod: newPayment.paymentMethod,
      status: "Đang xử lý",
      user: newPayment.user,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    let paymentUrl;
    if (newPayment.paymentMethod === "MoMo") {
      paymentUrl = await payMoMo(newPayments);
    } else if (newPayment.paymentMethod === "VNPay") {
      paymentUrl = await payVNPay(newPayments);
    } else {
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ." });
    }
    return res.status(200).json({ paymentUrl });
  } catch (error) {
    next(error);
  }
};

export const getUserPackageByUserId = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const userPackage = await UserPackage.findOne({ userId: userId }).populate({
      path: "packageId",
      select: "name price",
    });

    if (!userPackage) {
      return res.status(404).json({
        message: "Không tìm thấy gói dịch vụ của người dùng.",
      });
    }

    res.status(200).json({
      message: "Lấy thông tin gói thành công",
      data: {
        userId: userPackage.userId,
        package: {
          name: userPackage.packageId.name,
          price: userPackage.packageId.price,
        },
        expirationDate: userPackage.expirationDate,
        status: userPackage.status,
        createdAt: userPackage.createdAt,
        updatedAt: userPackage.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

//in ra thông tin gói dựa và param userId
export const getUserPackageByUserIds = async (req, res, next) => {
  try {
    // Lấy userId từ params và chuyển đổi thành ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const userPackage = await UserPackage.findOne({
      userId: userId,
      status: "active",
    }).populate({
      path: "packageId",
      select: "name price",
    });

    res.status(200).json({
      message: "Lấy thông tin gói thành công",
      data: {
        userId: userPackage.userId,
        package: {
          name: userPackage.packageId.name,
          price: userPackage.packageId.price,
        },
        expirationDate: userPackage.expirationDate,
        status: userPackage.status,
        createdAt: userPackage.createdAt,
        updatedAt: userPackage.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
