export type UpdateKind = "new" | "improve" | "fix";

export interface ReleaseNoteEntry {
  id: string;
  kind: UpdateKind;
}

export interface ReleaseNote {
  version: string;
  date: string;
  entries: ReleaseNoteEntry[];
}

// 최신순. 새 릴리스는 배열 맨 앞에 블록을 추가하고, 문구는 각 사전의 updates.entryText에 같은 id로 넣는다.
export const releaseNotes: readonly ReleaseNote[] = [
  {
    version: "v0.2",
    date: "2026-07-13",
    entries: [
      { id: "v0-2-rebrand", kind: "improve" },
      { id: "v0-2-lore-entities", kind: "new" },
      { id: "v0-2-wiki-ia", kind: "improve" },
      { id: "v0-2-reorder", kind: "new" },
    ],
  },
  {
    version: "v0.1",
    date: "2026-07-12",
    entries: [
      { id: "v0-1-launch", kind: "new" },
      { id: "v0-1-customization", kind: "new" },
      { id: "v0-1-multilingual", kind: "new" },
    ],
  },
];

export const latestReleaseVersion: string = releaseNotes[0]?.version ?? "";

export function hasUnseenRelease(lastSeenVersion: string | null): boolean {
  return latestReleaseVersion !== "" && lastSeenVersion !== latestReleaseVersion;
}
