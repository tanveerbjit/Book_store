const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "can't be blank"],
      min: 3,
      max: 20,
    },
    last_name: {
      type: String,
      required: [true, "can't be blank"],
      min: 3,
      max: 20,
    },
    user_name: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
      max: 30,
    },
    role: {
      type: String,
      lowercase: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
