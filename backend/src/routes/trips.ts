import { Router, Response } from "express";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { Trip } from "../models/Trip";
import { Activity } from "../models/Activity";
import { Expense } from "../models/Expense";
import { Destination } from "../models/Destination";

const router = Router();
router.use(requireAuth);

const createTripSchema = z
  .object({
    title: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    destination: z.string().refine(isValidObjectId, "Invalid destination id"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    budgetCents: z.number().int().min(0),
    budgetCurrency: z
      .string()
      .length(3)
      .transform((v) => v.toUpperCase()),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "endDate must be >= startDate",
    path: ["endDate"],
  });

const updateTripSchema = z
  .object({
    title: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    destination: z
      .string()
      .refine(isValidObjectId, "Invalid destination id")
      .optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    budgetCents: z.number().int().min(0).optional(),
    budgetCurrency: z
      .string()
      .length(3)
      .transform((v) => v.toUpperCase())
      .optional(),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) return d.endDate >= d.startDate;
      return true;
    },
    { message: "endDate must be >= startDate", path: ["endDate"] }
  );

// GET /api/v1/trips
router.get("/", async (req: AuthRequest, res: Response) => {
  const [items, total] = await Promise.all([
    Trip.find({ owner: req.userId })
      .sort({ startDate: -1 })
      .populate("destination", "name country imageUrl"),
    Trip.countDocuments({ owner: req.userId }),
  ]);
  res.json({ items, meta: { total } });
});

// POST /api/v1/trips
router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = createTripSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
  }

  const dest = await Destination.exists({ _id: parsed.data.destination });
  if (!dest) {
    return res.status(404).json({ message: "Destination not found" });
  }

  const trip = await Trip.create({ ...parsed.data, owner: req.userId });
  res.status(201).json({ trip });
});

// GET /api/v1/trips/:tripId
router.get("/:tripId", async (req: AuthRequest, res: Response) => {
  if (!isValidObjectId(req.params.tripId)) {
    return res.status(404).json({ message: "Trip not found" });
  }
  const trip = await Trip.findById(req.params.tripId).populate("destination");
  if (!trip || trip.owner.toString() !== req.userId) {
    return res.status(404).json({ message: "Trip not found" });
  }
  res.json({ trip });
});

// PATCH /api/v1/trips/:tripId
router.patch("/:tripId", async (req: AuthRequest, res: Response) => {
  if (!isValidObjectId(req.params.tripId)) {
    return res.status(404).json({ message: "Trip not found" });
  }
  const trip = await Trip.findById(req.params.tripId);
  if (!trip || trip.owner.toString() !== req.userId) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const parsed = updateTripSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
  }

  // Cross-field date validation when only one date is being updated
  const newStart = parsed.data.startDate ?? trip.startDate;
  const newEnd = parsed.data.endDate ?? trip.endDate;
  if (newEnd < newStart) {
    return res.status(400).json({ message: "endDate must be >= startDate" });
  }

  if (parsed.data.destination) {
    const dest = await Destination.exists({ _id: parsed.data.destination });
    if (!dest) {
      return res.status(404).json({ message: "Destination not found" });
    }
  }

  Object.assign(trip, parsed.data);
  await trip.save();
  await trip.populate("destination");
  res.json({ trip });
});

// DELETE /api/v1/trips/:tripId
router.delete("/:tripId", async (req: AuthRequest, res: Response) => {
  if (!isValidObjectId(req.params.tripId)) {
    return res.status(404).json({ message: "Trip not found" });
  }
  const trip = await Trip.findById(req.params.tripId);
  if (!trip || trip.owner.toString() !== req.userId) {
    return res.status(404).json({ message: "Trip not found" });
  }

  await Promise.all([
    Activity.deleteMany({ trip: trip._id }),
    Expense.deleteMany({ trip: trip._id }),
    trip.deleteOne(),
  ]);

  res.json({ message: "Trip deleted" });
});

export default router;
