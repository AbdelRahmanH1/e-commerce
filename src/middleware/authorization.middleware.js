import asynHandler from "../utils/asyncHandler.js";

export const isAuthorization = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role))
      return next(new Error("Not Authorized", { cause: 403 }));
    return next();
  };
};
