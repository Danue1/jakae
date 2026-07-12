import { Suspense } from "react";
import { OverviewPageClient } from "./OverviewPageClient";

export default function WorldPage() {
  return (
    <Suspense fallback={null}>
      <OverviewPageClient />
    </Suspense>
  );
}
