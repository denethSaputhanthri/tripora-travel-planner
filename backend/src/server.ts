import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import destinationRoutes from "./routes/destinations";
import favoriteRoutes from "./routes/favorites";
import tripRoutes from "./routes/trips";
import itineraryRoutes from "./routes/itinerary";
import expenseRoutes from "./routes/expenses";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/destinations", destinationRoutes);
app.use("/api/v1/users/me/favorites", favoriteRoutes);
app.use("/api/v1/trips", tripRoutes);
app.use("/api/v1/trips/:tripId/itinerary", itineraryRoutes);
app.use("/api/v1/trips/:tripId/expenses", expenseRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

async function start() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("MongoDB connected");
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}

start();