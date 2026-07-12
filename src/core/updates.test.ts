import { describe, expect, it } from "vitest";
import { hasUnseenRelease, latestReleaseVersion } from "./updates";

describe("hasUnseenRelease", () => {
  it("아직 아무것도 확인하지 않았으면 안 본 릴리스가 있다", () => {
    expect(hasUnseenRelease(null)).toBe(true);
  });

  it("최신 버전을 확인했으면 안 본 릴리스가 없다", () => {
    expect(hasUnseenRelease(latestReleaseVersion)).toBe(false);
  });

  it("지난 버전만 확인했으면 안 본 릴리스가 있다", () => {
    expect(hasUnseenRelease("v0.0")).toBe(true);
  });
});
