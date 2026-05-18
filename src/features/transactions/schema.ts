import { z } from 'zod';
import { PURCHASE_CATEGORIES, SALE_CATEGORIES } from './categories';

export const transactionSchema = z.object({
  type: z.enum(['sale', 'purchase']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
  party: z.string().min(1, '거래처를 입력해 주세요.'),
  category: z.string().min(1, '카테고리를 선택해 주세요.'),
  artistName: z.string().optional(),
  songTitle: z.string().optional(),
  amount: z.number({ invalid_type_error: '공급가액을 확인해 주세요.' }).positive('공급가액은 0보다 커야 합니다.'),
  vatRate: z.union([z.literal(0), z.literal(0.1)]),
  vatAmount: z.number().min(0),
  total: z.number({ invalid_type_error: '입금/결제 금액을 입력해 주세요.' }).positive('입금/결제 금액은 0보다 커야 합니다.'),
  memo: z.string().optional(),
  deduct: z.enum(['Y', 'N']),
  currency: z.enum(['KRW', 'THB', 'USD']).optional(),
  originalAmount: z.number().positive().optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export function getCategoriesForType(type: 'sale' | 'purchase') {
  return type === 'sale' ? SALE_CATEGORIES : PURCHASE_CATEGORIES;
}
