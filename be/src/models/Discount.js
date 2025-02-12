import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const DiscountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: [0, "Phần trăm giảm giá phải lớn hơn hoặc bằng 0"],
      max: [100, "Phần trăm giảm giá phải nhỏ hơn hoặc bằng 100"],
    },
    expiry: {
      type: Date,
    },
    isPermanent: {
      type: Boolean,
      default: true,
    },
    applicableUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);
DiscountSchema.plugin(mongoosePaginate);
export default mongoose.model("Discount", DiscountSchema);
