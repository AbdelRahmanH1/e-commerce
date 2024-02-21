import { Router } from "express";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { filter, upload } from "../../utils/multer.js";
import * as brandController from "./brand.controller.js";
import * as brandSchema from "./brand.schema.js";

const router = Router();
// create
router
  .route("/")
  .post(
    isAuthentication,
    isAuthorization("seller"),
    upload(filter.images).single("pp"),
    validation(brandSchema.createBrand),
    brandController.createBrand
  );

// update
//delete
router
  .route("/:id")
  .patch(
    isAuthentication,
    isAuthorization("seller"),
    upload(filter.images).single("pp"),
    validation(brandSchema.updateSchema),
    brandController.updateBrand
  )
  .delete(
    isAuthentication,
    isAuthorization("seller"),
    upload(filter.images).single("pp"),
    validation(brandSchema.deleteBrand),
    brandController.deleteBrand
  );

export default router;
