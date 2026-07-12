import { Suspense } from "react";
import { OrganizationPageClient } from "./OrganizationPageClient";

export default function OrganizationPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationPageClient />
    </Suspense>
  );
}
