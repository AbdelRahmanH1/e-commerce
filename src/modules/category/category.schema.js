import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createCategory = Joi.object({
  name: Joi.string().required(),
}).required();

export const updateCategory = Joi.object({
  name: Joi.string(),
  id: Joi.string().custom(isValidObjectId).required(),
}).required();

export const deleteCategory = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
}).required();
