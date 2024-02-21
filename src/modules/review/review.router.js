import { Router } from "express";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as reviewSchema from "./review.schema.js";
import * as reviewController from "./review.controller.js";

const router = Router({ mergeParams: true });
router
  .route("/")
  .post(
    isAuthentication,
    isAuthorization("user"),
    validation(reviewSchema.addReview),
    reviewController.addReview
  );

router
  .route("/:id")
  .patch(
    isAuthentication,
    isAuthorization("user"),
    validation(reviewSchema.updateReview),
    reviewController.updateReview
  );
export default router;
