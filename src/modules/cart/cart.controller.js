import asynchandler from "../../utils/asyncHandler.js";
import cartModel from "../../../DB/models/cart.model.js";
import productModel from "../../../DB/models/product.model.js";

export const addInCart = asynchandler(async (req, res, next) => {
  const product = await productModel.findById(req.body.productId);
  if (!product) return next(new Error("Product not found"));

  if (!product.inStock(req.body.quantity))
    return next(
      new Error(`Avaliable items is ${product.avaliableItems} only`, {
        cause: 400,
      })
    );

  const isProductInCart = await cartModel.findOne({
    user: req.user._id,
    "products.productId": req.body.productId,
  });

  if (isProductInCart) {
    const theProduct = isProductInCart.products.find(
      (prd) => prd.productId.toString() === req.body.productId.toString()
    );

    if (product.inStock(theProduct.quantity + req.body.quantity)) {
      theProduct.quantity = req.body.quantity + theProduct.quantity;
      await isProductInCart.save();
      return res.json({ success: true, message: "add new Quantity" });
    } else {
      return next(new Error("Cant add more ", { cause: 400 }));
    }
  }
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: {
        products: {
          productId: req.body.productId,
          quantity: req.body.quantity,
        },
      },
    },
    { new: true }
  );
  return res.json({ success: true, results: { cart } });
});

export const userCart = asynchandler(async (req, res, next) => {
  if (req.user.role === "user") {
    const cart = await cartModel.findOne({ user: req.user._id });
    return res.json({ success: true, results: { cart } });
  }

  if (req.user.role === "admin" && !req.body.cardId)
    return next(new Error("Must add Card id", { cause: 400 }));

  const cart = await cartModel.findById(req.body.cardId);
  return res.json({ success: true, results: { cart } });
});

export const updateCart = asynchandler(async (req, res, next) => {
  const { quantity, productId } = req.body;

  const cart = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "products.productId": productId,
    },
    {
      "products.$.quantity": quantity,
    },
    { new: true }
  );
  return res.json({ success: true, results: { cart } });
});

export const removeFromCart = asynchandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await productModel.findById(productId);
  if (!product)
    return next(new Error("Cant find this product", { cause: 404 }));

  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: { productId } } },
    { new: true }
  );
  return res.json({ success: true, results: { cart } });
});

export const clearCart = asynchandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      products: [],
    },
    { new: true }
  );
  return res.json({ success: true, results: { cart } });
});
