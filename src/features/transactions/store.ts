import { create } from 'zustand';
import { db } from '@/lib/db';
import type { Transaction, TransactionInput } from './types';
import { nanoid } from './nanoid';

interface TransactionStore {
  transactions: Transaction[];
  isLoaded: boolean;

  load: () => Promise<void>;
  add: (input: TransactionInput) => Promise<Transaction>;
  update: (id: string, input: Partial<TransactionInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  isLoaded: false,

  load: async () => {
    const all = await db.transactions.orderBy('date').reverse().toArray();
    set({ transactions: all, isLoaded: true });
  },

  add: async (input) => {
    const now = new Date().toISOString();
    const tx: Transaction = {
      ...input,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    await db.transactions.add(tx);
    set((s) => ({ transactions: [tx, ...s.transactions] }));
    return tx;
  },

  update: async (id, input) => {
    const now = new Date().toISOString();
    await db.transactions.update(id, { ...input, updatedAt: now });
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...input, updatedAt: now } : t,
      ),
    }));
  },

  remove: async (id) => {
    await db.transactions.delete(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },
}));

export function selectByYear(transactions: Transaction[], year: number): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(String(year)));
}

export function selectByYearMonth(
  transactions: Transaction[],
  year: number,
  month: number,
): Transaction[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return transactions.filter((t) => t.date.startsWith(prefix));
}
