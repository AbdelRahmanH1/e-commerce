import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createBrand = Joi.object({
  name: Joi.string().required(),
  categories: Joi.array()
    .items(Joi.string().custom(isValidObjectId).required())
    .required(),
}).required();

export const updateSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  name: Joi.string(),
}).required();

export const deleteBrand = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
}).required();
