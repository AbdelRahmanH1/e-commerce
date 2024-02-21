import { Router } from "express";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as orderSchema from "./order.schema.js";
import * as orderController from "./order.controller.js";
const router = Router();

//create order
router
  .route("/")
  .post(
    isAuthentication,
    isAuthorization("user"),
    validation(orderSchema.createOrder),
    orderController.createOrder
  );

//cancel order

router
  .route("/:id")
  .patch(
    isAuthentication,
    isAuthorization("user"),
    validation(orderSchema.cancelOrder),
    orderController.cancelOrder
  );

export default router;
