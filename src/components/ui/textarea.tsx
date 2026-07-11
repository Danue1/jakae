import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-lg bg-hover px-2.5 py-2 text-sm leading-relaxed placeholder:text-muted",
        className,
      )}
      {...props}
    />
  );
}
