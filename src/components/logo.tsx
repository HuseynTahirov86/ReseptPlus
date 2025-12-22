import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image src="/logo.png" alt="ReseptPlus Logo" width={140} height={35} priority />
    </div>
  );
}
