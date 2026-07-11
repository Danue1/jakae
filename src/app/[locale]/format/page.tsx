import Link from "next/link";
import { isLocale, type Locale } from "@/locales";

const CONTENT: Record<
  Locale,
  { title: string; intro: string; items: string[]; back: string }
> = {
  ko: {
    title: ".world 파일 포맷",
    intro:
      "세계관 하나를 담는 교환 파일입니다. 표준 zip 컨테이너라 이 앱이 없어도 열어볼 수 있습니다.",
    items: [
      "world.json — formatVersion, 세계관(필드 정의·연결어·그룹), 캐릭터 배열, 이미지 MIME 표",
      "images/{id} — 캐릭터 원본 이미지",
      "가져오기는 항상 새 사본을 만듭니다(모든 id 재발급) — 기존 데이터와 충돌하지 않습니다.",
      "휴지통의 캐릭터는 파일에 포함되지 않습니다.",
    ],
    back: "서재로 가기",
  },
  en: {
    title: ".world file format",
    intro:
      "An exchange file holding one world. It is a standard zip container, readable even without this app.",
    items: [
      "world.json — formatVersion, the world (field definitions, connectors, groups), characters, image MIME map",
      "images/{id} — original character images",
      "Importing always creates a fresh copy (all ids reissued) — it never collides with existing data.",
      "Characters in the trash are not included in the file.",
    ],
    back: "Go to library",
  },
  ja: {
    title: ".world ファイル形式",
    intro:
      "世界観ひとつを収める交換ファイルです。標準のzipコンテナなので、このアプリがなくても開けます。",
    items: [
      "world.json — formatVersion、世界観（フィールド定義・接続語・グループ）、キャラクター、画像MIME表",
      "images/{id} — キャラクターの元画像",
      "読み込みは常に新しいコピーを作ります（全idを再発行）— 既存データと衝突しません。",
      "ゴミ箱のキャラクターはファイルに含まれません。",
    ],
    back: "書斎へ",
  },
};

export default async function FormatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = CONTENT[isLocale(locale) ? locale : "ko"];
  return (
    <article className="mx-auto max-w-xl px-5 py-14">
      <h1 className="text-2xl font-extrabold tracking-tight">{content.title}</h1>
      <p className="mt-4 text-sm leading-relaxed">{content.intro}</p>
      <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
        {content.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Link
        href={`/${locale}/`}
        className="mt-8 inline-block rounded-lg bg-accent-soft px-4 py-2 text-sm font-bold text-accent"
      >
        {content.back}
      </Link>
    </article>
  );
}
