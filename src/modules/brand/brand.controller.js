import asynHandler from "../../utils/asyncHandler.js";
import categoryModel from "../../../DB/models/category.model.js";
import cloudinary from "../../utils/cloudnary.js";
import brandModel from "../../../DB/models/brand.model.js";
import { slugary } from "../../utils/slugry.js";

export const createBrand = asynHandler(async (req, res, next) => {
  const { categories, name } = req.body;

  categories.forEach(async (categoryID) => {
    const category = await categoryModel.findById(categoryID);
    if (!category)
      return next(
        new Error(`Category ${categoryID} not found`, { cause: 404 })
      );
  });
  if (!req.file)
    return next(new Error("Brand pic is required", { cause: 400 }));

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUDNARY_NAME}/brand`,
    }
  );
  const brand = await brandModel.create({
    name,
    slug: slugary(name),
    createdBy: req.user._id,
    image: { url: secure_url, id: public_id },
  });

  categories.forEach(async (categoryID) => {
    await categoryModel.findByIdAndUpdate(categoryID, {
      $push: { brands: brand._id },
    });
  });
  return res.json({ success: true, message: "Brand updated Successfully" });
});

export const updateBrand = asynHandler(async (req, res, next) => {
  const brand = await brandModel.findById(req.params.id);
  if (!brand) return next(new Error("Brand not found", { cause: 404 }));

  if (brand.createdBy.toString() !== req.user.id)
    return next(new Error("not Authorized to edit", { cause: 403 }));

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: brand.image.id,
      }
    );
    brand.image = { id: public_id, url: secure_url };
  }
  brand.name = req.body.name ? req.body.name : brand.name;
  brand.slug = req.body.name ? slugary(req.body.name) : brand.slug;

  await brand.save();
  return res.json({ success: true, message: "Brand updated successfully" });
});

export const deleteBrand = asynHandler(async (req, res, next) => {
  const brand = await brandModel.findById(req.params.id);

  if (!brand) return next(new Error("Brand not found", { cause: 404 }));
  if (brand.createdBy.toString() !== req.user.id)
    return next(
      new Error("Not Authorized to delete this brand", { cause: 403 })
    );
  await cloudinary.uploader.destroy(brand.image.id);
  await brand.deleteOne();
  await categoryModel.updateMany({}, { $pull: { brands: brand._id } });
  return res.json({ success: true, message: "Brand deleted successfully" });
});
