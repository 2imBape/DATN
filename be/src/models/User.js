import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String, unique: true, sparse: true },
    email: { type: String },
    password: { type: String },
    confirmPassword: { type: String },
    role: { type: String, default: "user" },
    phone: { type: String },
    avatar: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    provider: { type: String, default: null },
    socialId: { type: String },
    address: { type: String },
    userID: { type: String },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String },
    deletedAt: { type: Date, default: null },
    deleteOtp: { type: String, default: null },
    deleteOtpExpires: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    recoveryToken: { type: String, default: null },
    recoveryExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
    indexes: [{ email: 1, provider: 1, unique: true }],
  }
);
UserSchema.plugin(mongoosePaginate);

export default mongoose.model("User", UserSchema);
