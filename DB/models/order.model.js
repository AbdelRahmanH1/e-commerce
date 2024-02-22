import { Types, model, Schema } from "mongoose";
const orderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number, min: 1, default: 1 },
        name: String,
        itemPrice: Number,
        totalPrice: Number,
      },
    ],
    address: { type: String, required: true },
    payment: { type: String, default: "cash", enum: ["cash", "visa"] },
    phone: { type: String, required: true },
    price: { type: Number, required: true },
    invoice: { url: { type: String }, id: { type: String } },
    coupon: {
      id: { type: Types.ObjectId, ref: "Coupon" },
      name: String,
      discount: { type: Number, min: 1, max: 100 },
    },
    status: {
      type: String,
      default: "placed",
      enum: [
        "placed",
        "shipped",
        "delivered",
        "canceled",
        "refunded",
        "visa payed",
        "failed to pay",
      ],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
orderSchema.virtual("finalPrice").get(function () {
  return Number.parseFloat(
    this.price - (this.price - this.discount || 0) / 100
  ).toFixed(2);
});
const orderModel = model("Order", orderSchema);
export default orderModel;
