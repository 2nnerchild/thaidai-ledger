# THAIDAI 매입매출 장부 ─ 인수인계 문서

> **목적**: Claude.ai에서 프로토타입(`THAIDAI_매입매출장부.html`)을 제작하였고, 이를 Claude Code 환경에서 프로덕션급 웹 앱으로 이관·확장하기 위한 인수인계 문서입니다.

---

## 1. 프로젝트 개요

### 1.1 사업체 정보
- **상호**: THAIDAI
- **대표**: 박성국 (Seongkook Park / 이너차일드)
- **사업자 유형**: 한국 개인사업자 (일반과세자, VAT 10%)
- **업종**: 음악 창작 / 작곡·프로듀싱
- **운영 거점**: 태국 방콕·파타야 (실거주), 한국 (사업자 등록지)

### 1.2 앱 목적
한국 개인사업자 부가세 신고 및 매출/매입/순익 관리. 방콕↔파타야 이동이 많은 라이프스타일 특성상 **모바일·데스크톱 양쪽에서 동일하게 사용 가능한 웹 앱**이 필수.

### 1.3 핵심 사용 시나리오
1. 거래 발생 즉시 모바일에서 입력 (작곡료 입금, 장비 구입 등)
2. 분기말마다 부가세 납부 금액 확인 (1·4·7·10월)
3. 연 2회(7월·다음해 1월) 정기 신고 시 세무대리인에게 CSV 전달
4. 월별·분기별 순익 추이 확인 (재계약·투자 판단용)

---

## 2. 현재 상태

### 2.1 완료된 산출물
- ✅ **단일 HTML 프로토타입** (`THAIDAI_매입매출장부.html`)
  - 모든 기능이 vanilla JS + Chart.js로 동작
  - 데이터는 `localStorage`에 저장
  - Studio Boran 디자인 시스템 완전 적용
  - 6개 탭(대시보드/입력/내역/부가세/리포트/내보내기) 구현

### 2.2 알려진 한계 (Claude Code에서 개선 대상)
1. **단일 기기 락인**: localStorage라 다른 기기에서 데이터 공유 불가
2. **단일 파일 구조**: 1,200줄짜리 HTML, 유지보수 비효율
3. **타입 안전성 부재**: TypeScript 미적용
4. **테스트 부재**: 부가세 계산 로직 검증 테스트 없음
5. **이미지 첨부 불가**: 영수증 사진 등 첨부 컬럼 없음
6. **통화 단일**: KRW만 지원 (THB/USD 거래 수기 환산 필요)
7. **외부 백업 부재**: JSON 수기 다운로드만 가능

---

## 3. Claude Code 이관 시 권장 기술 스택

### 3.1 프론트엔드
```
- Vite + React 18 + TypeScript
- 스타일링: Tailwind CSS + CSS Variables (디자인 시스템 토큰)
- 차트: Chart.js (기존 코드 재활용) 또는 Recharts
- 폼: React Hook Form + Zod (검증)
- 상태관리: Zustand (간단하고 가벼움)
- 폰트: DM Serif Display + IBM Plex Sans KR + JetBrains Mono
```

### 3.2 데이터 레이어 (3단계 마이그레이션 권장)

**Phase 1 ─ IndexedDB (오프라인 우선)**
- `Dexie.js` 사용
- 단일 기기에서 1만 건 이상 거래도 빠르게 처리
- 기존 localStorage에서 마이그레이션 스크립트 작성

**Phase 2 ─ Supabase 동기화 (멀티 기기)**
- 무료 티어로 충분 (500MB DB, 50,000 MAU)
- Row Level Security로 본인 데이터만 접근
- Realtime 구독으로 폰↔맥 즉시 동기화

**Phase 3 ─ Self-hosted 백엔드 (선택사항)**
- Fastify + PostgreSQL + Prisma
- 다른 사업체로 확장 시 또는 데이터 주권 우선 시

### 3.3 배포
```
권장: Vercel (자동 HTTPS, 한국 PoP, 무료)
대안: Cloudflare Pages, Netlify
도메인: ledger.thaidai.com (THAIDAI 메인 도메인 서브) 또는 별도
```

---

## 4. 권장 디렉토리 구조

