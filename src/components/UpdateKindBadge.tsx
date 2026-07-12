import type { UpdateKind } from "@/core/updates";
import { cn } from "@/lib/utils";

const KIND_CLASS: Record<UpdateKind, string> = {
  new: "bg-accent-soft text-accent",
  improve: "bg-hover text-ink",
  fix: "bg-hover text-muted",
};

export function UpdateKindBadge({
  kind,
  label,
}: {
  kind: UpdateKind;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-block flex-none rounded-full px-2 py-0.5 text-xs font-bold",
        KIND_CLASS[kind],
      )}
    >
      {label}
    </span>
  );
}
