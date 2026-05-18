import * as XLSX from 'xlsx';
import type { Transaction } from '../transactions/types';
import { computeAllQuartersVAT } from '../vat/calculator';
import { formatTransactionTitle } from '../transactions/categories';

function toSaleRows(txns: Transaction[]) {
  return txns
    .filter((t) => t.type === 'sale')
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t, i) => ({
      'No.': i + 1,
      거래일자: t.date,
      아티스트: t.artistName ?? '',
      거래처: formatTransactionTitle(t.party, t.artistName),
      카테고리: t.category,
      적요: t.memo ?? '',
      '공급가액(₩)': t.amount,
      '부가세율': `${t.vatRate * 100}%`,
      '부가세(₩)': t.vatAmount,
      '합계(₩)': t.total,
    }));
}

function toPurchaseRows(txns: Transaction[]) {
  return txns
    .filter((t) => t.type === 'purchase')
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t, i) => ({
      'No.': i + 1,
      거래일자: t.date,
      거래처: t.party,
      카테고리: t.category,
      적요: t.memo ?? '',
      '공급가액(₩)': t.amount,
      '부가세율': `${t.vatRate * 100}%`,
      '부가세(₩)': t.vatAmount,
      불공제: t.deduct === 'Y' ? '불공제' : '',
      '합계(₩)': t.total,
    }));
}

function toVATRows(txns: Transaction[], year: number) {
  return computeAllQuartersVAT(txns, year).map((q) => ({
    신고구분: q.quarter,
    과세기간: `${year}년`,
    '매출세액(₩)': q.salesVAT,
    '공제매입세액(₩)': q.deductibleVAT,
    '납부세액(₩)': q.netVAT,
    신고기한: q.deadline,
  }));
}

function applyHeaderStyle(ws: XLSX.WorkSheet, cols: number) {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let c = 0; c <= cols - 1; c++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[cell]) continue;
    ws[cell].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1F3A5F' } },
      alignment: { horizontal: 'center' },
    };
  }
  return range;
}

export function exportXLSX(txns: Transaction[], year: number): void {
  const wb = XLSX.utils.book_new();

  // 매출 시트
  const saleRows = toSaleRows(txns);
  const wsSale = XLSX.utils.json_to_sheet(saleRows);
  applyHeaderStyle(wsSale, Object.keys(saleRows[0] ?? {}).length);
  XLSX.utils.book_append_sheet(wb, wsSale, '매출');

  // 매입 시트
  const purchaseRows = toPurchaseRows(txns);
  const wsPurchase = XLSX.utils.json_to_sheet(purchaseRows);
  applyHeaderStyle(wsPurchase, Object.keys(purchaseRows[0] ?? {}).length);
  XLSX.utils.book_append_sheet(wb, wsPurchase, '매입');

  // 부가세 요약 시트
  const vatRows = toVATRows(txns, year);
  const wsVAT = XLSX.utils.json_to_sheet(vatRows);
  applyHeaderStyle(wsVAT, Object.keys(vatRows[0] ?? {}).length);
  XLSX.utils.book_append_sheet(wb, wsVAT, '부가세요약');

  XLSX.writeFile(wb, `THAIDAI_매입매출장부_${year}.xlsx`);
}
