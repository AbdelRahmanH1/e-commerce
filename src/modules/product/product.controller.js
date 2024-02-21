import asynHandler from "../../utils/asyncHandler.js";
import categoryModel from "../../../DB/models/category.model.js";
import subCategoryModel from "../../../DB/models/subCategory.model.js";
import brandModel from "../../../DB/models/brand.model.js";
import productModel from "../../../DB/models/product.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudnary.js";

export const createProduct = asynHandler(async (req, res, next) => {
  //check category
  const category = await categoryModel.findById(req.body.category);
  if (!category) return next(new Error("Category not found", { cause: 404 }));
  // check subCategory
  const subCategory = await subCategoryModel.findById(req.body.subcategory);
  if (!subCategory)
    return next(new Error("subCategory not found", { cause: 404 }));
  //check brand
  const brand = await brandModel.findById(req.body.brand);
  if (!brand) return next(new Error("brand not found", { cause: 404 }));

  if (!req.files) return next(new Error("Pics required"));

  const cloudFolder = nanoid();

  let images = [];
  for (let file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.CLOUDNARY_NAME}/products/${cloudFolder}`,
      }
    );
    images.push({ url: secure_url, id: public_id });
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    {
      folder: `${process.env.CLOUDNARY_NAME}/products/${cloudFolder}`,
    }
  );

  await productModel.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user._id,
    images,
    defaultImage: { url: secure_url, id: public_id },
  });
  return res.json({ success: true, message: "Product add successfully" });
});

export const deleteProduct = asynHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await productModel.findById(id);
  if (!product) return next(new Error("Product not found", { cause: 404 }));

  if (req.user._id.toString() !== product.createdBy.toString())
    return next(new Error("Your are not the owner", { cause: 403 }));

  await product.deleteOne();

  return res.json({ success: true, message: "Product deleted successfully" });
});

export const getProduct = asynHandler(async (req, res, next) => {
  const { sort, page, keyword, category, subCategory, brand } = req.query;

  if (category && !(await categoryModel.findById(category)))
    return next(new Error("cant find subCategory", { cause: 404 }));
  if (subCategory && !(await subCategoryModel.findById(subCategory)))
    return next(new Error("cant find subCategory", { cause: 404 }));

  if (brand && !(await brandModel.findById(brand)))
    return next(new Error("cant find Brand", { cause: 404 }));
  const products = await productModel
    .find({ ...req.query })
    .sort(sort)
    .paginate(page)
    .search(keyword);
  return res.json({ success: true, results: { products } });
});
