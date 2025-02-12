import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    role: { type: String, enum: ["actors", "directors"], required: true },
    thumbnail: { type: String, required: true },
    description : { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Person", personSchema, "persons");
