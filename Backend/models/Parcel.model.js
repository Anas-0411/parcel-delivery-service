import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    senderName: { type: String, required: true },
    recipientName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    weight: { type: Number, required: true },
    cost: { type: Number, required: true },
    date: { type: String },
    note: { type: String },
    feedback: { type: String },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "in transit", "delivered", "cancelled"],
    },
  },
  { timestamps: true },
);

const ParcelModel = mongoose.model("Parcel", parcelSchema);

export default ParcelModel;
