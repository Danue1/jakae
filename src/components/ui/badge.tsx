import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent",
        className,
      )}
      {...props}
    />
  );
}
