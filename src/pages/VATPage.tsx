import { useMemo } from 'react';
import { useTransactionStore, selectByYear } from '@/features/transactions/store';
import { computeAllQuartersVAT } from '@/features/vat/calculator';
import { formatKRW } from '@/lib/format';

interface VATPageProps {
  year: number;
}

export function VATPage({ year }: VATPageProps) {
  const transactions = useTransactionStore((s) => s.transactions);
  const yearTxns = useMemo(() => selectByYear(transactions, year), [transactions, year]);
  const quarters = useMemo(() => computeAllQuartersVAT(yearTxns, year), [yearTxns, year]);

  const totalSalesVAT = quarters.reduce((s, q) => s + q.salesVAT, 0);
  const totalDeductibleVAT = quarters.reduce((s, q) => s + q.deductibleVAT, 0);
  const totalNetVAT = quarters.reduce((s, q) => s + q.netVAT, 0);

  return (
    <div className="p-4 space-y-4" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 className="font-display text-2xl text-black-ink">{year}년 부가세 현황</h2>

      {/* 연간 합계 */}
      <div className="bg-deep-blue border-2 border-walnut-dark shadow-flat p-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-mono text-cream-dark uppercase tracking-widest mb-1">연간 매출세액</p>
          <p className="font-mono text-xl text-cream font-medium">{formatKRW(totalSalesVAT)}</p>
        </div>
        <div>
          <p className="text-xs font-mono text-cream-dark uppercase tracking-widest mb-1">공제 매입세액</p>
          <p className="font-mono text-xl text-cream font-medium">{formatKRW(totalDeductibleVAT)}</p>
        </div>
        <div>
          <p className="text-xs font-mono text-cream-dark uppercase tracking-widest mb-1">
            {totalNetVAT >= 0 ? '납부 세액' : '환급 세액'}
          </p>
          <p className={`font-mono text-xl font-medium ${totalNetVAT >= 0 ? 'text-burnt-orange' : 'text-green-success'}`}>
            {formatKRW(Math.abs(totalNetVAT))}
          </p>
        </div>
      </div>

      {/* 분기별 카드 */}
      <div className="space-y-3">
        {quarters.map((q, i) => {
          const isPay = q.netVAT >= 0;
          return (
            <div key={q.quarter} className="bg-cream border-2 border-walnut-dark shadow-flat">
              {/* 헤더 */}
              <div className={`flex items-center justify-between px-4 py-3 border-b-2 border-walnut-dark ${i % 2 === 0 ? 'bg-burnt-orange' : 'bg-walnut'}`}>
                <span className="font-display text-white text-base">{q.quarter}</span>
                <span className="font-mono text-xs text-cream-dark">신고기한: {q.deadline}</span>
              </div>

              {/* 상세 */}
              <div className="p-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-body text-walnut mb-1">매출세액</p>
                  <p className="font-mono text-base text-deep-blue">{formatKRW(q.salesVAT)}</p>
                </div>
                <div>
                  <p className="text-xs font-body text-walnut mb-1">공제 매입세액</p>
                  <p className="font-mono text-base text-walnut">{formatKRW(q.deductibleVAT)}</p>
                </div>
                <div>
                  <p className="text-xs font-body text-walnut mb-1">
                    {isPay ? '납부세액' : '환급세액'}
                  </p>
                  <p className={`font-mono text-base font-medium ${isPay ? 'text-red-warn' : 'text-green-success'}`}>
                    {formatKRW(Math.abs(q.netVAT))}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs font-body text-grey-border">
        * 매입세액 불공제(deduct=Y) 항목은 공제 매입세액에서 자동 제외됩니다.
        음수 납부세액은 환급 대상입니다.
      </p>
    </div>
  );
}
