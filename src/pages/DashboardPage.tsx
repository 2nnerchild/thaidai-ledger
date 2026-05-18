import { useMemo } from 'react';
import { KPICard } from '@/components/ui/Card';
import { useTransactionStore, selectByYear } from '@/features/transactions/store';
import { computeAllQuartersVAT } from '@/features/vat/calculator';
import { formatKRW } from '@/lib/format';

interface DashboardPageProps {
  year: number;
}

export function DashboardPage({ year }: DashboardPageProps) {
  const transactions = useTransactionStore((s) => s.transactions);
  const yearTxns = useMemo(() => selectByYear(transactions, year), [transactions, year]);

  const totals = useMemo(() => {
    const sales = yearTxns.filter((t) => t.type === 'sale');
    const purchases = yearTxns.filter((t) => t.type === 'purchase');
    const totalRevenue = sales.reduce((s, t) => s + t.amount, 0);
    const totalExpense = purchases.reduce((s, t) => s + t.amount, 0);
    const netProfit = totalRevenue - totalExpense;
    const vatOwed = computeAllQuartersVAT(yearTxns, year).reduce((s, q) => s + q.netVAT, 0);
    return { totalRevenue, totalExpense, netProfit, vatOwed };
  }, [yearTxns, year]);

  const monthlyData = useMemo(() => {
    const map: Record<number, { revenue: number; expense: number }> = {};
    for (let m = 1; m <= 12; m++) map[m] = { revenue: 0, expense: 0 };
    yearTxns.forEach((t) => {
      const month = Number(t.date.split('-')[1]);
      if (t.type === 'sale') map[month].revenue += t.amount;
      else map[month].expense += t.amount;
    });
    return map;
  }, [yearTxns]);

  const quarters = useMemo(() => computeAllQuartersVAT(yearTxns, year), [yearTxns, year]);

  return (
    <div className="p-4 space-y-6" style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      <h2 className="font-display text-2xl text-black-ink">{year}년 현황</h2>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="총 매출" value={formatKRW(totals.totalRevenue)} accent="blue" />
        <KPICard label="총 매입" value={formatKRW(totals.totalExpense)} accent="orange" />
        <KPICard
          label="순이익"
          value={formatKRW(totals.netProfit)}
          accent={totals.netProfit >= 0 ? 'green' : 'red'}
        />
        <KPICard
          label="납부 부가세"
          value={formatKRW(Math.max(0, totals.vatOwed))}
          sub={totals.vatOwed < 0 ? `환급 ${formatKRW(Math.abs(totals.vatOwed))}` : undefined}
          accent={totals.vatOwed < 0 ? 'green' : 'red'}
        />
      </div>

      {/* 월별 현황 테이블 */}
      <div className="bg-cream border-2 border-walnut-dark shadow-flat overflow-x-auto">
        <div className="bg-deep-blue px-4 py-3 border-b-2 border-walnut-dark">
          <h3 className="font-display text-cream text-base">월별 매출/매입</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-dark border-b-2 border-walnut-dark">
              <th className="font-body text-left px-4 py-2 text-walnut font-medium">월</th>
              <th className="font-mono text-right px-4 py-2 text-walnut font-medium">매출</th>
              <th className="font-mono text-right px-4 py-2 text-walnut font-medium">매입</th>
              <th className="font-mono text-right px-4 py-2 text-walnut font-medium">순익</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthlyData).map(([m, d]) => {
              const net = d.revenue - d.expense;
              return (
                <tr key={m} className="border-b border-cream-dark hover:bg-cream-dark transition-colors">
                  <td className="font-body px-4 py-2 text-black-ink">{m}월</td>
                  <td className="font-mono text-right px-4 py-2 text-deep-blue">{formatKRW(d.revenue)}</td>
                  <td className="font-mono text-right px-4 py-2 text-walnut">{formatKRW(d.expense)}</td>
                  <td className={`font-mono text-right px-4 py-2 font-medium ${net >= 0 ? 'text-green-success' : 'text-red-warn'}`}>
                    {formatKRW(net)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 분기별 부가세 */}
      <div className="bg-cream border-2 border-walnut-dark shadow-flat">
        <div className="bg-burnt-orange px-4 py-3 border-b-2 border-walnut-dark">
          <h3 className="font-display text-white text-base">분기별 부가세</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-2 divide-walnut-dark">
          {quarters.map((q) => (
            <div key={q.quarter} className="p-4">
              <p className="font-body text-xs text-walnut mb-1">{q.quarter}</p>
              <p className={`font-mono text-lg font-medium ${q.netVAT >= 0 ? 'text-red-warn' : 'text-green-success'}`}>
                {formatKRW(q.netVAT)}
              </p>
              <p className="font-mono text-xs text-grey-border mt-1">기한: {q.deadline}</p>
            </div>
          ))}
        </div>
      </div>

      {yearTxns.length === 0 && (
        <div className="text-center py-12 text-grey-border font-body">
          {year}년 거래 내역이 없습니다. 거래입력 탭에서 추가해 주세요.
        </div>
      )}
    </div>
  );
}
