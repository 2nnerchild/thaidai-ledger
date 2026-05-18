import type { Transaction } from '../transactions/types';

export interface QuarterDef {
  name: '1기 예정' | '1기 확정' | '2기 예정' | '2기 확정';
  monthStart: number;
  monthEnd: number;
  deadline: (year: number) => string;
}

export interface QuarterVATResult {
  quarter: QuarterDef['name'];
  salesVAT: number;
  deductibleVAT: number;
  netVAT: number;  // 양수 = 납부, 음수 = 환급
  deadline: string;
}

export const QUARTERS: QuarterDef[] = [
  { name: '1기 예정', monthStart: 1,  monthEnd: 3,  deadline: (y) => `${y}.04.25` },
  { name: '1기 확정', monthStart: 4,  monthEnd: 6,  deadline: (y) => `${y}.07.25` },
  { name: '2기 예정', monthStart: 7,  monthEnd: 9,  deadline: (y) => `${y}.10.25` },
  { name: '2기 확정', monthStart: 10, monthEnd: 12, deadline: (y) => `${y + 1}.01.25` },
];

export function computeQuarterVAT(
  txns: Transaction[],
  year: number,
  qIndex: number,
): QuarterVATResult {
  const q = QUARTERS[qIndex];

  const inRange = (t: Transaction): boolean => {
    const [yy, mm] = t.date.split('-').map(Number);
    return yy === year && mm >= q.monthStart && mm <= q.monthEnd;
  };

  const filtered = txns.filter(inRange);

  const salesVAT = filtered
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + t.vatAmount, 0);

  const deductibleVAT = filtered
    .filter((t) => t.type === 'purchase' && t.deduct !== 'Y')
    .reduce((sum, t) => sum + t.vatAmount, 0);

  return {
    quarter: q.name,
    salesVAT,
    deductibleVAT,
    netVAT: salesVAT - deductibleVAT,
    deadline: q.deadline(year),
  };
}

export function computeAllQuartersVAT(txns: Transaction[], year: number): QuarterVATResult[] {
  return QUARTERS.map((_, i) => computeQuarterVAT(txns, year, i));
}

export function computeYearVAT(txns: Transaction[], year: number) {
  const quarters = computeAllQuartersVAT(txns, year);
  return {
    quarters,
    totalSalesVAT: quarters.reduce((s, q) => s + q.salesVAT, 0),
    totalDeductibleVAT: quarters.reduce((s, q) => s + q.deductibleVAT, 0),
    totalNetVAT: quarters.reduce((s, q) => s + q.netVAT, 0),
  };
}
