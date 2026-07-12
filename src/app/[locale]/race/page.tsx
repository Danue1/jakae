import { Suspense } from "react";
import { RacePageClient } from "./RacePageClient";

export default function RacePage() {
  return (
    <Suspense fallback={null}>
      <RacePageClient />
    </Suspense>
  );
}
