import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createOrder = Joi.object({
  phone: Joi.string().required(),
  address: Joi.string().required(),
  payment: Joi.string().valid("cash", "visa").required(),
  coupon: Joi.string().length(5),
}).required();

export const cancelOrder = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
}).required();
