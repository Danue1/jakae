# character-organizer

자캐(캐릭터) 정리 서비스. GitHub Pages 스탠드얼론 웹(모바일·태블릿·데스크탑 해상도), T1 여백 테마, 다국어(ko·en·ja).

## 계층 규칙 (단방향: UI → store → core → ports)

- `core/`는 아무것도 import하지 않는다 (모델·커맨드·선택자·교환 포맷·레거시 정규화 — 순수 TS, 무DOM).
- 컴포넌트·페이지에서 `adapters/`·`ports/` import 금지. 도메인 읽기는 `useWorldviewStore(selector)`, 변경은 `dispatchCommand(command)`만.
- 상태 3분류 — 도메인: 스토어 / 뷰(필터·검색·대상 id): URL 검색 파라미터 / 순수 UI(draft·열림): `useState`. 그 외 보관처 금지.

## Next.js (정적 내보내기 전제 — GitHub Pages)

- `output: "export"` 고정. SSR·API Routes·Server Actions 등 서버 의존 기능 사용 금지.
- 동적 라우트 세그먼트 금지(빌드 시점에 없는 id) — 경로는 정적, 대상은 쿼리 파라미터(`?w=`, `?ch=`). 예외는 `[locale]`뿐(빌드 시점 확정 값, `generateStaticParams`).
- 링크는 `next/link`와 `react/links.ts`의 href 빌더만 사용. 절대 URL·해시 직접 조작 금지 (basePath 자동 반영을 깨뜨림).
- `useSearchParams`를 쓰는 화면은 `page.tsx`(서버, Suspense 래핑) + `*PageClient.tsx`(클라이언트) 분리 패턴.
- IndexedDB 접근은 마운트 후(effect)에만 — 프리렌더 HTML은 스켈레톤이어야 한다.

## 다국어

- UI 문자열 하드코딩 금지 — `locales/` 사전(`useLocale().dictionary`) 경유. 언어 추가 = 사전 파일 + `LOCALES` 등록.
- 사용자 데이터(필드 라벨·태그·연결어·스토리)는 번역하지 않는다. 시드 기본값(기본 필드·연결어·샘플)은 생성 시점 언어.

## React

- 수동 메모이제이션 금지 (`useMemo`/`useCallback`/`memo`) — React Compiler에 위임. 예외는 측정 근거를 주석으로.
- `useEffect`는 구독·포커스·전역 이벤트리스너·마운트 후 IO에 한정. 데이터 흐름을 effect로 잇지 않는다.
- 콜백 prop으로 도메인 변경을 전달하지 않는다 — 컴포넌트가 `dispatchCommand`를 직접 호출.

## 도구 사용 방식 (하나로 고정)

- 스타일: Tailwind 유틸리티만. 임의값(`w-[137px]`) 금지 — 필요하면 `theme.css`의 `@theme`에 토큰 추가. 인라인 style 금지(동적 배경색·틴트만 예외).
- 오버레이·메뉴·선택·다이얼로그는 `components/ui/`(shadcn 계열, T1로 개조된 우리 소스)만 사용. 동종 자작 금지.
- 텍스트 입력 키 처리는 `react/inputGuards.ts`(한글 IME `isComposing` 가드) 경유. 도메인 필드 입력은 `useFieldBinding`.

## UI 원칙

- 카운트(개수)는 UI 어디에도 표시하지 않는다.
- T1 토큰 밖의 색·그림자 금지(사용자 지정 배경색은 예외 — 사용자의 자유). 최소 글자 13px, muted 대비 4.5:1. 라이트 단일 테마.
- 모든 제스처(우클릭·롱프레스)에 가시적 대체 경로(⋯ 버튼 등)를 둔다. 터치 타깃 44px 이상.

## 코드 스타일

- 식별자는 약어 없는 전체 표현 (`fieldDefinitionId`, `visibleCharacters`).
- 커맨드 타입은 kebab-case 동사구 (`set-field-value`).
- 주석은 비자명한 의도·업무 규칙에만.

## 검증

- `npm test` (vitest, core 대상) · `npx tsc --noEmit` · `npm run build` (next build, 정적 내보내기 포함).
- 배포: `.github/workflows/deploy.yml` — main 푸시 시 GitHub Pages, `NEXT_PUBLIC_BASE_PATH`는 저장소 이름으로 자동 주입.
