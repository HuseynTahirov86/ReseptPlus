import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/logo.png" alt="ReseptPlus Logo" width={28} height={28} />
      <div className="text-2xl font-bold tracking-tight">
        <span className="font-medium">Resept</span>
        <span className="text-primary">Plus</span>
      </div>
    </div>
  );
}
