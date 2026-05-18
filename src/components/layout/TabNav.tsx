export type TabId = 'dashboard' | 'entry' | 'list' | 'vat' | 'reports' | 'export';

interface Tab {
  id: TabId;
  label: string;
  shortLabel: string;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: '대시보드',   shortLabel: '대시' },
  { id: 'entry',     label: '거래입력',   shortLabel: '입력' },
  { id: 'list',      label: '거래내역',   shortLabel: '내역' },
  { id: 'vat',       label: '부가세',     shortLabel: '부가세' },
  { id: 'reports',   label: '리포트',     shortLabel: '리포트' },
  { id: 'export',    label: '내보내기',   shortLabel: '내보내기' },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav
      className="bg-cream-dark border-b-2 border-walnut-dark sticky z-30"
      style={{ top: 'var(--header-height)' }}
    >
      <div
        className="flex overflow-x-auto"
        style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-shrink-0 px-4 py-3 text-sm font-body font-medium
                border-r-2 border-walnut-dark last:border-r-0
                transition-colors duration-100 cursor-pointer
                ${isActive
                  ? 'bg-burnt-orange text-white'
                  : 'bg-cream-dark text-walnut hover:bg-cream hover:text-black-ink'
                }
              `}
              style={{ minHeight: 'var(--tab-height)' }}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
