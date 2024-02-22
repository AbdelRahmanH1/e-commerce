import asyncHandler from "../../utils/asyncHandler.js";
import orderModel from "../../../DB/models/order.model.js";
import cartModel from "../../../DB/models/cart.model.js";
import productModel from "../../../DB/models/product.model.js";
import couponModel from "../../../DB/models/coupon.model.js";
import cloudinary from "../../utils/cloudnary.js";
import path from "path";
import createInvoice from "../../utils/createInvoice.js";
import { sendMail } from "../../utils/sendMail.js";
import { fileURLToPath } from "url";
import * as orderServices from "./order.services.js";
import Stripe from "stripe";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createOrder = asyncHandler(async (req, res, next) => {
  const { payment } = req.body;

  //check the coupon
  let checkCoupon;
  if (coupon) {
    const checkCoupon = await couponModel.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
    if (!checkCoupon)
      return next(new Error("Coupon not valid", { cause: 400 }));
  }

  //get products from cart
  const cart = await cartModel.findOne({ user: req.user._id });
  const products = cart.products;

  if (products.length < 1)
    return next(new Error("Cart is empty!!", { cause: 400 }));

  //check products is Valid or not
  let orderProducts = [];
  let orderPrice = 0;

  for (let i = 0; i < products.length; i++) {
    const product = await productModel.findById(products[i].productId);

    if (!product)
      return next(new Error(`Product not found ${products[i].productId}`));

    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `Products out of stock only avalibale ${product.avaliableItems}`
        )
      );
    orderProducts.push({
      name: product.name,
      quantity: products[i].quantity,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * products[i].quantity,
      productId: product._id,
    });
    orderPrice += product.finalPrice * products[i].quantity;
  }

  const order = await orderModel.create({
    user: req.user._id,
    address,
    payment,
    phone,
    products: orderProducts,
    price: orderPrice,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
  });

  // create invoice
  const pdfPath = path.join(
    __dirname,
    "..",
    "..",
    "tempInvoices",
    `${order._id}.pdf`
  );
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.username,
      address: order.address,
      country: "EG",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };
  createInvoice(invoice, pdfPath);

  //upload on cloudnary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.CLOUDNARY_NAME}/order/invoices`,
  });
  order.invoice = { url: secure_url, id: public_id };
  await order.save();

  //send mail
  const isSent = await sendMail({
    to: user.email,
    subject: "Order Invoice",
    attachments: [{ path: secure_url, contentType: "application/pdf" }],
  });
  if (!isSent) return next("Something wrong");

  //update Stock
  orderServices.updateStock(order.products, true);

  //clear cart
  orderServices.clearCart(req.user._id);

  //stripe
  if (payment === "visa") {
    const stripe = new Stripe(process.env.STRIP_SECRET_KEY);

    //Stripe Coupon
    let couponExists;
    if (order.coupon.name !== undefined) {
      couponExists = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: { order_id: order._id.toString() },
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: { name: product.name },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: couponExists ? [{ coupon: couponExists.id }] : [],
    });

    return res.json({ success: true, results: session });
  }
  return res.json({ success: true, results: { order } });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await orderModel.findById(id);

  if (!order) return next(new Error("Order not found", { cause: 404 }));

  if (order.user.toString() !== req.user.id)
    return next("you are not authorized to cancel order", { cause: 403 });

  if (
    order.status === "delivered" ||
    order.status === "shipped" ||
    order.status === "canceled"
  )
    return next(new Error("Order cant be cancled", { cause: 400 }));

  order.status = "canceled";
  await order.save();

  // update stock
  orderServices.updateStock(order.products, false);

  return res.json({ success: true, message: "Order cancled Succesfully" });
});

