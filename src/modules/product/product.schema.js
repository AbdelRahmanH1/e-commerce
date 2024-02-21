import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createProduct = Joi.object({
  name: Joi.string().min(2).max(20).required(),
  description: Joi.string().min(10).max(200).required(),
  avaliableItems: Joi.number().integer().min(1).required(),
  price: Joi.number().integer().min(1).required(),
  discount: Joi.number().min(1).max(100),
  category: Joi.string().custom(isValidObjectId).required(),
  subcategory: Joi.string().custom(isValidObjectId).required(),
  brand: Joi.string().custom(isValidObjectId).required(),
}).required();

export const deleteProduct = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
}).required();
