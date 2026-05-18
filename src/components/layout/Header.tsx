import { DolphinLogo } from './DolphinLogo';

interface HeaderProps {
  year: number;
  onYearChange: (year: number) => void;
  onLogout: () => void;
}

export function Header({ year, onYearChange, onLogout }: HeaderProps) {
  const years = [2024, 2025, 2026, 2027];

  return (
    <header
      className="bg-deep-blue border-b-2 border-walnut-dark shadow-flat"
      style={{ height: 'var(--header-height)', position: 'sticky', top: 0, zIndex: 40 }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 h-full"
        style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <DolphinLogo size={32} color="#C75D2C" />
          <div className="min-w-0">
            <h1 className="font-display text-cream text-lg leading-none">THAIDAI</h1>
            <p className="font-mono text-cream-dark text-xs leading-none mt-0.5">매입매출 장부</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cream-dark hidden sm:block">과세연도</span>
          <select
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value))}
            className="
              bg-deep-blue-dark text-cream border-2 border-walnut
              font-mono text-sm px-2 py-1 cursor-pointer min-h-[36px]
              focus:outline-none focus:border-burnt-orange
            "
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}년
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onLogout}
            className="bg-cream text-deep-blue border-2 border-walnut-dark px-2 py-1 min-h-[36px] font-body text-xs cursor-pointer hover:bg-cream-dark"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
