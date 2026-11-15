import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "upcoming" | "ongoing" | "completed" | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let styles = "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300";
  let label = "Completed";

  if (normalized === "upcoming") {
    styles = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300";
    label = "Upcoming";
  } else if (normalized === "ongoing") {
    styles = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300";
    label = "Ongoing Now";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        styles,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          normalized === "ongoing"
            ? "bg-emerald-500 animate-pulse"
            : normalized === "upcoming"
            ? "bg-blue-500"
            : "bg-zinc-400"
        )}
      />
      {label}
    </span>
  );
}
