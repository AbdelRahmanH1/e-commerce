import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const addReview = Joi.object({
  productId: Joi.string().custom(isValidObjectId).required(),
  comment: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
}).required();

export const updateReview = Joi.object({
  productId: Joi.string().custom(isValidObjectId).required(),
  id: Joi.string().custom(isValidObjectId).required(),
  comment: Joi.string(),
  rating: Joi.number().min(1).max(5),
}).required();
