import "dotenv/config";
import mongoose from "mongoose";
import { Destination } from "../models/Destination";

const data = [
  { name: "Bali", country: "Indonesia", category: "beach", dailyCostUsd: 60,
    description: "Tropical island with rice terraces, temples, and surf beaches.",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    tips: ["Rent a scooter carefully", "Visit temples in the morning"] },
  { name: "Kyoto", country: "Japan", category: "culture", dailyCostUsd: 120,
    description: "Japan's old capital, famous for temples, gardens, and geisha districts.",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    tips: ["Buy an IC transit card", "Visit Fushimi Inari at sunrise"] },
  { name: "Paris", country: "France", category: "city", dailyCostUsd: 180,
    description: "The city of art, food, and the Eiffel Tower.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    tips: ["Book museum tickets online", "Walk along the Seine"] },
  { name: "Swiss Alps", country: "Switzerland", category: "mountain", dailyCostUsd: 220,
    description: "Snowy peaks, hiking trails, and scenic train rides.",
    imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7",
    tips: ["Get a Swiss Travel Pass", "Pack layers"] },
  { name: "Queenstown", country: "New Zealand", category: "adventure", dailyCostUsd: 150,
    description: "The adventure capital: bungee jumping, skiing, and lake views.",
    imageUrl: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad",
    tips: ["Book activities early", "Check weather before hikes"] },
  { name: "Galle", country: "Sri Lanka", category: "culture", dailyCostUsd: 50,
    description: "A historic Dutch fort town on the southern coast.",
    imageUrl: "https://images.unsplash.com/photo-1586613835341-2a4ac7aa0f73",
    tips: ["Walk the fort ramparts at sunset", "Try fresh seafood"] },
  { name: "Maldives", country: "Maldives", category: "beach", dailyCostUsd: 300,
    description: "Overwater villas and crystal-clear lagoons.",
    imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
    tips: ["Compare resort packages", "Bring reef-safe sunscreen"] },
  { name: "New York City", country: "USA", category: "city", dailyCostUsd: 250,
    description: "Skyscrapers, museums, Broadway, and endless food.",
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
    tips: ["Use the subway", "Book shows in advance"] },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  await Destination.deleteMany({});
  await Destination.insertMany(data);
  console.log(`Seeded ${data.length} destinations`);
  await mongoose.disconnect();
}

seed();