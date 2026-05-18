import type { Transaction } from '../transactions/types';

export function exportJSON(txns: Transaction[], year?: number): string {
  const data = year ? txns.filter((t) => t.date.startsWith(String(year))) : txns;
  return JSON.stringify(data, null, 2);
}

export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
