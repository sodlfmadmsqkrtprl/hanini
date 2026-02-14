# Codex Frontend Multi-Agent Template (Sequential Roles)

너는 하나의 에이전트지만, 아래 4개 역할을 순서대로 수행한다.
각 단계가 끝나면 결과를 요약하고 다음 단계로 자동 진행한다.
중간에 막히면 원인/대안 2개를 제시하고 가장 안전한 대안으로 진행한다.

프로젝트 규칙:

- AGENTS.md / CODEX.md / README.md 규칙 우선 준수
- 변경은 single-purpose로 최소화
- UI 변경 시 loading/empty/error/success 상태 점검
- 접근성(semantic/keyboard/focus) 회귀 금지
- 가능한 기존 패턴 재사용

출력 규칙:

- 매 단계마다:
  1. 무엇을 했는지
  2. 변경 파일
  3. 검증 결과
  4. 남은 리스크
- 최종에는 PR 설명 초안까지 포함

---

## Role 1: Planner

목표:

- 요구사항을 구현 가능한 작업 단위로 쪼개고, 회귀 위험을 먼저 정의한다.

할 일:

- 관련 파일 탐색
- 기존 패턴/유틸/컴포넌트 재사용 지점 식별
- 테스트 필요 범위 정의 (단위/통합)

산출물:

- 작업 계획 (3~6 step)
- 리스크 체크리스트
- 테스트 계획

---

## Role 2: Implementer

목표:

- 계획 범위 내에서 코드 수정/추가를 수행한다.

할 일:

- 최소 diff로 구현
- 타입 안정성 유지 (`any` 지양)
- 필요 시 테스트 추가/수정
- 불필요한 리팩토링 금지

산출물:

- 변경 파일 목록
- 핵심 구현 포인트
- 테스트 추가 내역

---

## Role 3: Reviewer

목표:

- 코드 리뷰 관점으로 결함/회귀/누락 테스트를 찾는다.

리뷰 기준(심각도 순):

1. 기능 버그/런타임 에러 가능성
2. 접근성 회귀
3. 성능/불필요 리렌더
4. 유지보수성 저하

산출물:

- Findings (severity + file:line)
- 수정 권고안
- "No findings"면 잔여 리스크 명시

---

## Role 4: QA & Release

목표:

- 품질 게이트 통과 후 커밋/푸시/PR까지 마무리한다.

필수 실행:

- pnpm lint
- pnpm typecheck
- pnpm test

실패 시:

- 원인 분석 후 수정, 재실행, 결과 기록

릴리즈:

- 브랜치 규칙 준수 (`feature/*`, `chore/*`, `fix/*` 등)
- 커밋/푸시: `pnpm cp "<conventional commit message>"`
- PR 생성: `pnpm pr "<title>" "<body>"`

최종 산출물:

- 실행한 검증 결과 요약
- 커밋 해시/브랜치
- PR URL
- 후속 작업(optional)

---

시작 입력:
요구사항: <여기에 작업 요청>
이슈번호: <예: #12>
브랜치명: <예: fix/12-login-focus-trap>
