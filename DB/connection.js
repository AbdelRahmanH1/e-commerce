import mongoose from "mongoose";

export const connection = () => {
  try {
    mongoose.connect(process.env.DATABASE_URL);
    console.log("DataBase start");
  } catch (e) {
    console.log("DataBase Error: ", e.message);
  }
};
