export type TransactionType = 'sale' | 'purchase';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;             // ISO 'YYYY-MM-DD'
  party: string;            // 거래처
  category: string;
  artistName?: string;      // 음악 창작 카테고리 전용 — 내역 제목 앞 [아티스트명] 표기
  amount: number;           // 공급가액 (KRW)
  vatRate: number;          // 0 or 0.1
  vatAmount: number;        // amount * vatRate
  total: number;            // amount + vatAmount
  memo?: string;
  deduct: 'Y' | 'N';        // 매입세액 불공제 여부 (매입만 의미)
  currency?: 'KRW' | 'THB' | 'USD';
  originalAmount?: number;  // 원화 환산 전 금액
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
