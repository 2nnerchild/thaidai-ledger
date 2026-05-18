import { formatTransactionTitle } from '../transactions/categories';
import type { Transaction } from '../transactions/types';
import { computeAllQuartersVAT } from '../vat/calculator';

function bom(content: string): string {
  return '\uFEFF' + content;
}

function row(cells: (string | number)[]): string {
  return cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
}

export function exportSaleCSV(txns: Transaction[]): string {
  const sales = txns
    .filter((transaction) => transaction.type === 'sale')
    .sort((a, b) => a.date.localeCompare(b.date));

  const header = row([
    'No.',
    '거래일자',
    '아티스트',
    '곡명',
    '거래처',
    '카테고리',
    '적요',
    '공급가액(원)',
    '부가세율',
    '부가세(원)',
    '입금총액(원)',
  ]);

  const rows = sales.map((transaction, index) =>
    row([
      index + 1,
      transaction.date,
      transaction.artistName ?? '',
      transaction.songTitle ?? '',
      formatTransactionTitle(transaction.party, transaction.artistName),
      transaction.category,
      transaction.memo ?? '',
      transaction.amount,
      `${transaction.vatRate * 100}%`,
      transaction.vatAmount,
      transaction.total,
    ]),
  );

  return bom([header, ...rows].join('\r\n'));
}

export function exportPurchaseCSV(txns: Transaction[]): string {
  const purchases = txns
    .filter((transaction) => transaction.type === 'purchase')
    .sort((a, b) => a.date.localeCompare(b.date));

  const header = row([
    'No.',
    '거래일자',
    '거래처',
    '카테고리',
    '적요',
    '공급가액(원)',
    '부가세율',
    '부가세(원)',
    '불공제',
    '결제총액(원)',
  ]);

  const rows = purchases.map((transaction, index) =>
    row([
      index + 1,
      transaction.date,
      transaction.party,
      transaction.category,
      transaction.memo ?? '',
      transaction.amount,
      `${transaction.vatRate * 100}%`,
      transaction.vatAmount,
      transaction.deduct === 'Y' ? '불공제' : '',
      transaction.total,
    ]),
  );

  return bom([header, ...rows].join('\r\n'));
}

export function exportVATSummaryCSV(txns: Transaction[], year: number): string {
  const quarters = computeAllQuartersVAT(txns, year);
  const header = row(['신고구분', '과세기간', '매출세액(원)', '공제매입세액(원)', '납부세액(원)', '신고기한']);
  const rows = quarters.map((quarter) =>
    row([quarter.quarter, `${year}년`, quarter.salesVAT, quarter.deductibleVAT, quarter.netVAT, quarter.deadline]),
  );

  return bom([header, ...rows].join('\r\n'));
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
