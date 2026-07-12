import { Suspense } from "react";
import { ItemPageClient } from "./ItemPageClient";

export default function ItemPage() {
  return (
    <Suspense fallback={null}>
      <ItemPageClient />
    </Suspense>
  );
}
