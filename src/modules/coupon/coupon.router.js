import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import * as couponController from "./coupon.controller.js";
import * as couponSchema from "./coupon.schema.js";
const router = Router();

//create
//get
router
  .route("/")
  .post(
    isAuthentication,
    isAuthorization("seller"),
    validation(couponSchema.createCoupon),
    couponController.createCoupon
  )
  .get(
    isAuthentication,
    isAuthorization("seller", "admin"),
    couponController.getCoupons
  );

//update
//delete
router
  .route("/:code")
  .patch(
    isAuthentication,
    isAuthorization("seller"),
    validation(couponSchema.updateCoupon),
    couponController.updateCoupon
  )

  .delete(
    isAuthentication,
    isAuthorization("seller"),
    validation(couponSchema.deleteCoupon),
    couponController.deleteCoupon
  );

export default router;
