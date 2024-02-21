import asynHandler from "../utils/asyncHandler.js";
import tokenModel from "../../DB/models/token.model.js";
import jwt from "jsonwebtoken";
import User from "../../DB/models/user.model.js";

export const isAuthentication = asynHandler(async (req, res, next) => {
  let token = req.headers["token"];

  if (!token || !token.startsWith(process.env.BEARER_KEY))
    return next(new Error("Token not valid", { cause: 400 }));

  token = token.split(process.env.BEARER_KEY)[1];

  const tokenDB = await tokenModel.findOne({ token, isValid: true });
  if (!tokenDB)
    return next(new Error("Token not valid on Server", { cause: 403 }));

  const info = jwt.verify(token, process.env.SECRET_KEY);

  const user = await User.findById(info.id);

  if (!user) return next(new Error("User not found", { cause: 404 }));

  req.user = user;

  return next();
});
