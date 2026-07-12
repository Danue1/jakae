"use client";

import { useEffect, useState } from "react";
import { hasUnseenRelease, latestReleaseVersion } from "@/core/updates";

const LAST_SEEN_RELEASE_KEY = "character-organizer.lastSeenReleaseVersion";

export function useSeenRelease(): {
  hasUnseen: boolean;
  markSeen: () => void;
} {
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    setHasUnseen(hasUnseenRelease(localStorage.getItem(LAST_SEEN_RELEASE_KEY)));
  }, []);

  const markSeen = () => {
    localStorage.setItem(LAST_SEEN_RELEASE_KEY, latestReleaseVersion);
    setHasUnseen(false);
  };

  return { hasUnseen, markSeen };
}
