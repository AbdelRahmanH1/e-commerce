import { Router } from "express";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as cartSchema from "./cart.schema.js";
import * as cartController from "./cart.controller.js";

const router = Router();

//add item to cart (user)
router
  .route("/")
  .post(
    isAuthentication,
    isAuthorization("user"),
    validation(cartSchema.addInCart),
    cartController.addInCart
  );

// user cart (user , admin)
router
  .route("/")
  .get(
    isAuthentication,
    isAuthorization("admin", "user"),
    validation(cartSchema.userCart),
    cartController.userCart
  );

// update cart (user)
router
  .route("/")
  .patch(
    isAuthentication,
    isAuthorization("user"),
    validation(cartSchema.updateCart),
    cartController.updateCart
  );

//remove from cart(user)
router
  .route("/:productId")
  .patch(
    isAuthentication,
    isAuthorization("user"),
    validation(cartSchema.removeFromCart),
    cartController.removeFromCart
  );

//clear cart

router
  .route("/clear")
  .put(isAuthentication, isAuthorization("user"), cartController.clearCart);

export default router;
