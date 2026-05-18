import { describe, it, expect } from 'vitest';
import { computeQuarterVAT, QUARTERS } from './calculator';
import type { Transaction } from '../transactions/types';

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'test-id',
    type: 'sale',
    date: '2026-01-15',
    party: '테스트 거래처',
    category: '작곡료',
    amount: 1_000_000,
    vatRate: 0.1,
    vatAmount: 100_000,
    total: 1_100_000,
    deduct: 'N',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    ...overrides,
  };
}

describe('QUARTERS 정의', () => {
  it('4개 분기가 정의되어 있어야 한다', () => {
    expect(QUARTERS).toHaveLength(4);
  });

  it('1기 예정은 1~3월이다', () => {
    expect(QUARTERS[0].name).toBe('1기 예정');
    expect(QUARTERS[0].monthStart).toBe(1);
    expect(QUARTERS[0].monthEnd).toBe(3);
  });

  it('2기 확정 신고기한은 다음 해 1월 25일이다', () => {
    expect(QUARTERS[3].deadline(2026)).toBe('2027.01.25');
  });

  it('각 분기 신고기한이 올바르다', () => {
    expect(QUARTERS[0].deadline(2026)).toBe('2026.04.25');
    expect(QUARTERS[1].deadline(2026)).toBe('2026.07.25');
    expect(QUARTERS[2].deadline(2026)).toBe('2026.10.25');
    expect(QUARTERS[3].deadline(2026)).toBe('2027.01.25');
  });
});

describe('computeQuarterVAT — 기본 매출세액', () => {
  it('해당 분기 매출세액만 합산한다', () => {
    const txns = [
      makeTx({ date: '2026-01-10', vatAmount: 100_000 }), // 1기 예정
      makeTx({ date: '2026-04-10', vatAmount: 200_000 }), // 1기 확정
    ];
    const result = computeQuarterVAT(txns, 2026, 0);
    expect(result.salesVAT).toBe(100_000);
  });

  it('다른 연도 거래는 포함하지 않는다', () => {
    const txns = [
      makeTx({ date: '2025-01-10', vatAmount: 99_000 }),
      makeTx({ date: '2026-01-10', vatAmount: 100_000 }),
    ];
    const result = computeQuarterVAT(txns, 2026, 0);
    expect(result.salesVAT).toBe(100_000);
  });

  it('영세율(vatRate=0) 매출은 매출세액에 0을 기여한다', () => {
    const txns = [
      makeTx({ date: '2026-02-01', vatRate: 0, vatAmount: 0, total: 1_000_000 }),
    ];
    const result = computeQuarterVAT(txns, 2026, 0);
    expect(result.salesVAT).toBe(0);
  });
});

describe('computeQuarterVAT — 공제 매입세액', () => {
  it('deduct=N 매입만 공제 매입세액에 포함된다', () => {
    const txns = [
      makeTx({ type: 'purchase', date: '2026-01-20', vatAmount: 50_000, deduct: 'N' }),
      makeTx({ type: 'purchase', date: '2026-01-20', vatAmount: 30_000, deduct: 'Y' }), // 불공제
    ];
    const result = computeQuarterVAT(txns, 2026, 0);
    expect(result.deductibleVAT).toBe(50_000);
  });

  it('deduct=Y 항목은 공제에서 완전히 제외된다', () => {
    const txns = [
      makeTx({ type: 'purchase', date: '2026-02-10', vatAmount: 80_000, deduct: 'Y' }),
    ];
    const result = computeQuarterVAT(txns, 2026, 0);
    expect(result.deductibleVAT).toBe(0);
  });
});

describe('computeQuarterVAT — 납부세액 계산', () => {
  it('납부세액 = 매출세액 - 공제 매입세액', () => {
    const txns = [
      makeTx({ type: 'sale',     date: '2026-03-01', vatAmount: 500_000 }),
      makeTx({ type: 'purchase', date: '2026-03-15', vatAmount: 200_000, deduct: 'N' }),
    ];
    const result = computeQuarterVAT(txns, 2026, 0);
    expect(result.netVAT).toBe(300_000);
  });

  it('매입세액이 매출세액을 초과하면 납부세액이 음수(환급)다', () => {
    const txns = [
      makeTx({ type: 'sale',     date: '2026-01-05', vatAmount: 100_000 }),
      makeTx({ type: 'purchase', date: '2026-01-10', vatAmount: 300_000, deduct: 'N' }),
    ];
    const result = computeQuarterVAT(txns, 2026, 0);
    expect(result.netVAT).toBe(-200_000);
  });

  it('거래가 없으면 모두 0이다', () => {
    const result = computeQuarterVAT([], 2026, 0);
    expect(result.salesVAT).toBe(0);
    expect(result.deductibleVAT).toBe(0);
    expect(result.netVAT).toBe(0);
  });

  it('반환값에 분기명과 신고기한이 포함된다', () => {
    const result = computeQuarterVAT([], 2026, 1);
    expect(result.quarter).toBe('1기 확정');
    expect(result.deadline).toBe('2026.07.25');
  });
});