```
thaidai-ledger/
├── README.md
├── HANDOFF.md                          ← 이 문서
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── .env.example
├── public/
│   ├── favicon.svg                     ← 돌핀 심볼
│   └── og-image.png
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── design-system/
│   │   ├── tokens.css                  ← Studio Boran CSS 변수
│   │   ├── typography.css
│   │   └── README.md                   ← 디자인 시스템 가이드
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── TabNav.tsx
│   │   │   └── DolphinLogo.tsx         ← SVG 돌핀 컴포넌트
│   │   ├── ui/                         ← 재사용 UI
│   │   │   ├── Card.tsx                ← flat offset shadow 카드
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Tag.tsx
│   │   │   └── Toast.tsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── MonthlyChart.tsx
│   │   │   ├── CategoryChart.tsx
│   │   │   └── CumulativeChart.tsx
│   │   ├── entry/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TypeToggle.tsx
│   │   │   └── VATPreview.tsx
│   │   ├── list/
│   │   │   ├── TransactionTable.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── TransactionRow.tsx
│   │   ├── vat/
│   │   │   └── QuarterCard.tsx
│   │   └── reports/
│   │       ├── MonthlyTable.tsx
│   │       ├── QuarterlyTable.tsx
│   │       └── CategoryBreakdown.tsx
│   ├── features/
│   │   ├── transactions/
│   │   │   ├── store.ts                ← Zustand store
│   │   │   ├── types.ts
│   │   │   └── schema.ts               ← Zod 스키마
│   │   ├── vat/
│   │   │   ├── calculator.ts           ← 부가세 계산 로직
│   │   │   └── calculator.test.ts      ← 단위 테스트
│   │   └── export/
│   │       ├── csv.ts
│   │       ├── json.ts
│   │       └── xlsx.ts                 ← SheetJS로 실제 Excel 출력
│   ├── lib/
│   │   ├── db.ts                       ← Dexie 인스턴스
│   │   ├── supabase.ts                 ← (Phase 2)
│   │   ├── currency.ts                 ← 환율 변환
│   │   └── format.ts                   ← KRW 포맷, 날짜 등
│   ├── pages/                          ← 라우팅 시
│   │   ├── DashboardPage.tsx
│   │   ├── EntryPage.tsx
│   │   ├── ListPage.tsx
│   │   ├── VATPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── ExportPage.tsx
│   └── i18n/                           ← 한·태·영 다국어 (선택)
│       ├── ko.json
│       ├── th.json
│       └── en.json
├── reference/
│   └── THAIDAI_매입매출장부.html       ← 원본 프로토타입 (참고용)
└── tests/
    ├── vat-calculator.test.ts
    └── csv-export.test.ts
```

---

## 5. 디자인 시스템 ─ Studio Boran

### 5.1 색상 토큰
```css
:root {
  /* Primary palette */
  --burnt-orange:      #C75D2C;
  --burnt-orange-dark: #A04820;
  --deep-blue:         #1F3A5F;
  --deep-blue-dark:    #142640;
  --cream:             #F5EDDC;
  --cream-light:       #FAF5E9;
  --cream-dark:        #E8DFC8;
  --walnut:            #5C3A1E;
  --walnut-dark:       #3E2613;

  /* Functional */
  --grey-border:       #8B7E6A;
  --black-ink:         #1A1410;
  --red-warn:          #B23A2A;
  --green-success:     #4A6B3A;
  --white:             #FFFFFF;
}
```

### 5.2 타이포그래피
```css
--font-display: 'DM Serif Display', 'IBM Plex Sans KR', serif;
--font-body:    'IBM Plex Sans KR', sans-serif;
--font-mono:    'JetBrains Mono', monospace;
```

용도:
- **DM Serif Display**: 브랜드명, 패널 타이틀, KPI 값, 카드 타이틀 (편집 디자인 느낌)
- **IBM Plex Sans KR**: 본문, 폼 라벨, 메뉴 (한글·영문 균형)
- **JetBrains Mono**: 숫자(통화), 메타 정보, 라벨 (회계 정밀도)

### 5.3 시그니처 요소
```css
/* 1. Flat offset box shadow ─ 미드센추리 모던 핵심 */
--shadow-flat:    4px 4px 0 var(--walnut-dark);
--shadow-flat-sm: 3px 3px 0 var(--walnut-dark);

/* 2. Sharp rectangular borders ─ 둥근 모서리 절대 금지 */
border-radius: 0;
border: 2px solid var(--walnut-dark);

/* 3. Hover 인터랙션: 그림자 살짝 깊어지고 카드가 들리는 효과 */
.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--walnut-dark);
}
```

### 5.4 돌핀 심볼
프로토타입 HTML의 `<svg class="dolphin">` 코드를 그대로 `DolphinLogo.tsx`로 컴포넌트화. 크기 prop 받도록 처리.

---

## 6. 핵심 비즈니스 로직 명세

