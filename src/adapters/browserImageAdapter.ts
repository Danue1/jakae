import type { ImagePort } from "../ports/imagePort";
import { indexedDbStorage } from "./indexedDbStorage";

const IMAGE_URL_CACHE_LIMIT = 200;

// 객체 URL 수명 관리 — 캐시 상한을 넘으면 가장 오래된 URL부터 revoke.
const imageUrlCache = new Map<string, string>();

function rememberImageUrl(imageId: string, url: string): void {
  imageUrlCache.set(imageId, url);
  while (imageUrlCache.size > IMAGE_URL_CACHE_LIMIT) {
    const oldest = imageUrlCache.entries().next().value;
    if (!oldest) break;
    URL.revokeObjectURL(oldest[1]);
    imageUrlCache.delete(oldest[0]);
  }
}

export const browserImageAdapter: ImagePort = {
  async saveImageFile(file: Blob): Promise<string> {
    const imageId = crypto.randomUUID();
    await indexedDbStorage.putImage(imageId, file);
    return imageId;
  },

  async copyImage(imageId: string): Promise<string | null> {
    const blob = await indexedDbStorage.getImageBlob(imageId);
    if (!blob) return null;
    const copiedImageId = crypto.randomUUID();
    await indexedDbStorage.putImage(copiedImageId, blob);
    return copiedImageId;
  },

  async getImageUrl(imageId: string): Promise<string | null> {
    const cached = imageUrlCache.get(imageId);
    if (cached) return cached;
    const blob = await indexedDbStorage.getImageBlob(imageId);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    rememberImageUrl(imageId, url);
    return url;
  },
};
