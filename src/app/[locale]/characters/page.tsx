import { Suspense } from "react";
import { CharactersPageClient } from "./CharactersPageClient";

export default function CharactersPage() {
  return (
    <Suspense fallback={null}>
      <CharactersPageClient />
    </Suspense>
  );
}