### 6.1 거래(Transaction) 데이터 모델
```typescript
// src/features/transactions/types.ts
export type TransactionType = 'sale' | 'purchase';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;              // ISO 'YYYY-MM-DD'
  party: string;             // 거래처
  category: string;
  amount: number;            // 공급가액 (KRW)
  vatRate: number;           // 0 or 0.1
  vatAmount: number;         // amount * vatRate
  total: number;             // amount + vatAmount
  memo?: string;
  deduct: 'Y' | 'N';         // 매입세액 불공제 여부 (매입만 의미)
  currency?: 'KRW' | 'THB' | 'USD';  // 선택: 원화 자동 환산용
  originalAmount?: number;   // 선택: 원화 환산 전 금액
  receiptUrl?: string;       // 선택: 영수증 사진 URL
  createdAt: string;
  updatedAt: string;
}
```

### 6.2 카테고리 정의
```typescript
// 매출 (10개)
const SALE_CATEGORIES = [
  '작곡료', '프로듀싱료', '저작권료(KOMCA)', '저작권료(해외)',
  '실연료', 'MR/스템 판매', '강의/컨설팅',
  'Brain Bounce 협업', 'Studio Boran 대관', '기타 매출'
];

// 매입 (12개)
const PURCHASE_CATEGORIES = [
  '장비/하드웨어', '소프트웨어/플러그인', '스튜디오 임대',
  '외주 작업비', '샘플/라이선스', '출장/교통비',
  '회의/접대비', '통신/구독', '세무/회계',
  '마케팅/홍보', '도서/교육', '기타 매입'
];
```

### 6.3 부가세 계산 로직 (한국 일반과세자)
```typescript
// src/features/vat/calculator.ts

export interface QuarterDef {
  name: '1기 예정' | '1기 확정' | '2기 예정' | '2기 확정';
  monthStart: number;  // 1~12
  monthEnd: number;
  deadline: (year: number) => string;
}

export const QUARTERS: QuarterDef[] = [
  { name: '1기 예정', monthStart: 1,  monthEnd: 3,  deadline: y => `${y}.04.25` },
  { name: '1기 확정', monthStart: 4,  monthEnd: 6,  deadline: y => `${y}.07.25` },
  { name: '2기 예정', monthStart: 7,  monthEnd: 9,  deadline: y => `${y}.10.25` },
  { name: '2기 확정', monthStart: 10, monthEnd: 12, deadline: y => `${y+1}.01.25` },
];

export function computeQuarterVAT(txns: Transaction[], year: number, qIndex: number) {
  const q = QUARTERS[qIndex];
  const inRange = (t: Transaction) => {
    const [yy, mm] = t.date.split('-').map(Number);
    return yy === year && mm >= q.monthStart && mm <= q.monthEnd;
  };
  const filtered = txns.filter(inRange);

  const salesVAT = filtered
    .filter(t => t.type === 'sale')
    .reduce((s, t) => s + t.vatAmount, 0);

  const deductibleVAT = filtered
    .filter(t => t.type === 'purchase' && t.deduct !== 'Y')
    .reduce((s, t) => s + t.vatAmount, 0);

  return {
    quarter: q.name,
    salesVAT,
    deductibleVAT,
    netVAT: salesVAT - deductibleVAT,  // 양수면 납부, 음수면 환급
    deadline: q.deadline(year),
  };
}
```

**중요 규칙**:
- 매입세액 불공제(`deduct === 'Y'`) 항목은 공제 매입세액에서 자동 제외
- 영세율 매출은 `vatRate === 0`으로 입력 (수출, 면세 등)
- 음수 납부세액 = 환급 받을 금액 (UI에서 다른 색상으로 표시)

