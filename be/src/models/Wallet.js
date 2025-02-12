import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "Xu" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Wallet", WalletSchema);
