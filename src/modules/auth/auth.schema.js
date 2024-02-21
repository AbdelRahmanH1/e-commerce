import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";
export const signUp = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  gender: Joi.string().valid("male", "female"),
  phone: Joi.string(),
  role: Joi.string().valid("user", "seller", "admin"),
}).required();

export const activateAccount = Joi.object({
  token: Joi.string().required(),
}).required();

export const signIn = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const forgetPassword = Joi.object({
  email: Joi.string().required(),
}).required();

export const resetPassword = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  code: Joi.string().length(6).required(),
}).required();

export const updateDataForUser = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  role: Joi.string().valid("user", "seller", "admin").required(),
}).required();
