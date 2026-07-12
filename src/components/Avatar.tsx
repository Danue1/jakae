import { characterCoverImage, type Character } from "../core/model";
import { useImageUrl } from "../react/useImageUrl";
import { cn } from "@/lib/utils";

export const PRESET_BACKGROUND_COLORS = [
  "#cfe0f6",
  "#f6e3cf",
  "#d9f0dc",
  "#ebdcf2",
  "#f3d9de",
  "#d8e9ef",
  "#efead6",
];

const TINT_PAIRS: [string, string][] = [
  ["#cfe0f6", "#7fa3d4"],
  ["#f6e3cf", "#d2ab97"],
  ["#d9f0dc", "#8fc49b"],
  ["#ebdcf2", "#b393c9"],
  ["#f3d9de", "#ce93a2"],
  ["#d8e9ef", "#8cb6c4"],
  ["#efead6", "#c0b183"],
];

function tintPairForIdentifier(identifier: string): [string, string] {
  let sum = 0;
  for (const character of identifier) sum += character.charCodeAt(0);
  return TINT_PAIRS[sum % TINT_PAIRS.length] ?? ["#dde7f5", "#8aa6cc"];
}

export function Avatar({
  character,
  className,
  fill = false,
}: {
  character: Character;
  className?: string;
  // 가로 카드의 썸네일 열처럼 부모 크기에 꽉 채워야 할 때 정사각 대신 size-full로 전환.
  fill?: boolean;
}) {
  const imageUrl = useImageUrl(characterCoverImage(character)?.blobId ?? null);
  const [autoTint, autoInk] = tintPairForIdentifier(character.id);
  const backgroundColor = character.appearance.backgroundColor ?? autoTint;
  const silhouetteColor = character.appearance.backgroundColor
    ? "rgb(28 33 40 / 0.32)"
    : autoInk;
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden",
        fill ? "size-full" : "aspect-square rounded-card",
        className,
      )}
      style={{ background: backgroundColor }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={character.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <svg viewBox="0 0 100 100" aria-hidden="true" className="h-3/5 w-3/5">
          <circle cx="50" cy="36" r="17" fill={silhouetteColor} />
          <path
            d="M50 58c-18 0-29 11-31 26h62c-2-15-13-26-31-26z"
            fill={silhouetteColor}
          />
        </svg>
      )}
    </div>
  );
}
