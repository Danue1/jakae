import { Suspense } from "react";
import { GlossaryPageClient } from "./GlossaryPageClient";

export default function GlossaryPage() {
  return (
    <Suspense fallback={null}>
      <GlossaryPageClient />
    </Suspense>
  );
}
