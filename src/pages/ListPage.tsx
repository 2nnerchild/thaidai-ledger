import { useState, useMemo } from 'react';
import { useTransactionStore } from '@/features/transactions/store';
import { Tag } from '@/components/ui/Tag';
import { useToast } from '@/components/ui/Toast';
import { formatKRW, formatDate } from '@/lib/format';
import type { TransactionType } from '@/features/transactions/types';

interface ListPageProps {
  year: number;
}

export function ListPage({ year }: ListPageProps) {
  const { transactions, remove } = useTransactionStore();
  const { showToast } = useToast();

  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterMonth, setFilterMonth] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(String(year)))
      .filter((t) => filterType === 'all' || t.type === filterType)
      .filter((t) => filterMonth === 'all' || Number(t.date.split('-')[1]) === filterMonth)
      .filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          t.party.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.memo ?? '').toLowerCase().includes(q) ||
          (t.artistName ?? '').toLowerCase().includes(q)
        );
      });
  }, [transactions, year, filterType, filterMonth, search]);

  const handleDelete = async (id: string, party: string) => {
    if (!confirm(`"${party}" 거래를 삭제하시겠습니까?`)) return;
    await remove(id);
    showToast('거래가 삭제되었습니다.', 'info');
  };

  return (
    <div className="p-4" style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      <h2 className="font-display text-2xl text-black-ink mb-4">{year}년 거래 내역</h2>

      {/* 필터 바 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* 유형 필터 */}
        <div className="flex border-2 border-walnut-dark">
          {(['all', 'sale', 'purchase'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-sm font-body cursor-pointer transition-colors ${
                filterType === t ? 'bg-burnt-orange text-white' : 'bg-cream text-walnut hover:bg-cream-dark'
              }`}
            >
              {t === 'all' ? '전체' : t === 'sale' ? '매출' : '매입'}
            </button>
          ))}
        </div>

        {/* 월 필터 */}
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="border-2 border-walnut-dark bg-cream px-3 py-1.5 text-sm font-body cursor-pointer focus:outline-none focus:border-burnt-orange"
        >
          <option value="all">전체 월</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>

        {/* 검색 */}
        <input
          type="text"
          placeholder="거래처·카테고리·적요 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-2 border-walnut-dark bg-white px-3 py-1.5 text-sm font-body flex-1 min-w-[180px] focus:outline-none focus:border-burnt-orange"
        />
      </div>

      <p className="text-xs font-mono text-grey-border mb-2">{filtered.length}건</p>

      {/* 거래 목록 */}
      <div className="border-2 border-walnut-dark overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-deep-blue text-cream border-b-2 border-walnut-dark">
              <th className="font-body text-left px-3 py-2 font-medium">날짜</th>
              <th className="font-body text-left px-3 py-2 font-medium">거래처</th>
              <th className="font-body text-left px-3 py-2 font-medium hidden sm:table-cell">카테고리</th>
              <th className="font-mono text-right px-3 py-2 font-medium">공급가액</th>
              <th className="font-mono text-right px-3 py-2 font-medium hidden md:table-cell">부가세</th>
              <th className="font-body text-center px-3 py-2 font-medium hidden lg:table-cell">구분</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-grey-border font-body">
                  해당 조건의 거래 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-cream-dark hover:bg-cream-dark transition-colors">
                  <td className="font-mono px-3 py-2 text-black-ink whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="font-body px-3 py-2 text-black-ink">
                    {t.artistName && (
                      <span className="font-mono text-burnt-orange text-xs mr-1">[{t.artistName}]</span>
                    )}
                    {t.party}
                  </td>
                  <td className="font-body px-3 py-2 text-grey-border hidden sm:table-cell">{t.category}</td>
                  <td className={`font-mono text-right px-3 py-2 font-medium ${t.type === 'sale' ? 'text-deep-blue' : 'text-walnut'}`}>
                    {formatKRW(t.amount)}
                  </td>
                  <td className="font-mono text-right px-3 py-2 text-grey-border hidden md:table-cell">
                    {formatKRW(t.vatAmount)}
                  </td>
                  <td className="text-center px-3 py-2 hidden lg:table-cell">
                    <Tag
                      label={t.type === 'sale' ? '매출' : t.deduct === 'Y' ? '불공제' : '매입'}
                      variant={t.type === 'sale' ? 'sale' : t.deduct === 'Y' ? 'deduct' : 'purchase'}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(t.id, t.party)}
                      className="text-xs text-red-warn hover:underline font-body cursor-pointer"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
