import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthentication } from "../../middleware/authentication.middleware.js";
import { isAuthorization } from "../../middleware/authorization.middleware.js";
import { upload, filter } from "../../utils/multer.js";
import * as authSchema from "./auth.schema.js";
import * as authController from "./auth.controller.js";

const router = Router();

router
  .route("/signup")
  .post(validation(authSchema.signUp), authController.signUp);

router
  .route("/activate_account/:token")
  .get(validation(authSchema.activateAccount), authController.activateAccount);

//login
router
  .route("/login")
  .post(validation(authSchema.signIn), authController.signIn);

//forget password
router
  .route("/forget_password")
  .post(validation(authSchema.forgetPassword), authController.forgetPassword);

// reset password
router
  .route("/reset_password")
  .post(validation(authSchema.resetPassword), authController.resetPassword);

// add pic
router
  .route("/add_pic")
  .post(
    isAuthentication,
    upload(filter.images).single("pp"),
    authController.addPic
  );

//update pic
router
  .route("/update_pic")
  .patch(
    isAuthentication,
    upload(filter.images).single("pp"),
    authController.updatePic
  );

router.route("/get_Data").get(isAuthentication, authController.getData);

router
  .route("/update_Data")
  .patch(
    isAuthentication,
    isAuthorization("admin"),
    validation(authSchema.updateDataForUser),
    authController.updateDataForUser
  );
export default router;
