import { ChevronRight, Star, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Character } from "@/core/model";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";

// 목록 통일 규격 — 갤러리(가로 카드)와 표(컴팩트 행)가 같은 데이터 문법을 공유한다.
// 캐릭터처럼 컨텍스트 메뉴가 필요한 항목은 아래 *Body와 클래스 상수를 직접 조합한다.

export const galleryGridClass =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3";
export const tableClass = "overflow-hidden rounded-xl border border-line";

export const entityCardClass =
  "flex min-h-20 items-stretch overflow-hidden rounded-xl border border-line";
export const entityCardLinkClass = cn(
  entityCardClass,
  "outline-none hover:border-accent focus-visible:border-accent",
);
export const entityRowClass =
  "flex items-center gap-3 border-b border-line px-3 py-2 last:border-0";
export const entityRowLinkClass = cn(
  entityRowClass,
  "outline-none hover:bg-hover focus-visible:bg-hover",
);

interface EntityBodyProps {
  thumb: ReactNode;
  name: string;
  favorite?: boolean;
  subtitle?: string;
  meta?: ReactNode;
}

export function EntityCardBody({
  thumb,
  name,
  favorite = false,
  subtitle,
  meta,
}: EntityBodyProps) {
  return (
    <>
      <div className="w-20 shrink-0 self-stretch overflow-hidden">{thumb}</div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold">{name || "-"}</span>
          {favorite && (
            <Star
              size={14}
              aria-hidden="true"
              fill="currentColor"
              className="shrink-0 text-star"
            />
          )}
        </div>
        {subtitle ? (
          <p className="line-clamp-2 text-xs text-muted">{subtitle}</p>
        ) : null}
        {meta ? (
          <div className="mt-1.5 flex items-center gap-1.5">{meta}</div>
        ) : null}
      </div>
    </>
  );
}

export function EntityRowBody({
  thumb,
  name,
  favorite = false,
  subtitle,
  meta,
  chevron = true,
}: EntityBodyProps & { chevron?: boolean }) {
  return (
    <>
      <span className="shrink-0">{thumb}</span>
      <span className="flex min-w-0 shrink items-center gap-1.5">
        <span className="truncate text-sm font-semibold">{name || "-"}</span>
        {favorite && (
          <Star
            size={13}
            aria-hidden="true"
            fill="currentColor"
            className="shrink-0 text-star"
          />
        )}
      </span>
      {subtitle ? (
        <span className="min-w-0 flex-1 shrink truncate text-xs text-muted">
          {subtitle}
        </span>
      ) : (
        <span className="flex-1" />
      )}
      {meta ? (
        <span className="flex shrink-0 items-center gap-1.5">{meta}</span>
      ) : null}
      {chevron && (
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-muted"
        />
      )}
    </>
  );
}

export function EntityCard({
  href,
  ...body
}: { href: string } & EntityBodyProps) {
  return (
    <Link href={href} className={entityCardLinkClass}>
      <EntityCardBody {...body} />
    </Link>
  );
}

export function EntityRow({
  href,
  ...body
}: { href: string } & EntityBodyProps) {
  return (
    <Link href={href} className={entityRowLinkClass}>
      <EntityRowBody {...body} />
    </Link>
  );
}

// 아이콘 타일 썸네일 — 이미지가 없는 로어 엔티티(조직·장소·용어·사건)의 공통 표시.
export function IconCardThumb({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="grid size-full place-items-center bg-accent-soft text-accent">
      <Icon size={26} aria-hidden="true" />
    </div>
  );
}

export function IconRowThumb({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
      <Icon size={16} aria-hidden="true" />
    </div>
  );
}

// 사건 카드의 시점 칩 썸네일. 시점 문자열이 없으면 caller가 아이콘 썸네일로 대체한다.
export function WhenCardThumb({ when }: { when: string }) {
  return (
    <div className="grid size-full place-items-center bg-accent-soft px-1 text-center text-xs font-bold leading-tight text-accent">
      {when}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
      {children}
    </span>
  );
}

export function KindBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-hover px-2 py-0.5 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

// 겹친 아바타 스택 — 조직 구성원·사건 참여 자캐를 카드/행 메타에 표시한다.
export function AvatarStack({
  characters,
  limit = 5,
}: {
  characters: Character[];
  limit?: number;
}) {
  if (characters.length === 0) return null;
  return (
    <span className="flex pl-1.5">
      {characters.slice(0, limit).map((character) => (
        <Avatar
          key={character.id}
          character={character}
          className="-ml-1.5 w-6 rounded-md border-2 border-ground"
        />
      ))}
    </span>
  );
}
