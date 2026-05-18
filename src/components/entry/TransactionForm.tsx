import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requiresArtistName } from '@/features/transactions/categories';
import { getCategoriesForType, transactionSchema, type TransactionFormValues } from '@/features/transactions/schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatKRW, getCurrentDateISO } from '@/lib/format';

interface TransactionFormProps {
  defaultValues?: Partial<TransactionFormValues>;
  onSubmit: (data: TransactionFormValues) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

function splitTotalAmount(total: number, vatRate: 0 | 0.1) {
  if (!Number.isFinite(total) || total <= 0) {
    return { amount: 0, vatAmount: 0 };
  }

  if (vatRate === 0) {
    return { amount: Math.round(total), vatAmount: 0 };
  }

  const amount = Math.round(total / 1.1);
  return { amount, vatAmount: Math.round(total) - amount };
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  submitLabel = '거래 저장',
  onCancel,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'sale',
      date: getCurrentDateISO(),
      vatRate: 0.1,
      amount: 0,
      vatAmount: 0,
      total: 0,
      deduct: 'N',
      currency: 'KRW',
      ...defaultValues,
    },
  });

  const type = watch('type');
  const total = watch('total');
  const vatRate = watch('vatRate');
  const category = watch('category');
  const showMusicFields = requiresArtistName(category ?? '');
  const categories = getCategoriesForType(type);
  const { amount, vatAmount } = splitTotalAmount(total, vatRate ?? 0.1);

  useEffect(() => {
    if ((total || 0) > 0) {
      setValue('amount', amount, { shouldValidate: true });
      setValue('vatAmount', vatAmount, { shouldValidate: true });
    }
  }, [amount, total, vatAmount, setValue]);

  useEffect(() => {
    if (!showMusicFields) {
      setValue('artistName', '');
      setValue('songTitle', '');
    }
  }, [showMusicFields, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex border-2 border-walnut-dark">
        {(['sale', 'purchase'] as const).map((nextType) => (
          <button
            type="button"
            key={nextType}
            onClick={() => {
              setValue('type', nextType);
              setValue('category', '');
            }}
            className={`flex-1 py-3 text-sm font-body font-medium transition-colors cursor-pointer ${
              type === nextType
                ? nextType === 'sale'
                  ? 'bg-deep-blue text-white'
                  : 'bg-walnut text-cream'
                : 'bg-cream text-walnut hover:bg-cream-dark'
            }`}
          >
            {nextType === 'sale' ? '매출' : '매입'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="거래일자" type="date" error={errors.date?.message} {...register('date')} />
        <Input
          label="거래처"
          placeholder="예: 레이블명, 퍼블리셔명"
          error={errors.party?.message}
          {...register('party')}
        />
      </div>

      <Select
        label="카테고리"
        placeholder="카테고리 선택"
        options={categories.map((item) => ({ value: item, label: item }))}
        error={errors.category?.message}
        {...register('category')}
      />

      {showMusicFields && (
        <div className="bg-cream-dark border-2 border-burnt-orange p-3 space-y-3">
          <span className="text-xs font-mono text-burnt-orange uppercase tracking-widest font-medium">
            음악 정보
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="아티스트명" placeholder="예: IU, aespa" {...register('artistName')} />
            <Input label="곡명" placeholder="예: Drama, Lilac" {...register('songTitle')} />
          </div>
          <p className="text-xs font-body text-grey-border">
            거래 내역에는 아티스트명이 [아티스트명] 형식으로 먼저 표시됩니다.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={type === 'sale' ? '입금받은 금액 (합계)' : '결제한 금액 (합계)'}
          type="number"
          inputMode="numeric"
          placeholder="0"
          mono
          error={errors.total?.message}
          {...register('total', { valueAsNumber: true })}
        />
        <Select
          label="부가세율"
          options={[
            { value: '0.1', label: '10% (일반과세)' },
            { value: '0', label: '0% (영세율/면세)' },
          ]}
          error={errors.vatRate?.message}
          {...register('vatRate', { valueAsNumber: true })}
        />
      </div>

      {(total || 0) > 0 && (
        <div className="bg-cream-dark border-2 border-walnut-dark p-3 space-y-1">
          <div className="flex justify-between font-mono text-sm">
            <span className="text-walnut">입금/결제 총액</span>
            <span className="text-burnt-orange">{formatKRW(total)}</span>
          </div>
          <div className="flex justify-between font-mono text-sm">
            <span className="text-walnut">공급가액</span>
            <span className="text-black-ink">{formatKRW(amount)}</span>
          </div>
          <div className="flex justify-between font-mono text-sm">
            <span className="text-walnut">부가세</span>
            <span className="text-black-ink">{formatKRW(vatAmount)}</span>
          </div>
        </div>
      )}

      {type === 'purchase' && (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-red-warn cursor-pointer"
              checked={watch('deduct') === 'Y'}
              onChange={(event) => setValue('deduct', event.target.checked ? 'Y' : 'N')}
            />
            <span className="text-sm font-body text-black-ink">매입세액 불공제</span>
          </label>
          <span className="text-xs text-grey-border font-body">접대비, 비업무용 차량 등</span>
        </div>
      )}

      <Input
        label="적요 (선택)"
        placeholder="계약번호, 지급 회차, 작업 메모 등"
        {...register('memo')}
      />

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="lg" fullWidth onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
