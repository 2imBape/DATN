import { Package } from "./Package";
import { User } from "./User";

export interface Payment {
  _id?: string | undefined;
  transactionId: string;
  amount: number;
  paymentMethod: "MoMo" | "VNPay" | "Wallet";
  status: "Thành công" | "Đang xử lý" | "Thất bại" | "Đã hủy" | "Đã hết hạn";
  packageExpiresAt: Date;
  createdAt: Date;
  package: Package;
  notification: string;
  type: "deposit" | "withdraw";
  user: User;
}
