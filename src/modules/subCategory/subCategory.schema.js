import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createSubCategory = Joi.object({
  name: Joi.string().required(),
  categoryID: Joi.string().custom(isValidObjectId).required(),
}).required();

export const updateSubCategory = Joi.object({
  name: Joi.string(),
  categoryID: Joi.string().custom(isValidObjectId).required(),
  id: Joi.string().custom(isValidObjectId).required(),
}).required();

export const deleteSubCategory = Joi.object({
  categoryID: Joi.string().custom(isValidObjectId).required(),
  id: Joi.string().custom(isValidObjectId).required(),
}).required();
