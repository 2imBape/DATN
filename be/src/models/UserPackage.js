import mongoose from "mongoose";

const UserPackageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    expirationDate: { type: Date },
    status: { type: String, enum: ["active", "expired"], default: "active" },
  },
  {
    timestamps: true,
  }
);

const UserPackage = mongoose.model("UserPackage", UserPackageSchema);

export default UserPackage;
