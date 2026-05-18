import Dexie, { type Table } from 'dexie';
import type { Transaction } from '@/features/transactions/types';

class ThaidaiDB extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super('thaidai-ledger');
    this.version(1).stores({
      transactions: 'id, type, date, category, party, createdAt',
    });
  }
}

export const db = new ThaidaiDB();

export async function migrateFromLocalStorage(): Promise<number> {
  const raw = localStorage.getItem('thaidai_transactions');
  if (!raw) return 0;

  try {
    const items: Transaction[] = JSON.parse(raw);
    if (!Array.isArray(items) || items.length === 0) return 0;

    const existing = await db.transactions.count();
    if (existing > 0) return 0; // 이미 마이그레이션 완료

    await db.transactions.bulkAdd(items);
    localStorage.removeItem('thaidai_transactions');
    return items.length;
  } catch {
    return 0;
  }
}
