import asynHandler from "../../utils/asyncHandler.js";
import subCategoryModel from "../../../DB/models/subCategory.model.js";
import categoryModel from "../../../DB/models/category.model.js";
import cloudnary from "../../utils/cloudnary.js";
import { slugary } from "../../utils/slugry.js";

export const createSubCategory = asynHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryID);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  if (!req.file)
    return next(new Error("SubCategory piv required", { cause: 400 }));

  const { secure_url, public_id } = await cloudnary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUDNARY_NAME}/subCategory/${category._id}`,
    }
  );
  await subCategoryModel.create({
    name: req.body.name,
    slug: slugary(req.body.name),
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    category: category._id,
  });
  return res.json({
    success: true,
    message: "SubCategory created successfully",
  });
});

export const updateSubCategory = asynHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryID);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  const subCategory = await subCategoryModel.findOne({
    _id: req.params.id,
    category: req.params.categoryID,
  });
  if (!subCategory)
    return next(new Error("subCategory not found", { cause: 404 }));

  if (subCategory.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Your are not the owner", { cause: 403 }));

  if (req.file) {
    const { secure_url, public_id } = await cloudnary.uploader.upload(
      req.file.path,
      {
        public_id: subCategory.images.id,
      }
    );
    subCategory.images = { id: public_id, url: secure_url };
  }
  subCategory.name = req.body.name ? req.body.name : subCategory.name;
  subCategory.slug = req.body.name ? slugary(req.body.name) : subCategory.slug;
  await subCategory.save();

  return res.json({
    success: true,
    message: "subCategory updated Successfully",
  });
});

export const deleteSubCategory = asynHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryID);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  const subCategory = await subCategoryModel.findOne({
    _id: req.params.id,
    category: req.params.categoryID,
  });

  if (!subCategory)
    return next(new Error("subCategory not found", { cause: 404 }));

  if (subCategory.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Your are not the owner", { cause: 403 }));
  console.log("im here");
  await cloudnary.uploader.destroy(subCategory.image.id);
  await cloudnary.api.delete_folder(
    `${process.env.CLOUDNARY_NAME}/subCategory/${category.id}`
  );
  await subCategory.deleteOne();
  return res.json({
    success: true,
    message: "SubCategory deleted successfully",
  });
});

export const getAllSubCategory = asynHandler(async (req, res, next) => {
  if (req.params.categoryID) {
    const subCategories = await subCategoryModel.find({
      category: req.params.categoryID,
    });
    return res.json({ success: true, results: { subCategories } });
  }
  const subCategories = await subCategoryModel
    .find({})
    .populate({
      path: "category",
      populate: [{ path: "createdBy", select: "username email -_id" }],
      select: "name slug -_id",
    });
  return res.json({ success: true, results: { subCategories } });
});
