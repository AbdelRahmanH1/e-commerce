import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      min: [3, "Min length is  3"],
      max: [3, "Min length is  20"],
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    forgetCode: {
      type: String,
      default: null,
      min: 6,
      max: 6,
    },
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/duzxj60oa/image/upload/v1708208050/e-commerce/default/unkown_djzcqy.jpg",
      },
      id: { type: String, default: "e-commerce/default/unkown_djzcqy.jpg" },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (this.isModified("password")) {
    const hashPassword = bcryptjs.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND)
    );
    this.password = hashPassword;
  }
});

const userModel = model("User", userSchema);
export default userModel;
