import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/theme.css";

export const metadata: Metadata = {
  title: "Sharpen",
  description:
    "창작 세계관 설정 정리 도구 — 브라우저에만 저장되는 로컬 우선 스탠드얼론.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