### 6.4 통화 변환 (확장 기능)
```typescript
// src/lib/currency.ts
// 태국 거주자라 THB·USD 거래가 자주 발생
// ExchangeRate API (https://exchangerate.host) 무료 사용 가능

export async function convertToKRW(
  amount: number,
  fromCurrency: 'THB' | 'USD',
  date: string
): Promise<number> {
  // 거래일 기준 환율로 환산 (세무상 정확성)
  const res = await fetch(
    `https://api.exchangerate.host/${date}?base=${fromCurrency}&symbols=KRW`
  );
  const data = await res.json();
  return amount * data.rates.KRW;
}
```

---

## 7. CSV 내보내기 사양 (세무대리인 표준)

### 7.1 매출 CSV
```
헤더: No.,거래일자,거래처,카테고리,적요,공급가액(₩),부가세율,부가세(₩),합계(₩)
인코딩: UTF-8 with BOM (한글 깨짐 방지)
파일명: THAIDAI_매출장부_{year}.csv
정렬: 거래일자 오름차순
```

### 7.2 매입 CSV
```
헤더: No.,거래일자,거래처,카테고리,적요,공급가액(₩),부가세율,부가세(₩),불공제,합계(₩)
파일명: THAIDAI_매입장부_{year}.csv
```

### 7.3 부가세 요약 CSV
```
헤더: 신고구분,과세기간,매출세액(₩),공제매입세액(₩),납부세액(₩),신고기한
파일명: THAIDAI_부가세요약_{year}.csv
```

### 7.4 Excel 출력 (SheetJS, Phase 1.5)
세무대리인이 Excel을 더 선호하면 `xlsx` 라이브러리로 다중 시트 워크북 생성. 기존 `THAIDAI_매입매출장부_2026.xlsx` 파일 구조 참조.

---

## 8. 우선순위별 로드맵

### Phase 0 ─ 이관 및 정비 (1~2일)
- [ ] Vite + React + TypeScript 프로젝트 초기화
- [ ] 디자인 시스템 토큰화 (`tokens.css`)
- [ ] 프로토타입 HTML을 컴포넌트로 분해
- [ ] Zustand 스토어 구성 (`transactions` 슬라이스)
- [ ] localStorage → IndexedDB(Dexie) 마이그레이션
- [ ] 부가세 계산 로직 단위 테스트 작성 (`vitest`)

### Phase 1 ─ 핵심 기능 완성 (3~5일)
- [ ] React Hook Form + Zod로 폼 검증 강화
- [ ] 모바일 폼 UX 개선 (큰 터치 타겟, 숫자 키패드)
- [ ] PWA 설정 (오프라인 사용 + 홈 화면 추가)
- [ ] SheetJS로 실제 Excel(.xlsx) 내보내기 추가
- [ ] 영수증 이미지 첨부 (Base64 또는 Supabase Storage)

### Phase 2 ─ 멀티 디바이스 동기화 (2~3일)
- [ ] Supabase 프로젝트 생성 및 스키마 설계
- [ ] Magic Link 인증 (이메일만)
- [ ] IndexedDB ↔ Supabase 양방향 동기화
- [ ] Realtime 구독으로 폰↔맥 즉시 반영

### Phase 3 ─ 고급 기능 (선택)
- [ ] THB/USD 거래 자동 환산 (ExchangeRate API)
- [ ] 종합소득세 추정 모듈
- [ ] 연도 간 비교 차트 (전년 동월 대비)
- [ ] AI 카테고리 자동 분류 (Claude API)
- [ ] 영수증 OCR (거래처/금액 자동 추출)

---

## 9. Claude Code 시작 프롬프트 (복붙용)

```
이 디렉토리(`reference/THAIDAI_매입매출장부.html`)에 단일 HTML 프로토타입이 있어. 
HANDOFF.md 문서의 사양에 따라 React + Vite + TypeScript 프로젝트로 이관해줘.

작업 순서:
1. HANDOFF.md를 정독해서 사업 컨텍스트와 디자인 시스템을 파악할 것
2. Phase 0 항목을 순차적으로 진행할 것
3. 디자인 시스템(Studio Boran ─ 미드센추리 모던, Burnt Orange/Deep Blue/Cream/Walnut, 
   flat offset 박스 섀도우, sharp rectangular borders)을 절대 변형하지 말 것
4. 부가세 계산 로직은 단위 테스트를 먼저 작성하고 구현할 것 (TDD)
5. 한국 일반과세자 세법 기준을 정확히 지킬 것
6. 모든 사용자 대면 텍스트는 한국어 존댓말 유지

작업 중 결정이 필요한 부분은 진행 전에 확인 요청 바람.
```

---

## 10. 참고 자료

### 10.1 한국 부가세 신고 관련
- 홈택스: https://hometax.go.kr
- 국세청 부가가치세 안내: https://www.nts.go.kr
- 일반과세자 신고 일정:
  - 1기 확정: 7월 25일 (1~6월분)
  - 2기 확정: 다음해 1월 25일 (7~12월분)
  - 예정고지: 4월·10월 (직전 과세기간 납부세액의 50%)

### 10.2 디자인 레퍼런스
- 미드센추리 모던 그래픽 디자인: Paul Rand, Saul Bass, Alvin Lustig
- 색상 무드보드는 `Studio_Boran_Design_System.md` 참고 (기존 자료)

### 10.3 외부 라이브러리 (사용 권장)
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
- Dexie.js: https://dexie.org
- Supabase: https://supabase.com
- Chart.js: https://www.chartjs.org
- SheetJS: https://sheetjs.com
- date-fns: https://date-fns.org (date-fns/locale/ko 포함)

---

## 11. 연락 및 컨텍스트

작성자: 이너차일드 (박성국)
이 문서는 Claude.ai에서 작성됨, Claude Code에서 이어 작업 예정
파일 위치 권장: 프로젝트 루트의 `HANDOFF.md`
프로토타입 원본: `reference/THAIDAI_매입매출장부.html` 위치에 보관

문서 버전: 1.0 (2026-05-18)
