import asynHandler from "../../utils/asyncHandler.js";
import voucher from "voucher-code-generator";
import couponModel from "../../../DB/models/coupon.model.js";

export const createCoupon = asynHandler(async (req, res, next) => {
  const { discount, expiredAt } = req.body;
  const code = voucher.generate({ length: 5 })[0];
  const coupon = await couponModel.create({
    name: code,
    createdBy: req.user._id,
    expiredAt: new Date(expiredAt).getTime(),
    discount,
  });
  return res.json({ success: true, result: coupon });
});

export const updateCoupon = asynHandler(async (req, res, next) => {
  const coupon = await couponModel.findOne({
    name: req.params.code,
    expiredAt: { $gt: Date.now() },
  });
  if (!coupon) return next(new Error("Coupon not found", { cause: 404 }));

  if (coupon.createdBy.toString() !== req.user.id)
    return res.json({ success: false, message: "not authorized" });

  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expiredAt = req.body.expiredAt ? req.body.expiredAt : coupon.expiredAt;
  await coupon.save();
  return res.json({ success: true, result: coupon });
});

export const deleteCoupon = asynHandler(async (req, res, next) => {
  const coupon = await couponModel.findOneAndDelete({
    name: req.params.code,
    createdBy: req.user._id,
  });

  if (!coupon) return next("Sorry we cant delete this coupon");
  return res.json({ success: true, message: "Coupon deleted successfully" });
});

export const getCoupons = asynHandler(async (req, res, next) => {
  if (req.user.role === "admin") {
    const coupons = await couponModel.find();
    return res.json({ success: true, results: { coupons } });
  }
  if (req.user.role === "seller") {
    const coupons = await couponModel.find({ createdBy: req.user._id });
    return res.json({ success: true, results: { coupons } });
  }
});
