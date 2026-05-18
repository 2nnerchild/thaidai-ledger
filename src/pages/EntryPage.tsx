import { TransactionForm } from '@/components/entry/TransactionForm';
import { useToast } from '@/components/ui/Toast';
import type { TransactionFormValues } from '@/features/transactions/schema';
import { useTransactionStore } from '@/features/transactions/store';
import { getCurrentDateISO } from '@/lib/format';

export function EntryPage() {
  const add = useTransactionStore((state) => state.add);
  const { showToast } = useToast();

  const handleSubmit = async (data: TransactionFormValues) => {
    await add(data);
    showToast('거래가 저장되었습니다.', 'success');
  };

  return (
    <div className="p-4" style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2 className="font-display text-2xl text-black-ink mb-6">거래 입력</h2>
      <TransactionForm
        defaultValues={{
          type: 'sale',
          date: getCurrentDateISO(),
          vatRate: 0.1,
          deduct: 'N',
          currency: 'KRW',
        }}
        onSubmit={handleSubmit}
        submitLabel="거래 저장"
      />
    </div>
  );
}
