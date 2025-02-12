import mongoose from "mongoose";

const movieSubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    status: {
      type: String,
      enum: ["Đang chờ", "Đã thông báo"],
      default: "Đang chờ",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MovieSubscription = mongoose.model(
  "MovieSubscription",
  movieSubscriptionSchema
);

export default MovieSubscription;
