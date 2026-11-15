import { Router, Response } from "express";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { Trip } from "../models/Trip";
import { Activity } from "../models/Activity";

const router = Router({ mergeParams: true });
router.use(requireAuth);

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

const createActivitySchema = z.object({
  title: z.string().min(2).max(100),
  type: z.enum(["accommodation", "sightseeing", "food", "transport"]),
  date: z.coerce.date(),
  startTime: z
    .string()
    .regex(HH_MM, "Must be HH:mm")
    .optional(),
  endTime: z
    .string()
    .regex(HH_MM, "Must be HH:mm")
    .optional(),
  notes: z.string().max(500).optional(),
  order: z.number().optional(),
});

const updateActivitySchema = z.object({
  title: z.string().min(2).max(100).optional(),
  type: z.enum(["accommodation", "sightseeing", "food", "transport"]).optional(),
  date: z.coerce.date().optional(),
  startTime: z
    .string()
    .regex(HH_MM, "Must be HH:mm")
    .optional(),
  endTime: z
    .string()
    .regex(HH_MM, "Must be HH:mm")
    .optional(),
  notes: z.string().max(500).optional(),
  order: z.number().optional(),
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

function isWithinTrip(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return d >= s && d <= e;
}

// GET /api/v1/trips/:tripId/itinerary
router.get("/", async (req: AuthRequest, res: Response) => {
  const trip = await loadTrip(req, res);
  if (!trip) return;

  const [items, total] = await Promise.all([
    Activity.find({ trip: trip._id }).sort({ date: 1, order: 1 }),
    Activity.countDocuments({ trip: trip._id }),
  ]);
  res.json({ items, meta: { total } });
});

// POST /api/v1/trips/:tripId/itinerary
router.post("/", async (req: AuthRequest, res: Response) => {
  const trip = await loadTrip(req, res);
  if (!trip) return;

  const parsed = createActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
  }

  if (!isWithinTrip(parsed.data.date, trip.startDate, trip.endDate)) {
    return res.status(400).json({ message: "Activity date must be within trip date range" });
  }

  const activity = await Activity.create({ ...parsed.data, trip: trip._id });
  res.status(201).json({ activity });
});

// PATCH /api/v1/trips/:tripId/itinerary/:activityId
router.patch("/:activityId", async (req: AuthRequest, res: Response) => {
  const trip = await loadTrip(req, res);
  if (!trip) return;

  if (!isValidObjectId(req.params.activityId)) {
    return res.status(404).json({ message: "Activity not found" });
  }
  const activity = await Activity.findById(req.params.activityId);
  if (!activity || activity.trip.toString() !== trip._id.toString()) {
    return res.status(404).json({ message: "Activity not found" });
  }

  const parsed = updateActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
  }

  if (parsed.data.date && !isWithinTrip(parsed.data.date, trip.startDate, trip.endDate)) {
    return res.status(400).json({ message: "Activity date must be within trip date range" });
  }

  Object.assign(activity, parsed.data);
  await activity.save();
  res.json({ activity });
});

// DELETE /api/v1/trips/:tripId/itinerary/:activityId
router.delete("/:activityId", async (req: AuthRequest, res: Response) => {
  const trip = await loadTrip(req, res);
  if (!trip) return;

  if (!isValidObjectId(req.params.activityId)) {
    return res.status(404).json({ message: "Activity not found" });
  }
  const activity = await Activity.findById(req.params.activityId);
  if (!activity || activity.trip.toString() !== trip._id.toString()) {
    return res.status(404).json({ message: "Activity not found" });
  }

  await activity.deleteOne();
  res.json({ message: "Activity deleted" });
});

export default router;
