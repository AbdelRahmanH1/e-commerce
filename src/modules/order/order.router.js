import { Router } from "express";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as orderSchema from "./order.schema.js";
import * as orderController from "./order.controller.js";
import express from "express";
const router = Router();

//create order
router
  .route("/cash")
  .post(
    isAuthentication,
    isAuthorization("user"),
    validation(orderSchema.createOrder),
    orderController.payCash
  );
router
  .route("/visa")
  .post(
    isAuthentication,
    isAuthorization("user"),
    validation(orderSchema.createOrder),
    orderController.payVisa
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

router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), orderController.webhooks);

export default router;
