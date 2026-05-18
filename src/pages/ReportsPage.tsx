import { useMemo } from 'react';
import { useTransactionStore, selectByYear } from '@/features/transactions/store';
import { formatKRW } from '@/lib/format';
import type { Transaction } from '@/features/transactions/types';

interface ReportsPageProps {
  year: number;
}

function groupByCategory(txns: Transaction[], type: 'sale' | 'purchase') {
  const map: Record<string, { amount: number; vatAmount: number; count: number }> = {};
  txns.filter((t) => t.type === type).forEach((t) => {
    if (!map[t.category]) map[t.category] = { amount: 0, vatAmount: 0, count: 0 };
    map[t.category].amount += t.amount;
    map[t.category].vatAmount += t.vatAmount;
    map[t.category].count++;
  });
  return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount);
}

export function ReportsPage({ year }: ReportsPageProps) {
  const transactions = useTransactionStore((s) => s.transactions);
  const yearTxns = useMemo(() => selectByYear(transactions, year), [transactions, year]);

  const saleByCategory = useMemo(() => groupByCategory(yearTxns, 'sale'), [yearTxns]);
  const purchaseByCategory = useMemo(() => groupByCategory(yearTxns, 'purchase'), [yearTxns]);

  const quarterlyData = useMemo(() => {
    const quarters = [
      { name: '1분기(1~3월)', months: [1, 2, 3] },
      { name: '2분기(4~6월)', months: [4, 5, 6] },
      { name: '3분기(7~9월)', months: [7, 8, 9] },
      { name: '4분기(10~12월)', months: [10, 11, 12] },
    ];
    return quarters.map(({ name, months }) => {
      const qTxns = yearTxns.filter((t) => months.includes(Number(t.date.split('-')[1])));
      const revenue = qTxns.filter((t) => t.type === 'sale').reduce((s, t) => s + t.amount, 0);
      const expense = qTxns.filter((t) => t.type === 'purchase').reduce((s, t) => s + t.amount, 0);
      return { name, revenue, expense, net: revenue - expense, count: qTxns.length };
    });
  }, [yearTxns]);

  return (
    <div className="p-4 space-y-6" style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      <h2 className="font-display text-2xl text-black-ink">{year}년 리포트</h2>

      {/* 분기별 요약 */}
      <div className="bg-cream border-2 border-walnut-dark shadow-flat">
        <div className="bg-deep-blue px-4 py-3 border-b-2 border-walnut-dark">
          <h3 className="font-display text-cream text-base">분기별 요약</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark border-b-2 border-walnut-dark">
                <th className="font-body text-left px-4 py-2 text-walnut">분기</th>
                <th className="font-mono text-right px-4 py-2 text-walnut">매출</th>
                <th className="font-mono text-right px-4 py-2 text-walnut">매입</th>
                <th className="font-mono text-right px-4 py-2 text-walnut">순익</th>
                <th className="font-mono text-right px-4 py-2 text-walnut">건수</th>
              </tr>
            </thead>
            <tbody>
              {quarterlyData.map((q) => (
                <tr key={q.name} className="border-b border-cream-dark hover:bg-cream-dark">
                  <td className="font-body px-4 py-2 text-black-ink">{q.name}</td>
                  <td className="font-mono text-right px-4 py-2 text-deep-blue">{formatKRW(q.revenue)}</td>
                  <td className="font-mono text-right px-4 py-2 text-walnut">{formatKRW(q.expense)}</td>
                  <td className={`font-mono text-right px-4 py-2 font-medium ${q.net >= 0 ? 'text-green-success' : 'text-red-warn'}`}>
                    {formatKRW(q.net)}
                  </td>
                  <td className="font-mono text-right px-4 py-2 text-grey-border">{q.count}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 매출 카테고리별 */}
      <div className="bg-cream border-2 border-walnut-dark shadow-flat">
        <div className="bg-deep-blue px-4 py-3 border-b-2 border-walnut-dark">
          <h3 className="font-display text-cream text-base">매출 카테고리별</h3>
        </div>
        <CategoryTable rows={saleByCategory} color="text-deep-blue" />
      </div>

      {/* 매입 카테고리별 */}
      <div className="bg-cream border-2 border-walnut-dark shadow-flat">
        <div className="bg-walnut px-4 py-3 border-b-2 border-walnut-dark">
          <h3 className="font-display text-cream text-base">매입 카테고리별</h3>
        </div>
        <CategoryTable rows={purchaseByCategory} color="text-walnut" />
      </div>
    </div>
  );
}

function CategoryTable({
  rows,
  color,
}: {
  rows: [string, { amount: number; vatAmount: number; count: number }][];
  color: string;
}) {
  if (rows.length === 0) {
    return <p className="text-center py-8 text-grey-border font-body text-sm">데이터가 없습니다.</p>;
  }
  const total = rows.reduce((s, [, d]) => s + d.amount, 0);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-cream-dark border-b-2 border-walnut-dark">
            <th className="font-body text-left px-4 py-2 text-walnut">카테고리</th>
            <th className="font-mono text-right px-4 py-2 text-walnut">공급가액</th>
            <th className="font-mono text-right px-4 py-2 text-walnut hidden sm:table-cell">부가세</th>
            <th className="font-mono text-right px-4 py-2 text-walnut hidden sm:table-cell">건수</th>
            <th className="font-mono text-right px-4 py-2 text-walnut">비율</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([cat, d]) => (
            <tr key={cat} className="border-b border-cream-dark hover:bg-cream-dark">
              <td className="font-body px-4 py-2 text-black-ink">{cat}</td>
              <td className={`font-mono text-right px-4 py-2 font-medium ${color}`}>{formatKRW(d.amount)}</td>
              <td className="font-mono text-right px-4 py-2 text-grey-border hidden sm:table-cell">{formatKRW(d.vatAmount)}</td>
              <td className="font-mono text-right px-4 py-2 text-grey-border hidden sm:table-cell">{d.count}건</td>
              <td className="font-mono text-right px-4 py-2 text-grey-border">
                {total > 0 ? ((d.amount / total) * 100).toFixed(1) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
