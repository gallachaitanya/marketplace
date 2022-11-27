//importing the required libraries
import mongoose from "mongoose";

// creating the user schema using the mongoose library
const userschema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

//creating the user model using schema created above and export it to available outside
const User = mongoose.model("User", userschema);

export default User;
