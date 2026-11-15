import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  text = "Loading...",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 gap-3 text-muted-foreground", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
}
