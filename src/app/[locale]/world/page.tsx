import { Suspense } from "react";
import { WorldPageClient } from "./WorldPageClient";

export default function WorldPage() {
  return (
    <Suspense fallback={null}>
      <WorldPageClient />
    </Suspense>
  );
}
