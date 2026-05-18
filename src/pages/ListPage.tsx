import { useMemo, useState } from 'react';
import { TransactionForm } from '@/components/entry/TransactionForm';
import { Modal } from '@/components/ui/Modal';
import { Tag } from '@/components/ui/Tag';
import { useToast } from '@/components/ui/Toast';
import { type TransactionFormValues } from '@/features/transactions/schema';
import { useTransactionStore } from '@/features/transactions/store';
import type { Transaction, TransactionType } from '@/features/transactions/types';
import { formatDate, formatKRW } from '@/lib/format';

interface ListPageProps {
  year: number;
}

function monthLabel(month: string): string {
  return `${Number(month)}월`;
}

export function ListPage({ year }: ListPageProps) {
  const { transactions, remove, update } = useTransactionStore();
  const { showToast } = useToast();

  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterMonth, setFilterMonth] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.date.startsWith(String(year)))
      .filter((transaction) => filterType === 'all' || transaction.type === filterType)
      .filter((transaction) => filterMonth === 'all' || Number(transaction.date.split('-')[1]) === filterMonth)
      .filter((transaction) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          transaction.party.toLowerCase().includes(q) ||
          transaction.category.toLowerCase().includes(q) ||
          (transaction.memo ?? '').toLowerCase().includes(q) ||
          (transaction.artistName ?? '').toLowerCase().includes(q) ||
          (transaction.songTitle ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const dateOrder = b.date.localeCompare(a.date);
        if (dateOrder !== 0) return dateOrder;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [filterMonth, filterType, search, transactions, year]);

  const groupedByMonth = useMemo(() => {
    return filtered.reduce<Record<string, Transaction[]>>((groups, transaction) => {
      const month = transaction.date.split('-')[1];
      groups[month] ??= [];
      groups[month].push(transaction);
      return groups;
    }, {});
  }, [filtered]);

  const handleDelete = async (id: string, party: string) => {
    if (!confirm(`"${party}" 거래를 삭제하시겠습니까?`)) return;
    await remove(id);
    showToast('거래가 삭제되었습니다.', 'info');
  };

  const handleEdit = async (data: TransactionFormValues) => {
    if (!editTarget) return;
    await update(editTarget.id, data);
    showToast('거래가 수정되었습니다.', 'success');
    setEditTarget(null);
  };

  return (
    <div className="p-4" style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      <h2 className="font-display text-2xl text-black-ink mb-4">{year}년 거래 내역</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex border-2 border-walnut-dark">
          {(['all', 'sale', 'purchase'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`min-h-[44px] px-3 py-1.5 text-sm font-body cursor-pointer transition-colors ${
                filterType === type ? 'bg-burnt-orange text-white' : 'bg-cream text-walnut hover:bg-cream-dark'
              }`}
            >
              {type === 'all' ? '전체' : type === 'sale' ? '매출' : '매입'}
            </button>
          ))}
        </div>

        <select
          value={filterMonth}
          onChange={(event) => setFilterMonth(event.target.value === 'all' ? 'all' : Number(event.target.value))}
          className="min-h-[44px] border-2 border-walnut-dark bg-cream px-3 py-1.5 text-sm font-body cursor-pointer focus:outline-none focus:border-burnt-orange"
        >
          <option value="all">전체 월</option>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
            <option key={month} value={month}>
              {month}월
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="거래처·아티스트·곡명·적요 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="min-h-[44px] border-2 border-walnut-dark bg-white px-3 py-1.5 text-sm font-body flex-1 min-w-[180px] focus:outline-none focus:border-burnt-orange"
        />
      </div>

      <p className="text-xs font-mono text-grey-border mb-2">{filtered.length}건</p>

      {filtered.length === 0 ? (
        <div className="border-2 border-walnut-dark bg-white p-10 text-center text-grey-border font-body">
          해당 조건의 거래 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByMonth)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, items]) => (
              <section key={month} className="space-y-2">
                <div className="flex items-center justify-between border-b-2 border-walnut-dark pb-1">
                  <h3 className="font-display text-xl text-black-ink">{monthLabel(month)}</h3>
                  <span className="font-mono text-xs text-grey-border">{items.length}건</span>
                </div>

                <div className="border-2 border-walnut-dark overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-deep-blue text-cream border-b-2 border-walnut-dark">
                        <th className="font-body text-left px-3 py-2 font-medium">날짜</th>
                        <th className="font-body text-left px-3 py-2 font-medium">거래처 / 곡명</th>
                        <th className="font-body text-left px-3 py-2 font-medium hidden sm:table-cell">적요</th>
                        <th className="font-body text-left px-3 py-2 font-medium hidden md:table-cell">카테고리</th>
                        <th className="font-mono text-right px-3 py-2 font-medium">공급가액</th>
                        <th className="font-mono text-right px-3 py-2 font-medium hidden lg:table-cell">부가세</th>
                        <th className="font-body text-center px-3 py-2 font-medium hidden lg:table-cell">구분</th>
                        <th className="px-3 py-2 text-center font-medium">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-cream-dark hover:bg-cream-dark transition-colors"
                        >
                          <td className="font-mono px-3 py-2 text-black-ink whitespace-nowrap">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="font-body px-3 py-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-black-ink">
                                {transaction.artistName && (
                                  <span className="font-mono text-burnt-orange text-xs mr-1">
                                    [{transaction.artistName}]
                                  </span>
                                )}
                                {transaction.party}
                              </span>
                              {transaction.songTitle && (
                                <span className="text-xs font-mono text-grey-border">
                                  {transaction.songTitle}
                                </span>
                              )}
                              {transaction.memo && (
                                <span className="text-xs font-body text-grey-border sm:hidden">
                                  {transaction.memo}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="font-body px-3 py-2 text-grey-border hidden sm:table-cell">
                            {transaction.memo || '-'}
                          </td>
                          <td className="font-body px-3 py-2 text-grey-border hidden md:table-cell">
                            {transaction.category}
                          </td>
                          <td
                            className={`font-mono text-right px-3 py-2 font-medium ${
                              transaction.type === 'sale' ? 'text-deep-blue' : 'text-walnut'
                            }`}
                          >
                            {formatKRW(transaction.amount)}
                          </td>
                          <td className="font-mono text-right px-3 py-2 text-grey-border hidden lg:table-cell">
                            {formatKRW(transaction.vatAmount)}
                          </td>
                          <td className="text-center px-3 py-2 hidden lg:table-cell">
                            <Tag
                              label={
                                transaction.type === 'sale'
                                  ? '매출'
                                  : transaction.deduct === 'Y'
                                    ? '불공제'
                                    : '매입'
                              }
                              variant={
                                transaction.type === 'sale'
                                  ? 'sale'
                                  : transaction.deduct === 'Y'
                                    ? 'deduct'
                                    : 'purchase'
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditTarget(transaction)}
                                className="text-xs text-deep-blue hover:underline font-body cursor-pointer"
                              >
                                수정
                              </button>
                              <span className="text-grey-border text-xs">|</span>
                              <button
                                onClick={() => handleDelete(transaction.id, transaction.party)}
                                className="text-xs text-red-warn hover:underline font-body cursor-pointer"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
        </div>
      )}

      <Modal isOpen={editTarget !== null} onClose={() => setEditTarget(null)} title="거래 수정">
        {editTarget && (
          <TransactionForm
            defaultValues={{
              type: editTarget.type,
              date: editTarget.date,
              party: editTarget.party,
              category: editTarget.category,
              artistName: editTarget.artistName ?? '',
              songTitle: editTarget.songTitle ?? '',
              amount: editTarget.amount,
              vatRate: editTarget.vatRate as 0 | 0.1,
              vatAmount: editTarget.vatAmount,
              total: editTarget.total,
              memo: editTarget.memo ?? '',
              deduct: editTarget.deduct,
              currency: editTarget.currency ?? 'KRW',
            }}
            onSubmit={handleEdit}
            submitLabel="수정 저장"
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
}
