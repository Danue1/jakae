import type { DirtySet } from "../core/commands";
import type { EntityWriteBatch } from "../ports/storagePort";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface SavePipelineOptions {
  debounceMilliseconds: number;
  resolveBatch: (
    worldviewDirty: boolean,
    characterIds: string[],
    removedCharacterIds: string[],
  ) => EntityWriteBatch;
  write: (batch: EntityWriteBatch) => Promise<void>;
  onSaveStateChange: (saveState: SaveState) => void;
}

// 저장 표시는 실제 flush 결과에만 연결된다 — 호출 시점에 "저장됨"을 띄우지 않는다.
export class SavePipeline {
  private worldviewDirty = false;
  private dirtyCharacterIds = new Set<string>();
  private removedCharacterIds = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;
  private retryDelayMilliseconds = 0;

  constructor(private options: SavePipelineOptions) {}

  enqueue(dirty: DirtySet): void {
    if (dirty.worldview) this.worldviewDirty = true;
    for (const characterId of dirty.characterIds ?? []) {
      this.dirtyCharacterIds.add(characterId);
    }
    for (const characterId of dirty.removedCharacterIds ?? []) {
      this.dirtyCharacterIds.delete(characterId);
      this.removedCharacterIds.add(characterId);
    }
    this.retryDelayMilliseconds = 0;
    this.schedule(this.options.debounceMilliseconds);
  }

  hasPendingWork(): boolean {
    return (
      this.worldviewDirty ||
      this.dirtyCharacterIds.size > 0 ||
      this.removedCharacterIds.size > 0
    );
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.flushing || !this.hasPendingWork()) return;

    const worldviewDirty = this.worldviewDirty;
    const characterIds = [...this.dirtyCharacterIds];
    const removedCharacterIds = [...this.removedCharacterIds];
    this.worldviewDirty = false;
    this.dirtyCharacterIds.clear();
    this.removedCharacterIds.clear();

    this.flushing = true;
    this.options.onSaveStateChange("saving");
    try {
      await this.options.write(
        this.options.resolveBatch(worldviewDirty, characterIds, removedCharacterIds),
      );
      this.retryDelayMilliseconds = 0;
      this.options.onSaveStateChange(this.hasPendingWork() ? "saving" : "saved");
    } catch {
      if (worldviewDirty) this.worldviewDirty = true;
      for (const characterId of characterIds) {
        this.dirtyCharacterIds.add(characterId);
      }
      for (const characterId of removedCharacterIds) {
        this.removedCharacterIds.add(characterId);
      }
      this.options.onSaveStateChange("error");
      this.retryDelayMilliseconds = Math.min(
        Math.max(this.retryDelayMilliseconds * 2, 2000),
        10000,
      );
      this.schedule(this.retryDelayMilliseconds);
    } finally {
      this.flushing = false;
    }
    if (this.hasPendingWork() && !this.timer) {
      this.schedule(this.options.debounceMilliseconds);
    }
  }

  reset(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.worldviewDirty = false;
    this.dirtyCharacterIds.clear();
    this.removedCharacterIds.clear();
  }

  private schedule(delayMilliseconds: number): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, delayMilliseconds);
  }
}
