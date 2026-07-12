import { Suspense } from "react";
import { PlacePageClient } from "./PlacePageClient";

export default function PlacePage() {
  return (
    <Suspense fallback={null}>
      <PlacePageClient />
    </Suspense>
  );
}
