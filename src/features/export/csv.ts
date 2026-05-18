import type { Transaction } from '../transactions/types';
import { computeAllQuartersVAT } from '../vat/calculator';
import { formatTransactionTitle } from '../transactions/categories';

function bom(content: string): string {
  return '﻿' + content;
}

function row(cells: (string | number)[]): string {
  return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
}

export function exportSaleCSV(txns: Transaction[]): string {
  const sales = txns
    .filter((t) => t.type === 'sale')
    .sort((a, b) => a.date.localeCompare(b.date));

  const header = row(['No.', '거래일자', '아티스트', '거래처', '카테고리', '적요', '공급가액(₩)', '부가세율', '부가세(₩)', '합계(₩)']);
  const rows = sales.map((t, i) =>
    row([i + 1, t.date, t.artistName ?? '', formatTransactionTitle(t.party, t.artistName), t.category, t.memo ?? '', t.amount, `${t.vatRate * 100}%`, t.vatAmount, t.total]),
  );
  return bom([header, ...rows].join('\r\n'));
}

export function exportPurchaseCSV(txns: Transaction[]): string {
  const purchases = txns
    .filter((t) => t.type === 'purchase')
    .sort((a, b) => a.date.localeCompare(b.date));

  const header = row(['No.', '거래일자', '거래처', '카테고리', '적요', '공급가액(₩)', '부가세율', '부가세(₩)', '불공제', '합계(₩)']);
  const rows = purchases.map((t, i) =>
    row([i + 1, t.date, t.party, t.category, t.memo ?? '', t.amount, `${t.vatRate * 100}%`, t.vatAmount, t.deduct === 'Y' ? '불공제' : '', t.total]),
  );
  return bom([header, ...rows].join('\r\n'));
}

export function exportVATSummaryCSV(txns: Transaction[], year: number): string {
  const quarters = computeAllQuartersVAT(txns, year);
  const header = row(['신고구분', '과세기간', '매출세액(₩)', '공제매입세액(₩)', '납부세액(₩)', '신고기한']);
  const rows = quarters.map((q) =>
    row([q.quarter, `${year}년`, q.salesVAT, q.deductibleVAT, q.netVAT, q.deadline]),
  );
  return bom([header, ...rows].join('\r\n'));
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
