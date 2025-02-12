  import mongoose from "mongoose";

  const CountrySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
  });

  export default mongoose.model("Country", CountrySchema);
