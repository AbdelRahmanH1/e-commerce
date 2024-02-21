import { model, Schema, Types } from "mongoose";
import cloudinary from "../../src/utils/cloudnary.js";
const productSchema = new Schema(
  {
    name: { type: String, required: true, min: 2, max: 20 },
    description: { type: String, min: 10, max: 200 },
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    defaultImage: {
      url: { type: String, required: true },
      id: { type: String, required: true },
    },
    avaliableItems: { type: Number, min: 1, required: true },
    soldItems: { type: Number, default: 0 },
    price: { type: Number, min: 1, required: true },
    discount: { type: Number, min: 1, max: 100 },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brand: { type: Types.ObjectId, ref: "Brand", required: true },
    cloudFolder: { type: String, unique: true, required: true },
    averageRate: { type: Number, min: 1, max: 5 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true,
  }
);
productSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.CLOUDNARY_NAME}/products/${this.cloudFolder}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.CLOUDNARY_NAME}/products/${this.cloudFolder}`
    );
  }
);
productSchema.query.paginate = function (page) {
  page = page < 1 || isNaN(page) || !page ? 1 : page;
  const limit = 2;
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};
productSchema.query.search = function (keyword) {
  if (keyword) {
    return this.find({ name: { $regex: keyword, $options: "i" } });
  }
  return this;
};
productSchema.methods.inStock = function (quantity) {
  return this.avaliableItems > quantity ? true : false;
};
productSchema.virtual("finalPrice").get(function () {
  return Number.parseFloat(
    this.price - (this.price * this.discount || 0) / 100
  ).toFixed(2);
});
const productModel = model("Product", productSchema);
export default productModel;
