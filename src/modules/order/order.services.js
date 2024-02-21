import productModel from "../../../DB/models/product.model.js";
import cartModel from "../../../DB/models/cart.model.js";

export const updateStock = async (products, createOrder) => {
  if (createOrder) {
    for (const product of products) {
      await productModel.findByIdAndUpdate(product.productId, {
        $inc: {
          soldItems: product.quantity,
          avaliableItems: -product.quantity,
        },
      });
    }
  } else {
    for (const product of products) {
      await productModel.findByIdAndUpdate(product.productId, {
        $inc: {
          soldItems: -product.quantity,
          avaliableItems: product.quantity,
        },
      });
    }
  }
};
export const clearCart = async (userID) => {
  await cartModel.findOneAndUpdate({ user: userID }, { products: [] });
};
