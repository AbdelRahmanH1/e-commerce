import { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    orderId: { type: Types.ObjectId, ref: "Order", required: true },
  },
  {
    timestamps: true,
  }
);
const reviewModel = model("Review", reviewSchema);
export default reviewModel;
