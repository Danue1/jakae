import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/theme.css";

export const metadata: Metadata = {
  title: "자캐정리 · Character Organizer",
  description:
    "자캐(캐릭터) 정리 서비스 — 브라우저에만 저장되는 로컬 우선 스탠드얼론.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
