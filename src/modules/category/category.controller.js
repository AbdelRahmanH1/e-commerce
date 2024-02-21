import asynHandler from "../../utils/asyncHandler.js";
import cloudnary from "../../utils/cloudnary.js";
import categoryModel from "../../../DB/models/category.model.js";
import { slugary } from "../../utils/slugry.js";

export const createCategory = asynHandler(async (req, res, next) => {
  if (!req.file)
    return next(new Error("Category Pic required", { cause: 404 }));

  const { secure_url, public_id } = await cloudnary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUDNARY_NAME}/categories`,
    }
  );
  await categoryModel.create({
    name: req.body.name,
    slug: slugary(req.body.name),
    createdBy: req.user._id,
    images: { id: public_id, url: secure_url },
  });
  return res
    .status(201)
    .json({ success: true, message: "Category added Successfully" });
});

export const updateCategory = asynHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await categoryModel.findById(id);

  if (!category)
    return next(new Error("Can't find this Category", { cause: 404 }));

  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("You are not owner"));

  if (req.file) {
    const { secure_url, public_id } = await cloudnary.uploader.upload(
      req.file.path,
      {
        public_id: category.images.id,
      }
    );

    category.images = { url: secure_url, id: public_id };
  }
  category.name = name ? name : category.name;
  category.slug = name ? slugary(name) : category.slug;
  await category.save();

  return res.json({ success: true, message: "Category updated Successfully" });
});

export const deleteCategory = asynHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.id);
  if (!category)
    return next(new Error("Can't find this Category", { cause: 404 }));

  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("You are not owner"));

  await category.deleteOne();
  await cloudnary.uploader.destroy(category.images.id);
  return res.json({ success: true, message: "Category deleted Successfully" });
});

export const getAllCategory = asynHandler(async (req, res, next) => {
  const categories = await categoryModel
    .find()
    .populate({ path: "subCategory", select: "name -_id -category" });

  return res.json({ success: true, results: { categories } });
});
