import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    country: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: Number, default: 0 },
    role: { type: String, default: "user" },
  },
  { timestamps: true },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
