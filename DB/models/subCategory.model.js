import { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    image: { id: { type: String }, url: { type: String } },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    brands: [{ type: Types.ObjectId, ref: "Brand" }],
  },
  { timestamps: true }
);
const subCategoryModel = model("Subcategory", subCategorySchema);
export default subCategoryModel;
