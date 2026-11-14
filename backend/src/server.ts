import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import destinationRoutes from "./routes/destinations";
import favoriteRoutes from "./routes/favorites";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/destinations", destinationRoutes);
app.use("/api/v1/users/me/favorites", favoriteRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("MongoDB connected");
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}

start();