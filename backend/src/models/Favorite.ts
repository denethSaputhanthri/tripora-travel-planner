import { model, Schema } from "mongoose";

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, destination: 1 }, { unique: true });

export const Favorite = model("Favorite", favoriteSchema);