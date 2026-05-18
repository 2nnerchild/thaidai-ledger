import * as XLSX from 'xlsx';
import { formatTransactionTitle } from '../transactions/categories';
import type { Transaction } from '../transactions/types';
import { computeAllQuartersVAT } from '../vat/calculator';

function byDateAsc(a: Transaction, b: Transaction): number {
  return a.date.localeCompare(b.date);
}

function toSaleRows(txns: Transaction[]) {
  return txns
    .filter((transaction) => transaction.type === 'sale')
    .sort(byDateAsc)
    .map((transaction, index) => ({
      'No.': index + 1,
      거래일자: transaction.date,
      아티스트: transaction.artistName ?? '',
      곡명: transaction.songTitle ?? '',
      거래처: formatTransactionTitle(transaction.party, transaction.artistName),
      카테고리: transaction.category,
      적요: transaction.memo ?? '',
      '공급가액(원)': transaction.amount,
      부가세율: `${transaction.vatRate * 100}%`,
      '부가세(원)': transaction.vatAmount,
      '입금총액(원)': transaction.total,
    }));
}

function toPurchaseRows(txns: Transaction[]) {
  return txns
    .filter((transaction) => transaction.type === 'purchase')
    .sort(byDateAsc)
    .map((transaction, index) => ({
      'No.': index + 1,
      거래일자: transaction.date,
      거래처: transaction.party,
      카테고리: transaction.category,
      적요: transaction.memo ?? '',
      '공급가액(원)': transaction.amount,
      부가세율: `${transaction.vatRate * 100}%`,
      '부가세(원)': transaction.vatAmount,
      불공제: transaction.deduct === 'Y' ? '불공제' : '',
      '결제총액(원)': transaction.total,
    }));
}

function toVATRows(txns: Transaction[], year: number) {
  return computeAllQuartersVAT(txns, year).map((quarter) => ({
    신고구분: quarter.quarter,
    과세기간: `${year}년`,
    '매출세액(원)': quarter.salesVAT,
    '공제매입세액(원)': quarter.deductibleVAT,
    '납부세액(원)': quarter.netVAT,
    신고기한: quarter.deadline,
  }));
}

function applyColumnWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map((wch) => ({ wch }));
}

export function exportXLSX(txns: Transaction[], year: number): void {
  const workbook = XLSX.utils.book_new();

  const saleRows = toSaleRows(txns);
  const saleSheet = XLSX.utils.json_to_sheet(saleRows);
  applyColumnWidths(saleSheet, [6, 12, 16, 20, 28, 18, 28, 14, 10, 14, 14]);
  XLSX.utils.book_append_sheet(workbook, saleSheet, '매출');

  const purchaseRows = toPurchaseRows(txns);
  const purchaseSheet = XLSX.utils.json_to_sheet(purchaseRows);
  applyColumnWidths(purchaseSheet, [6, 12, 28, 18, 28, 14, 10, 14, 10, 14]);
  XLSX.utils.book_append_sheet(workbook, purchaseSheet, '매입');

  const vatRows = toVATRows(txns, year);
  const vatSheet = XLSX.utils.json_to_sheet(vatRows);
  applyColumnWidths(vatSheet, [12, 12, 16, 18, 16, 14]);
  XLSX.utils.book_append_sheet(workbook, vatSheet, '부가세 요약');

  XLSX.writeFile(workbook, `THAIDAI_매입매출장부_${year}.xlsx`);
}
