import { Router, Response } from "express";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { Trip } from "../models/Trip";
import { Expense } from "../models/Expense";

const router = Router({ mergeParams: true });
router.use(requireAuth);

const createExpenseSchema = z.object({
  title: z.string().min(2).max(100),
  amountCents: z.number().int().min(1),
  currency: z
    .string()
    .length(3)
    .transform((v) => v.toUpperCase()),
  category: z.enum([
    "accommodation",
    "food",
    "transport",
    "activities",
    "shopping",
    "other",
  ]),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

const updateExpenseSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  amountCents: z.number().int().min(1).optional(),
  currency: z
    .string()
    .length(3)
    .transform((v) => v.toUpperCase())
    .optional(),
  category: z
    .enum([
      "accommodation",
      "food",
      "transport",
      "activities",
      "shopping",
      "other",
    ])
    .optional(),
  date: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

async function loadTrip(req: AuthRequest, res: Response) {
  const { tripId } = req.params;
  if (!isValidObjectId(tripId)) {
    res.status(404).json({ message: "Trip not found" });
    return null;
  }
  const trip = await Trip.findById(tripId);
  if (!trip || trip.owner.toString() !== req.userId) {
    res.status(404).json({ message: "Trip not found" });
    return null;
  }
  return trip;
}

// GET /api/v1/trips/:tripId/expenses
router.get("/", async (req: AuthRequest, res: Response) => {
  const trip = await loadTrip(req, res);
  if (!trip) return;

  const items = await Expense.find({ trip: trip._id }).sort({ date: 1 });
  const total = items.length;

  // Sum only expenses whose currency matches the trip's budgetCurrency
  const totalSpentCents = items
    .filter((e) => e.currency === trip.budgetCurrency)
    .reduce((sum, e) => sum + e.amountCents, 0);

  res.json({
    items,
    meta: {
      total,
      totalSpentCents,
      budgetCents: trip.budgetCents,
      budgetCurrency: trip.budgetCurrency,
      remainingCents: trip.budgetCents - totalSpentCents,
    },
  });
});

// POST /api/v1/trips/:tripId/expenses
router.post("/", async (req: AuthRequest, res: Response) => {
  const trip = await loadTrip(req, res);
  if (!trip) return;

  const parsed = createExpenseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
  }

  const expense = await Expense.create({ ...parsed.data, trip: trip._id });
  res.status(201).json({ expense });
});

// PATCH /api/v1/trips/:tripId/expenses/:expenseId
router.patch("/:expenseId", async (req: AuthRequest, res: Response) => {
  const trip = await loadTrip(req, res);
  if (!trip) return;

  if (!isValidObjectId(req.params.expenseId)) {
    return res.status(404).json({ message: "Expense not found" });
  }
  const expense = await Expense.findById(req.params.expenseId);
  if (!expense || expense.trip.toString() !== trip._id.toString()) {
    return res.status(404).json({ message: "Expense not found" });
  }

  const parsed = updateExpenseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
  }

  Object.assign(expense, parsed.data);
  await expense.save();
  res.json({ expense });
});

// DELETE /api/v1/trips/:tripId/expenses/:expenseId
router.delete("/:expenseId", async (req: AuthRequest, res: Response) => {
  const trip = await loadTrip(req, res);
  if (!trip) return;

  if (!isValidObjectId(req.params.expenseId)) {
    return res.status(404).json({ message: "Expense not found" });
  }
  const expense = await Expense.findById(req.params.expenseId);
  if (!expense || expense.trip.toString() !== trip._id.toString()) {
    return res.status(404).json({ message: "Expense not found" });
  }

  await expense.deleteOne();
  res.json({ message: "Expense deleted" });
});

export default router;