export const webhooks = asyncHandler(async (request, response) => {
  const stripe = new Stripe(process.env.STRIP_SECRET_KEY);

  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  const orderId = event.data.object.metadata.order_id;
  if (event.type === "checkout.session.completed") {
    const order = await orderModel.findByIdAndUpdate(orderId, {
      status: "visa payed",
    });
    orderServices.updateStock(order.products, true);
    orderServices.clearCart(order.user);
    return;
  }
  await orderModel.findByIdAndUpdate(orderId, { status: "failed to pay" });
  return;

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

export const payCash = asyncHandler(async (req, res, next) => {
  const { address, coupon, phone } = req.body;

  let checkCoupon;
  if (coupon) {
    const checkCoupon = await couponModel.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
    if (!checkCoupon)
      return next(new Error("Coupon not valid", { cause: 400 }));
  }
  const cart = await cartModel.findOne({ user: req.user._id });
  const products = cart.products;

  if (products.length < 1)
    return next(new Error("Cart is empty!!", { cause: 400 }));

  //check products is Valid or not
  let orderProducts = [];
  let orderPrice = 0;

  for (let i = 0; i < products.length; i++) {
    const product = await productModel.findById(products[i].productId);

    if (!product)
      return next(new Error(`Product not found ${products[i].productId}`));

    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `Products out of stock only avalibale ${product.avaliableItems}`
        )
      );
    orderProducts.push({
      name: product.name,
      quantity: products[i].quantity,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * products[i].quantity,
      productId: product._id,
    });
    orderPrice += product.finalPrice * products[i].quantity;
  }
  const order = await orderModel.create({
    user: req.user._id,
    address,
    payment: "cash",
    phone,
    products: orderProducts,
    price: orderPrice,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
  });
  // create invoice
  const pdfPath = path.join(
    __dirname,
    "..",
    "..",
    "tempInvoices",
    `${order._id}.pdf`
  );
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.username,
      address: order.address,
      country: "EG",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };
  createInvoice(invoice, pdfPath);

  //upload on cloudnary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.CLOUDNARY_NAME}/order/invoices`,
  });
  order.invoice = { url: secure_url, id: public_id };
  await order.save();

  //send mail
  const isSent = await sendMail({
    to: user.email,
    subject: "Order Invoice",
    attachments: [{ path: secure_url, contentType: "application/pdf" }],
  });
  if (!isSent) return next("Something wrong");

  //update Stock
  orderServices.updateStock(order.products, true);

  //clear cart
  orderServices.clearCart(req.user._id);

  return res.json({ success: true, results: { order } });
});

export const payVisa = asyncHandler(async (req, res, next) => {
  const { address, coupon, phone } = req.body;
  let checkCoupon;
  if (coupon) {
    const checkCoupon = await couponModel.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
    if (!checkCoupon)
      return next(new Error("Coupon not valid", { cause: 400 }));
  }
  const cart = await cartModel.findOne({ user: req.user._id });
  const products = cart.products;

  if (products.length < 1)
    return next(new Error("Cart is empty!!", { cause: 400 }));

  //check products is Valid or not
  let orderProducts = [];
  let orderPrice = 0;

  for (let i = 0; i < products.length; i++) {
    const product = await productModel.findById(products[i].productId);

    if (!product)
      return next(new Error(`Product not found ${products[i].productId}`));

    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `Products out of stock only avalibale ${product.avaliableItems}`
        )
      );
    orderProducts.push({
      name: product.name,
      quantity: products[i].quantity,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * products[i].quantity,
      productId: product._id,
    });
    orderPrice += product.finalPrice * products[i].quantity;
  }
  const order = await orderModel.create({
    user: req.user._id,
    address,
    payment: "visa",
    phone,
    products: orderProducts,
    price: orderPrice,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
  });
  // create invoice
  const pdfPath = path.join(
    __dirname,
    "..",
    "..",
    "tempInvoices",
    `${order._id}.pdf`
  );
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.username,
      address: order.address,
      country: "EG",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };
  createInvoice(invoice, pdfPath);

  //upload on cloudnary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.CLOUDNARY_NAME}/order/invoices`,
  });
  order.invoice = { url: secure_url, id: public_id };
  await order.save();

  const isSent = await sendMail({
    to: user.email,
    subject: "Order Invoice",
    attachments: [{ path: secure_url, contentType: "application/pdf" }],
  });
  if (!isSent) return next("Something wrong");

  const stripe = new Stripe(process.env.STRIP_SECRET_KEY);

  //Stripe Coupon
  let couponExistss;
  if (order.coupon.name !== undefined) {
    couponExistss = await stripe.coupons.create({
      percent_off: order.coupon.discount,
      duration: "once",
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    metadata: { order_id: order._id.toString() },
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    line_items: order.products.map((product) => {
      return {
        price_data: {
          currency: "egp",
          product_data: { name: product.name },
          unit_amount: product.itemPrice * 100,
        },
        quantity: product.quantity,
      };
    }),
    discounts: couponExistss ? [{ coupon: couponExistss.id }] : [],
  });

  return res.json({ success: true, results: session.url });
});
