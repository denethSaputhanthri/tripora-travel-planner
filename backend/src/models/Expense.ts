import { model, Schema } from "mongoose";

const expenseSchema = new Schema(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    title: { type: String, required: true, trim: true },
    amountCents: { type: Number, required: true, min: 1 },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "accommodation",
        "food",
        "transport",
        "activities",
        "shopping",
        "other",
      ],
    },
    date: { type: Date, required: true },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

expenseSchema.index({ trip: 1, date: 1 });

export const Expense = model("Expense", expenseSchema);
