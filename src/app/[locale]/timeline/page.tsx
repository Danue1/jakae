import { Suspense } from "react";
import { TimelinePageClient } from "./TimelinePageClient";

export default function TimelinePage() {
  return (
    <Suspense fallback={null}>
      <TimelinePageClient />
    </Suspense>
  );
}
