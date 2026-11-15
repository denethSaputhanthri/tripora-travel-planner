import { model, Schema } from "mongoose";

const activitySchema = new Schema(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["accommodation", "sightseeing", "food", "transport"],
    },
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    notes: { type: String, maxlength: 500 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

activitySchema.index({ trip: 1, date: 1, order: 1 });

export const Activity = model("Activity", activitySchema);
