import { useEffect, useState } from "react";
import { browserImageAdapter } from "../adapters/browserImageAdapter";

export function useImageUrl(imageId: string | null): string | null {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) {
      setImageUrl(null);
      return;
    }
    let cancelled = false;
    void browserImageAdapter.getImageUrl(imageId).then((url) => {
      if (!cancelled) setImageUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [imageId]);

  return imageId ? imageUrl : null;
}
