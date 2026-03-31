import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema(
  {
    from: { type: String, require: true },
    to: { type: String, require: true },
    senderName: { type: String, require: true },
    recipientName: { type: String, require: true },
    senderEmail: { type: String, require: true },
    recipientEmail: { type: String, require: true },
    weight: { type: Number, require: true },
    cost: { type: Number, require: true },
    date: { type: String },
    note: { type: String },
    feedback: { type: String },
    status: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ParcelModel = mongoose.model("Parcel", parcelSchema);

export default ParcelModel;
