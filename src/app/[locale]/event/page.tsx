import { Suspense } from "react";
import { EventPageClient } from "./EventPageClient";

export default function EventPage() {
  return (
    <Suspense fallback={null}>
      <EventPageClient />
    </Suspense>
  );
}
