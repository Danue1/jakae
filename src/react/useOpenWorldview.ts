import { useEffect, useState } from "react";
import { openWorldview } from "../store/worldviewStore";
import { useWorldviewStore } from "./useWorldviewStore";

export type WorldviewLoadStatus = "loading" | "ready" | "missing";

export function useOpenWorldview(
  worldviewId: string | null,
): WorldviewLoadStatus {
  const loadedWorldviewId = useWorldviewStore(
    (state) => state.worldview?.id ?? null,
  );
  const [status, setStatus] = useState<WorldviewLoadStatus>("loading");

  useEffect(() => {
    if (!worldviewId) {
      setStatus("missing");
      return;
    }
    if (loadedWorldviewId === worldviewId) {
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    void openWorldview(worldviewId).then((opened) => {
      if (!cancelled) setStatus(opened ? "ready" : "missing");
    });
    return () => {
      cancelled = true;
    };
  }, [worldviewId, loadedWorldviewId]);

  return status;
}
