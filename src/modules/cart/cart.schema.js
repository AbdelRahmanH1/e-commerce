import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const addInCart = Joi.object({
  productId: Joi.string().custom(isValidObjectId).required(),
  quantity: Joi.number().integer().min(1).required(),
}).required();

export const userCart = Joi.object({
  cardId: Joi.string().custom(isValidObjectId),
}).required();

export const updateCart = Joi.object({
  productId: Joi.string().custom(isValidObjectId).required(),
  quantity: Joi.number().integer().min(1).required(),
}).required();

export const removeFromCart = Joi.object({
  productId: Joi.string().custom(isValidObjectId).required(),
}).required();
