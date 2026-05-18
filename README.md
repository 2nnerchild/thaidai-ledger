# THAIDAI 매입매출 장부

> 한국 개인사업자(일반과세자) 부가세 신고 및 매출/매입/순익 관리 웹 앱

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 테스트
npm test

# 4. 프로덕션 빌드
npm run build
```

## 문서

- **인수인계 명세**: [HANDOFF.md](./HANDOFF.md) ← **반드시 먼저 읽을 것**
- **원본 프로토타입**: [reference/THAIDAI_매입매출장부.html](./reference/THAIDAI_매입매출장부.html)
- **디자인 시스템**: [src/design-system/README.md](./src/design-system/README.md) (Phase 0에서 작성)

## 기술 스택

- Vite + React 18 + TypeScript
- Tailwind CSS + Studio Boran 디자인 토큰
- Zustand (상태) · Dexie.js (IndexedDB) · React Hook Form + Zod (폼)
- Chart.js (시각화) · SheetJS (Excel 내보내기)
- Vitest (테스트)

## 라이선스

THAIDAI 내부 사용
