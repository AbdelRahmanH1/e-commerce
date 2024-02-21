import express from "express";
import "dotenv/config";
import { connection } from "./DB/connection.js";
import authRouter from "./src/modules/auth/auth.router.js";
import categoryRouter from "./src/modules/category/category.router.js";
import subCategoryRouter from "./src/modules/subCategory/subCategory.router.js";
import brandRouter from "./src/modules/brand/brand.router.js";
import couponRouter from "./src/modules/coupon/coupon.router.js";
import productRouter from "./src/modules/product/product.router.js";
import cartRouter from "./src/modules/cart/cart.router.js";
import orderRouter from "./src/modules/order/order.router.js";
import reviewRouter from "./src/modules/review/review.router.js";
import cors from "cors";
import morgan from "morgan";
const app = express();
await connection();

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/category", categoryRouter);
app.use("/subCategory", subCategoryRouter);
app.use("/brand", brandRouter);
app.use("/coupon", couponRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
/* app.use("/review", reviewRouter); */

app.all("*", (req, res, next) => {
  return next(new Error("Page not found", { cause: 404 }));
});

app.use((err, req, res, next) => {
  const statusCode = err.cause || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "something wrong",
    stack: err.stack,
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server start at port: ${process.env.PORT}`)
);
