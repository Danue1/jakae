import {
  BookText,
  Building2,
  Clock,
  Dna,
  MapPin,
  User,
  type LucideIcon,
} from "lucide-react";
import type { EntityKind } from "@/core/model";
import type { Locale } from "@/locales";
import {
  characterHref,
  chapterHref,
  eventHref,
  glossaryHref,
  organizationHref,
  placeHref,
  raceHref,
} from "@/react/links";

// 엔티티 종류의 UI 정보(아이콘·이동 링크·라벨 키) — core 레지스트리(model.ts)의 UI 짝.
// 새 엔티티 타입은 여기 한 항목만 더하면 참조 피커·링크·백링크가 모두 동작한다.
export interface EntityKindUi {
  icon: LucideIcon;
  labelKey: string;
  href: (locale: Locale, worldviewId: string, id: string) => string;
}

export const ENTITY_KIND_UI: Record<EntityKind, EntityKindUi> = {
  character: {
    icon: User,
    labelKey: "entityKind.character",
    href: characterHref,
  },
  group: {
    icon: Building2,
    labelKey: "entityKind.group",
    href: organizationHref,
  },
  place: { icon: MapPin, labelKey: "entityKind.place", href: placeHref },
  race: { icon: Dna, labelKey: "entityKind.race", href: raceHref },
  glossary: {
    icon: BookText,
    labelKey: "entityKind.glossary",
    href: glossaryHref,
  },
  chapter: { icon: Clock, labelKey: "entityKind.chapter", href: chapterHref },
  event: { icon: Clock, labelKey: "entityKind.event", href: eventHref },
};
