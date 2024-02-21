import { Router } from "express";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { slugary } from "../../utils/slugry.js";
import { filter, upload } from "../../utils/multer.js";
import * as subCategorySchema from "./subCategory.schema.js";
import * as subCategoryController from "./subCategory.controller.js";
const router = Router({ mergeParams: true });

//create subCategory
// getl ALl subCategory

router
  .route("/")

  .post(
    isAuthentication,
    isAuthorization("admin"),
    upload(filter.images).single("pp"),
    validation(subCategorySchema.createSubCategory),
    subCategoryController.createSubCategory
  )
  .get(
    isAuthentication,
    isAuthorization("admin"),
    subCategoryController.getAllSubCategory
  );

//update subCategory
//delete subCategory
router
  .route("/:id")

  .patch(
    isAuthentication,
    isAuthorization("admin"),
    upload(filter.images).single("pp"),
    validation(subCategorySchema.updateSubCategory),
    subCategoryController.updateSubCategory
  )

  .delete(
    isAuthentication,
    isAuthorization("admin"),
    upload(filter.images).single("pp"),
    validation(subCategorySchema.deleteSubCategory),
    subCategoryController.deleteSubCategory
  );

export default router;
