import { Suspense } from "react";
import { CharacterPageClient } from "./CharacterPageClient";

export default function CharacterPage() {
  return (
    <Suspense fallback={null}>
      <CharacterPageClient />
    </Suspense>
  );
}
