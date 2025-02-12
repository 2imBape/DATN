import { Wallet } from "./Waller";

export interface User {
  _id?: string | undefined;
  name?: string;
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
  phone: string;
  avatar: string | null;
  role?: string;
  address: string;
  referredBy: string;
  referralCode: string;
  wallet?: Wallet;
  isVerified?: boolean;
}
