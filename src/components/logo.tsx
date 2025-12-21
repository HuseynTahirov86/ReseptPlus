import { cn } from "@/lib/utils";
import { HeartPulse } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <HeartPulse className="h-7 w-7 text-accent" />
      <div className="text-2xl font-bold tracking-tight">
        <span className="font-medium">Saglik</span>
        <span className="text-accent">Net</span>
      </div>
    </div>
  );
}
