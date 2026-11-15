import { model, Schema } from "mongoose";

const destinationSchema = new Schema(
    {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["beach", "city", "mountain", "culture", "adventure"],
    },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    dailyCostUsd: { type: Number, required: true, min: 0 },
    tips: { type: [String], default: [] },
  },
  { timestamps: true }
);

destinationSchema.index({ name: "text", country: "text"});
destinationSchema.index({ category: 1 });

export const Destination = model("Destination", destinationSchema);