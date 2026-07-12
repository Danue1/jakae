import { Suspense } from "react";
import { ChapterPageClient } from "./ChapterPageClient";

export default function ChapterPage() {
  return (
    <Suspense fallback={null}>
      <ChapterPageClient />
    </Suspense>
  );
}
