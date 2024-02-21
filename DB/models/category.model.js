import { Schema, Types, model } from "mongoose";
import subCategoryModel from "./subCategory.model.js";
import cloudinary from "../../src/utils/cloudnary.js";
const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    images: { id: { type: String }, url: { type: String } },
    brands: [{ type: Types.ObjectId, ref: "Brand" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
categorySchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await subCategoryModel.findOneAndDelete({
      category: this._id,
    });
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.CLOUDNARY_NAME}/subCategory/${this.id}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.CLOUDNARY_NAME}/subCategory/${this.id}`
    );
  }
);
categorySchema.virtual("subCategory", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "category",
});
const categoryModel = model("Category", categorySchema);
export default categoryModel;
