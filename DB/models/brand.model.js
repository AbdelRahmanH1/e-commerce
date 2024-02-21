import { Schema, model, Types } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, unique: true, required: true, min: 2, max: 12 },
    slug: { type: String, required: true, unique: true },
    image: {
      url: { type: String, required: true },
      id: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const brandModel = model("Brand", brandSchema);

export default brandModel;
