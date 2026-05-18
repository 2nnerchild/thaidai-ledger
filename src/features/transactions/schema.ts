import { z } from 'zod';
import { SALE_CATEGORIES, PURCHASE_CATEGORIES } from './categories';

export const transactionSchema = z.object({
  type: z.enum(['sale', 'purchase']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
  party: z.string().min(1, '거래처를 입력해 주세요.'),
  category: z.string().min(1, '카테고리를 선택해 주세요.'),
  artistName: z.string().optional(),
  amount: z.number({ invalid_type_error: '금액을 입력해 주세요.' }).positive('금액은 0보다 커야 합니다.'),
  vatRate: z.number().refine((v) => v === 0 || v === 0.1, '부가세율은 0 또는 10%여야 합니다.'),
  vatAmount: z.number().min(0),
  total: z.number().positive(),
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
