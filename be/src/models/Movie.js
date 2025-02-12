import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    origin_name: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    quality: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    video: {
      type: String,
    },
    trailer: {
      type: String,
    },
    isPendingDelete: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
      },
    ],
    country: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: false,
      },
    ],
    favoriteCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Đã xuất bản", "Sắp ra mắt"],
      default: "Đã xuất bản",
    },
    releaseDate: {
      type: Date,
      required: function () {
        return this.status === "Sắp ra mắt";
      },
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
    directors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
  },
  {
    timestamps: true,
  }
);

movieSchema.plugin(mongoosePaginate);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
