import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-lg font-bold">페이지를 찾을 수 없어요 · Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        주소가 바뀌었거나 잘못 입력됐어요.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-accent-soft px-4 py-2 text-sm font-bold text-accent"
      >
        서재로 가기 · Go to library
      </Link>
    </div>
  );
}
