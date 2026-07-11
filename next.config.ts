import type { NextConfig } from "next";

// GitHub Pages 정적 호스팅 전제 — 서버 기능 불사용.
// basePath는 배포 워크플로에서 저장소 이름으로 주입된다.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  images: { unoptimized: true },
  experimental: { reactCompiler: true },
};

export default nextConfig;
