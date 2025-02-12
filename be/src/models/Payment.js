import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  orderId: { type: String },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    default: null,
  },
  type: {
    type: String,
    enum: ["deposit", "withdraw", "renewal"],
  },
  notification: { type: String, default: "" },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["MoMo", "VNPay", "Wallet"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Thành công", "Đang xử lý", "Thất bại", "Đã hủy", "Đã hết hạn"],
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 3600000 },
  packageExpiresAt: { type: Date },
});

export default mongoose.model("Payment", PaymentSchema);
