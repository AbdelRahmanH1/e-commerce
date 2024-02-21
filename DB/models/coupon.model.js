import { Schema, Types, model } from "mongoose";

const couponSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    discount: { type: Number, min: 1, max: 100, required: true },
    expiredAt: { type: Number, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
const couponModel = model("Coupon", couponSchema);
export default couponModel;
