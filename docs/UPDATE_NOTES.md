# 업데이트 노트 컨벤션

서비스의 사용자 대상 변경(신규 기능·개선·수정)을 기록하고 알리는 규칙입니다.
노출 UI(라이브러리 헤더의 종 팝오버 + `/[locale]/updates` 전용 페이지)는 아래 데이터를 자동으로 읽어 그리므로, **릴리스마다 데이터만 추가**하면 됩니다.

## 무엇을 적는가

- 적는다: 사용자가 화면에서 체감하는 변화 — 새 기능, 눈에 보이는 개선, 버그 수정.
- 적지 않는다: 내부 리팩터·의존성 갱신·CI 등 사용자와 무관한 변경.
- 한 항목은 한 문장, 사용자 관점의 이득 중심으로. 카운트(개수)는 어디에도 쓰지 않는다.

## 버전 규칙 — SemVer-lite

형식은 `MAJOR.MINOR[.PATCH]`.

- **정식 출시 전에는 `v0.x`** 로 유지한다.
- **신규 또는 개선**이 포함된 릴리스 → 마이너를 올린다. `v0.1 → v0.2`
- **수정만** 있는 릴리스 → 패치를 올린다. `v0.1 → v0.1.1`
- **정식 출시** 시점에 `v1.0` 으로 올린다.

표기 규칙:

- `releaseNotes`의 `version` 필드와 UI 표시는 패치가 `0`이면 생략한다 — `v0.1`, 패치가 있으면 `v0.1.1`.
- `package.json`의 `version`은 접두사 `v` 없이 3자리 전체 표기 — `0.1.0`, `0.1.1`.

## 변경 유형

세 가지로 고정한다. 그 외 유형은 만들지 않는다.

| 유형 | id `kind` | 뜻 |
| --- | --- | --- |
| 신규 | `new` | 없던 기능이 새로 생김 |
| 개선 | `improve` | 기존 기능이 더 나아짐 |
| 수정 | `fix` | 버그·오류를 고침 |

## 데이터 위치 — 구조와 문구 분리

- **구조**(버전·날짜·항목의 유형과 id): [`src/core/updates.ts`](../src/core/updates.ts)의 `releaseNotes`.
  버전/날짜는 언어와 무관한 사실이므로 여기 한 곳에만 둔다.
- **문구**(항목 텍스트): 각 언어 메시지 정의의 `updates.entryText`(현재 `src/locales/messages/{ko,en,ja}.ts`).
  항목 id를 키로, 그 언어의 한 문장을 값으로 둔다.

`entryText`는 문자열 맵이라 특정 언어에서 id가 빠져도 타입 오류가 나지 않는다.
**새 항목 id는 반드시 세 언어(ko·en·ja) 모두에 추가**한다 — 하나라도 빠지면 그 언어에서 빈 항목이 된다.

## 릴리스 추가 절차

1. `src/core/updates.ts`의 `releaseNotes` **맨 앞**에 새 블록을 추가한다(최신순 유지).
   - `version`: 위 버전 규칙에 따라.
   - `date`: 배포일, ISO `YYYY-MM-DD`.
   - `entries`: 각 항목에 `kind`와 고유 `id`. id 형식은 `v{major}-{minor}[-{patch}]-{slug}` (예: `v0-2-timeline`, `v0-1-1-ime-fix`).
2. `ko`·`en`·`ja` 메시지의 `updates.entryText`에 **같은 id**로 문구를 추가한다.
3. `package.json`의 `version`을 같은 버전으로 맞춘다(`v` 없이, 3자리).
4. 검증: `npm test`(`core/updates.test.ts` 포함) · `npx tsc --noEmit` · `npm run build`.

새 릴리스가 최신이 되면, 사용자의 `lastSeenReleaseVersion`(localStorage)과 달라져
자동으로 종에 미확인 점이 뜨고, 팝오버를 열면 갱신된다.

## 예시

```ts
// src/core/updates.ts — 맨 앞에 추가
{
  version: "v0.2",
  date: "2026-08-01",
  entries: [
    { id: "v0-2-timeline", kind: "new" },
    { id: "v0-2-card-contrast", kind: "improve" },
  ],
},
```

```ts
// src/locales/messages/ko.ts — updates.entryText 에 추가 (en·ja 도 동일하게)
"v0-2-timeline": "세계관에 연표가 생겨 사건을 시간순으로 정리할 수 있어요.",
"v0-2-card-contrast": "카드 배경색 대비를 다듬어 더 또렷해졌어요.",
```

이후 `package.json`의 `version`을 `0.2.0`으로 변경.
