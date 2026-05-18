export const SALE_CATEGORIES = [
  '작곡료',
  '프로듀싱료',
  '저작권료(KOMCA)',
  '저작권료(해외)',
  '실연료',
  'MR/스템 판매',
  '강의/컨설팅',
  'Brain Bounce 협업',
  'Studio Boran 대관',
  '기타 매출',
] as const;

export const PURCHASE_CATEGORIES = [
  '장비/하드웨어',
  '소프트웨어/플러그인',
  '스튜디오 임대',
  '외주 작업비',
  '샘플/라이선스',
  '출장/교통비',
  '회의/접대비',
  '통신/구독',
  '세무/회계',
  '마케팅/홍보',
  '도서/교육',
  '기타 매입',
] as const;

export type SaleCategory = (typeof SALE_CATEGORIES)[number];
export type PurchaseCategory = (typeof PURCHASE_CATEGORIES)[number];

export const ARTIST_CATEGORIES: readonly string[] = [
  '작곡료',
  '프로듀싱료',
  '저작권료(KOMCA)',
  '저작권료(해외)',
  '실연료',
  'MR/스템 판매',
  'Brain Bounce 협업',
] as const;

export function requiresArtistName(category: string): boolean {
  return ARTIST_CATEGORIES.includes(category);
}

export function formatTransactionTitle(party: string, artistName?: string): string {
  const artist = artistName?.trim();
  return artist ? `[${artist}] ${party}` : party;
}
