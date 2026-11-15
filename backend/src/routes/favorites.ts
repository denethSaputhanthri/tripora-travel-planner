import { Router, Response } from "express";
import { isValidObjectId } from "mongoose";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { Favorite } from "../models/Favorite";
import { Destination } from "../models/Destination";

const router = Router();
router.use(requireAuth);

// GET /api/v1/users/me/favorites
router.get("/", async (req: AuthRequest, res: Response) => {
  const favorites = await Favorite.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .populate("destination");
  res.json({ items: favorites.map((f) => f.destination) });
});

// POST /api/v1/users/me/favorites/:destinationId
router.post("/:destinationId", async (req: AuthRequest, res: Response) => {
  const { destinationId } = req.params;
  if (!isValidObjectId(destinationId)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const exists = await Destination.exists({ _id: destinationId });
  if (!exists) return res.status(404).json({ message: "Destination not found" });

  await Favorite.updateOne(
    { user: req.userId, destination: destinationId },
    { $setOnInsert: { user: req.userId, destination: destinationId } },
    { upsert: true }
  );
  res.status(201).json({ message: "Added to favorites" });
});

// DELETE /api/v1/users/me/favorites/:destinationId
router.delete("/:destinationId", async (req: AuthRequest, res: Response) => {
  const { destinationId } = req.params;
  if (!isValidObjectId(destinationId)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  await Favorite.deleteOne({ user: req.userId, destination: destinationId });
  res.json({ message: "Removed from favorites" });
});

export default router;