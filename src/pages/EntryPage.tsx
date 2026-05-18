import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, getCategoriesForType, type TransactionFormValues } from '@/features/transactions/schema';
import { requiresArtistName } from '@/features/transactions/categories';
import { useTransactionStore } from '@/features/transactions/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { getCurrentDateISO, formatKRW } from '@/lib/format';

export function EntryPage() {
  const add = useTransactionStore((s) => s.add);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'sale',
      date: getCurrentDateISO(),
      vatRate: 0.1,
      deduct: 'N',
      currency: 'KRW',
    },
  });

  const type = watch('type');
  const amount = watch('amount');
  const vatRate = watch('vatRate');
  const category = watch('category');

  const showArtistField = requiresArtistName(category ?? '');

  const vatAmount = amount && vatRate !== undefined ? Math.round(amount * vatRate) : 0;
  const total = (amount || 0) + vatAmount;

  useEffect(() => {
    if (amount !== undefined && vatRate !== undefined) {
      setValue('vatAmount', vatAmount);
      setValue('total', total || 0.001);
    }
  }, [amount, vatRate, vatAmount, total, setValue]);

  // 아티스트명이 불필요한 카테고리로 바뀌면 필드 초기화
  useEffect(() => {
    if (!showArtistField) setValue('artistName', '');
  }, [showArtistField, setValue]);

  const categories = getCategoriesForType(type);

  const onSubmit = async (data: TransactionFormValues) => {
    await add(data);
    showToast('거래가 저장되었습니다.', 'success');
    reset({
      type: data.type,
      date: getCurrentDateISO(),
      vatRate: 0.1,
      deduct: 'N',
      currency: 'KRW',
    });
  };

  return (
    <div className="p-4" style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2 className="font-display text-2xl text-black-ink mb-6">거래 입력</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 매출/매입 토글 */}
        <div className="flex border-2 border-walnut-dark">
          {(['sale', 'purchase'] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => { setValue('type', t); setValue('category', ''); }}
              className={`
                flex-1 py-3 text-sm font-body font-medium transition-colors cursor-pointer
                ${type === t
                  ? t === 'sale' ? 'bg-deep-blue text-white' : 'bg-walnut text-cream'
                  : 'bg-cream text-walnut hover:bg-cream-dark'
                }
              `}
            >
              {t === 'sale' ? '매출' : '매입'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="거래일자"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
          <Input
            label="거래처"
            placeholder="레이블명, 퍼블리셔 등"
            error={errors.party?.message}
            {...register('party')}
          />
        </div>

        <Select
          label="카테고리"
          placeholder="카테고리 선택"
          options={categories.map((c) => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register('category')}
        />

        {/* 아티스트명 — 음악 창작 카테고리 선택 시 표시 */}
        {showArtistField && (
          <div className="bg-cream-dark border-2 border-burnt-orange p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-burnt-orange uppercase tracking-widest font-medium">
                ♪ 아티스트 정보
              </span>
            </div>
            <Input
              label="아티스트명"
              placeholder="예: IU, aespa, 이무진 …"
              {...register('artistName')}
            />
            <p className="text-xs font-body text-grey-border">
              입력 시 내역에 <span className="font-mono text-black-ink">[아티스트명]</span> 으로 표기됩니다.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="공급가액 (원)"
            type="number"
            inputMode="numeric"
            placeholder="0"
            mono
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
          <Select
            label="부가세율"
            options={[
              { value: '0.1', label: '10% (일반과세)' },
              { value: '0',   label: '0% (영세율/면세)' },
            ]}
            {...register('vatRate', { valueAsNumber: true })}
          />
        </div>

        {/* 자동 계산 미리보기 */}
        {(amount || 0) > 0 && (
          <div className="bg-cream-dark border-2 border-walnut-dark p-3 space-y-1">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-walnut">공급가액</span>
              <span className="text-black-ink">{formatKRW(amount || 0)}</span>
            </div>
            <div className="flex justify-between font-mono text-sm">
              <span className="text-walnut">부가세</span>
              <span className="text-black-ink">{formatKRW(vatAmount)}</span>
            </div>
            <div className="flex justify-between font-mono text-sm font-medium border-t border-walnut-dark pt-1 mt-1">
              <span className="text-walnut">합계</span>
              <span className="text-burnt-orange">{formatKRW(total)}</span>
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
                onChange={(e) => setValue('deduct', e.target.checked ? 'Y' : 'N')}
              />
              <span className="text-sm font-body text-black-ink">매입세액 불공제</span>
            </label>
            <span className="text-xs text-grey-border font-body">(접대비, 비업무용 차량 등)</span>
          </div>
        )}

        <Input
          label="적요 (선택)"
          placeholder="곡명, 앨범명, 계약번호 등"
          {...register('memo')}
        />

        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '거래 저장'}
        </Button>
      </form>
    </div>
  );
}
