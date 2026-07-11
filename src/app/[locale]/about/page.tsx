import Link from "next/link";
import { isLocale, type Locale } from "@/locales";

const CONTENT: Record<Locale, { title: string; paragraphs: string[]; back: string }> = {
  ko: {
    title: "자캐정리 소개",
    paragraphs: [
      "자캐(자작 캐릭터)를 세계관 단위로 정리하는 도구입니다. 서버 없이 동작하며, 모든 데이터는 지금 쓰고 있는 브라우저에만 저장됩니다.",
      "링크는 데이터를 담지 않아요. 다른 기기나 브라우저에서는 각자의 서재가 새로 시작됩니다.",
      "프로필 필드·관계 연결어·카드 배경색까지 모두 사용자가 정할 수 있습니다.",
    ],
    back: "서재로 가기",
  },
  en: {
    title: "About Character Organizer",
    paragraphs: [
      "A tool for organizing original characters by world. It runs without a server — everything is stored only in the browser you are using now.",
      "Links do not carry data. On another device or browser, a fresh library starts.",
      "Profile fields, relation connectors, and card background colors are all yours to define.",
    ],
    back: "Go to library",
  },
  ja: {
    title: "キャラ整理について",
    paragraphs: [
      "自作キャラクターを世界観ごとに整理するツールです。サーバーなしで動作し、データは今使っているブラウザにのみ保存されます。",
      "リンクはデータを運びません。別の端末やブラウザでは、新しい書斎が始まります。",
      "プロフィールフィールド・関係の接続語・カードの背景色まで、すべて自分で決められます。",
    ],
    back: "書斎へ",
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = CONTENT[isLocale(locale) ? locale : "ko"];
  return (
    <article className="mx-auto max-w-xl px-5 py-14">
      <h1 className="text-2xl font-extrabold tracking-tight">{content.title}</h1>
      <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <Link
        href={`/${locale}/`}
        className="mt-8 inline-block rounded-lg bg-accent-soft px-4 py-2 text-sm font-bold text-accent"
      >
        {content.back}
      </Link>
    </article>
  );
}
