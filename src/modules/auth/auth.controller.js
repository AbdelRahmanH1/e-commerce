import asynHandler from "../../utils/asyncHandler.js";
import User from "../../../DB/models/user.model.js";
import tokenModel from "../../../DB/models/token.model.js";
import { sendMail } from "../../utils/sendMail.js";
import jwt from "jsonwebtoken";
import { signUpTemp, resetPassTemp } from "../../utils/templateMail.js";
import bcryptjs from "bcryptjs";
import voucher from "voucher-code-generator";
import cloudinary from "../../utils/cloudnary.js";
import cartModel from "../../../DB/models/cart.model.js";

export const signUp = asynHandler(async (req, res, next) => {
  // check if email exists or not
  const user = await User.findOne({ email: req.body.email });

  if (user) return next(new Error("User already exists", { cause: 400 }));

  // Genereate jwt to acccess
  const token = jwt.sign({ email: req.body.email }, process.env.SECRET_KEY);
  // customize the link to send to mail
  const conviramtionLink = `http://localhost:3000/auth/activate_account/${token}`;

  // send mail with verification link
  const sent = await sendMail({
    to: req.body.email,
    subject: "Activate account",
    html: signUpTemp(conviramtionLink),
  });
  // add on database
  await User.create({ ...req.body });
  //response
  return res.status(201).json({ success: true, message: "Check email please" });
});

export const activateAccount = asynHandler(async (req, res, next) => {
  const { token } = req.params;

  const { email } = jwt.verify(token, process.env.SECRET_KEY);

  const user = await User.findOne({ email });

  if (!user) return next(new Error("User not found", { cause: 404 }));

  user.isConfirmed = true;

  await user.save();
  //create Card for User TODO
  await cartModel.create({ user: user._id });
  return res.json({ success: true, message: "You are now activated" });
});

export const signIn = asynHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  const match = bcryptjs.compareSync(password, user.password);
  if (!match) return next(new Error("Password wrong!", { cause: 400 }));

  if (!user.isConfirmed)
    return next(
      new Error("must activate your account first check your email", {
        cause: 403,
      })
    );

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET_KEY
  );
  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });
  return res.json({ success: true, token });
});

export const forgetPassword = asynHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (!user.isConfirmed)
    return next(new Error("Activate account first", { cause: 403 }));

  const code = voucher.generate({
    length: 6,
  });

  user.forgetCode = code[0];
  await user.save();

  const sent = await sendMail({
    to: email,
    subject: "Forget code",
    html: resetPassTemp(code),
  });
  if (!sent) return next(new Error("Something went wrong", { cause: 500 }));

  return res.json({ success: true, message: "check your email" });
});

export const resetPassword = asynHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user.forgetCode !== req.body.code)
    return next(new Error("Code is wrong", { cause: 400 }));

  user.password = req.body.password;
  user.forgetCode = null;
  await user.save();
  await tokenModel.updateMany({ user: user._id }, { isValid: false });
  return res.json({ success: true, message: "Password reset successfully" });
});

export const addPic = asynHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("Must add pic"));
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUDNARY_NAME}/user/${req.user._id}` }
  );
  await User.findByIdAndUpdate(req.user._id, {
    "profileImage.url": secure_url,
    "profileImage.id": public_id,
  });
  return res.json({ success: true, message: "Pic added successfully" });
});

export const updatePic = asynHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("Must Update pic"));

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      public_id: req.user.profileImage.id,
    }
  );
  await User.findByIdAndUpdate(req.user._id, {
    "profileImage.id": public_id,
    "profileImage.url": secure_url,
  });
  return res.json({ success: true, message: "Pic updated Successfully" });
});

export const getData = asynHandler(async (req, res, next) => {
  if (req.user.role === "admin") {
    const users = await User.find(
      {},
      {
        password: 0,
        updatedAt: 0,
        createdAt: 0,
        _id: 0,
        profileImage: 0,
        isConfirmed: 0,
      }
    );
    return res.json({ success: true, results: { users } });
  }
  const user = await User.findById(req.user.id);
  return res.json({ success: true, results: { user } });
});

export const updateDataForUser = asynHandler(async (req, res, next) => {
  const { id, role } = req.body;

  const user = await User.findByIdAndUpdate(id, { role });

  if (!user) return next("User not found", { cause: 404 });

  return res.json({ success: true, message: "Role updated for this user" });
});
