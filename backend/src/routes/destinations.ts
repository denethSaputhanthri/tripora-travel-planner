import { Router } from "express";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { Destination } from "../models/Destination";

const router = Router();

const querySchema = z.object({
  search: z.string().trim().max(50).optional(),
  category: z.enum(["beach", "city", "mountain", "culture", "adventure"]).optional(),
  maxCost: z.coerce.number().min(0).optional(),
  sort: z.enum(["name", "cost_asc", "cost_desc"]).default("name"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(6),
});

// GET /api/v1/destinations?search=&category=&maxCost=&sort=&page=&limit=
router.get("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid query" });
  }
  const { search, category, maxCost, sort, page, limit } = parsed.data;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (maxCost !== undefined) filter.dailyCostUsd = { $lte: maxCost };
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");
    filter.$or = [{ name: regex }, { country: regex }];
  }

  const sortMap = {
    name: { name: 1 },
    cost_asc: { dailyCostUsd: 1 },
    cost_desc: { dailyCostUsd: -1 },
  } as const;

  const [items, total] = await Promise.all([
    Destination.find(filter)
      .sort(sortMap[sort])
      .skip((page - 1) * limit)
      .limit(limit),
    Destination.countDocuments(filter),
  ]);

  res.json({
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/v1/destinations/:id
router.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const destination = await Destination.findById(req.params.id);
  if (!destination) return res.status(404).json({ message: "Destination not found" });
  res.json({ destination });
});

export default router;