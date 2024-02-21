import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createCoupon = Joi.object({
  discount: Joi.number().min(1).max(100).required(),
  expiredAt: Joi.date().greater(Date.now()).required(),
}).required();

export const updateCoupon = Joi.object({
  discount: Joi.number().min(1).max(100),
  expiredAt: Joi.date().greater(Date.now()),
  code: Joi.string().length(5).required(),
}).required();

export const deleteCoupon = Joi.object({
  code: Joi.string().length(5).required(),
}).required();
