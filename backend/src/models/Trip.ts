import { model, Schema } from "mongoose";

const tripSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budgetCents: { type: Number, required: true, min: 0 },
    budgetCurrency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tripSchema.virtual("status").get(function () {
  const now = new Date();
  if (this.startDate > now) return "upcoming";
  if (this.endDate < now) return "completed";
  return "ongoing";
});

tripSchema.index({ owner: 1 });
tripSchema.index({ destination: 1 });

export const Trip = model("Trip", tripSchema);
