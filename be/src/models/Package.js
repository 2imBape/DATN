import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    durationInMonths: { type: Number, required: true },
    description: {
      type: String,
      required: true,
    },
    concurrentDevices: { type: Number, required: true },
    channels: { type: Boolean, required: true },
    premiumSports: { type: Boolean, required: true },
    hboGo: { type: Boolean, required: true },
    noAds: { type: Boolean, required: true },
    kplusChannels: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Package", PackageSchema);
