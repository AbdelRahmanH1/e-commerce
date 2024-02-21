import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { filter, upload } from "../../utils/multer.js";
import reviewRouter from "../review/review.router.js";
import * as productController from "./product.controller.js";
import * as productSchema from "./product.schema.js";
const router = Router();

router.use("/:productId/review", reviewRouter);

// create
// get
router
  .route("/")
  .post(
    isAuthentication,
    isAuthorization("seller"),
    upload(filter.images).fields([
      { name: "defaultImage", maxCount: 1 },
      { name: "subImages", maxCount: 3 },
    ]),
    validation(productSchema.createProduct),
    productController.createProduct
  )
  .get(productController.getProduct);

//delete
router
  .route("/:id")
  .delete(
    isAuthentication,
    isAuthorization("seller"),
    validation(productSchema.deleteProduct),
    productController.deleteProduct
  );
export default router;
