# Claude Code 작업 가이드

> 이 파일은 Claude Code가 작업 시작 시 자동으로 읽는 프로젝트 컨텍스트입니다.

## 프로젝트 정체성

**THAIDAI 매입매출 장부**는 박성국(이너차일드)의 한국 개인사업자(일반과세자) 부가세 신고 및 회계 관리 웹 앱입니다. 작곡·프로듀싱 사업체이며, 운영자는 태국 방콕·파타야에 거주하므로 모바일·데스크톱 양쪽에서 완벽히 작동해야 합니다.

## 작업 시작 전 필독

1. **HANDOFF.md**를 정독하세요 (사업 컨텍스트, 기술 스택, 디자인 시스템, 로드맵 전체)
2. **reference/THAIDAI_매입매출장부.html**을 브라우저에서 열어 동작을 확인하세요 (원본 프로토타입)

## 절대 규칙

### 디자인 시스템
- Studio Boran 미드센추리 모던 미학을 **변형하지 마세요**
- 색상 팔레트 고정: Burnt Orange(#C75D2C), Deep Blue(#1F3A5F), Cream(#F5EDDC), Walnut(#5C3A1E)
- `border-radius: 0` (둥근 모서리 금지) ─ sharp rectangular geometry가 시그니처입니다
- Flat offset 박스 섀도우 필수: `4px 4px 0 var(--walnut-dark)`
- 폰트: DM Serif Display(디스플레이) / IBM Plex Sans KR(본문) / JetBrains Mono(숫자)
- 둥근 모서리·그라데이션·glassmorphism·neumorphism 등 일반 AI 미학 절대 금지

### 비즈니스 로직
- 한국 일반과세자 세법 기준 정확히 준수
- 부가세 계산은 **단위 테스트를 먼저 작성한 후** 구현 (TDD)
- 매입세액 불공제(`deduct === 'Y'`) 항목은 공제 매입세액에서 자동 제외
- 영세율 거래는 `vatRate === 0`으로 처리

### 언어 및 톤
- 모든 사용자 대면 텍스트는 **한국어 존댓말**
- 코드 주석은 한국어 또는 영어 (자유)
- 변수명·함수명은 영어
- 카테고리명·UI 라벨은 한국어

### 코드 품질
- TypeScript strict 모드 유지
- ESLint·Prettier 통과 필수
- 각 비즈니스 로직 함수는 단위 테스트 동반
- 컴포넌트는 단일 책임 원칙 ─ 100줄 넘으면 분할 검토

## 작업 진행 방식

1. Phase 0부터 순차적으로 진행 (HANDOFF.md §8 참고)
2. 각 Phase 시작 전 사용자에게 진행 계획 보고 후 승인 받기
3. 구현 결정이 필요한 갈림길에서는 **반드시 사용자에게 질문**
4. 커밋 메시지는 한국어 권장 (예: `feat: 부가세 분기별 계산 로직 추가`)

## 자주 참조할 파일

- 데이터 모델: `src/features/transactions/types.ts`
- 부가세 로직: `src/features/vat/calculator.ts` + `calculator.test.ts`
- 디자인 토큰: `src/design-system/tokens.css`
- 카테고리 정의: `src/features/transactions/categories.ts`

## 막힐 때

- 한국 부가세 세법 의문: 국세청 자료 검색 또는 사용자에게 확인
- 디자인 결정 갈림길: 원본 프로토타입(`reference/THAIDAI_매입매출장부.html`)이 정답
- 라이브러리 선택 고민: HANDOFF.md §3 권장 스택 우선

## 사용자 정보

- 이름: 박성국 (Seongkook Park / 이너차일드)
- 직업: K-pop 작곡가·프로듀서 (MonoTree 소속)
- 거점: 태국 방콕·파타야
- 주요 도구: Cubase, Neve 88M, Neumann TLM 103
- 다른 진행 중인 프로젝트: Studio Boran By THAIDAI (스튜디오), ICEHOT Universe (창작 세계관)
- 시간대: ICT (UTC+7)
