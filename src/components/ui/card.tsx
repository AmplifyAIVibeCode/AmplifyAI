import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-zinc-100 bg-white/80 shadow-lg backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
}

