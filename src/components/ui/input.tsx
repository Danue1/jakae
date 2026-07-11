import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md bg-transparent px-1.5 py-1 text-sm placeholder:text-muted hover:bg-hover focus:bg-hover",
        className,
      )}
      {...props}
    />
  );
}
