import { Router } from "express";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { upload, filter } from "../../utils/multer.js";
import * as categoryController from "./category.controller.js";
import * as categorySchema from "./category.schema.js";
import subCategoryRouter from "../subCategory/subCategory.router.js";
const router = Router();
router.use("/:categoryID/subCategory", subCategoryRouter);
// add category
router
  .route("/")
  .post(
    isAuthentication,
    isAuthorization("admin"),
    upload(filter.images).single("pp"),
    validation(categorySchema.createCategory),
    categoryController.createCategory
  )
  .get(
    isAuthentication,
    isAuthorization("admin"),
    categoryController.getAllCategory
  );
// edit category

router
  .route("/:id")
  .patch(
    isAuthentication,
    isAuthorization("admin"),
    upload(filter.images).single("pp"),
    validation(categorySchema.updateCategory),
    categoryController.updateCategory
  )
  .delete(
    isAuthentication,
    isAuthorization("admin"),
    validation(categorySchema.deleteCategory),
    categoryController.deleteCategory
  );

//delete category
export default router;
