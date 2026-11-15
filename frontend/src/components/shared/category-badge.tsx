import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: "beach" | "city" | "mountain" | "culture" | "adventure" | "accommodation" | "sightseeing" | "food" | "transport" | "shopping" | "other" | string;
  className?: string;
}

const colorMap: Record<string, string> = {
  beach: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
  city: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
  mountain: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
  culture: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
  adventure: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200",
  accommodation: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200",
  sightseeing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200",
  food: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200",
  transport: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200",
  shopping: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border-pink-200",
  other: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200",
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = colorMap[category.toLowerCase()] || colorMap.other;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide transition-colors",
        colorClass,
        className
      )}
    >
      {category}
    </span>
  );
}
