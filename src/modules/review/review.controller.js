import asynHandler from "../../utils/asyncHandler.js";
import orderModel from "../../../DB/models/order.model.js";
import reviewModel from "../../../DB/models/review.model.js";
import productModel from "../../../DB/models/product.model.js";

export const addReview = asynHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { comment, rating } = req.body;

  //check the product from order

  const order = await orderModel.findOne({
    user: req.user._id,
    status: "delivered",
    "products.productId": productId,
  });

  if (!order) return next(new Error("Order not found", { cause: 404 }));

  //check past review
  if (
    await reviewModel.findOne({
      createdBy: req.user._id,
      productId,
      orderId: order._id,
    })
  )
    return next(new Error("You cant review again", { cause: 400 }));

  const review = await reviewModel.create({
    comment,
    rating,
    createdBy: req.user._id,
    orderId: order._id,
    productId,
  });

  let calculateRating = 0;
  const product = await productModel.findById(productId);
  const reviews = await reviewModel.find({ productId: productId });

  for (let i = 0; i < reviews.length; i++) {
    calculateRating += reviews[i].rating;
  }
  product.averageRate = calculateRating / reviews.length;
  await product.save();

  return res.json({ success: true, message: "review added successfully" });
});

export const updateReview = asynHandler(async (req, res, next) => {
  const { id, productId } = req.params;

  await reviewModel.updateOne({ _id: id, productId }, { ...req.body });

  if (req.body.rating) {
    let calculateRating = 0;
    const product = await productModel.findById(productId);
    const reviews = await reviewModel.find({ productId: productId });

    for (let i = 0; i < reviews.length; i++) {
      calculateRating += reviews[i].rating;
    }
    product.averageRate = calculateRating / reviews.length;
    await product.save();
  }
  return res.json({ success: true, message: "Review updated successfully" });
});
