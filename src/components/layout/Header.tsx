import { DolphinLogo } from './DolphinLogo';

interface HeaderProps {
  year: number;
  onYearChange: (year: number) => void;
}

export function Header({ year, onYearChange }: HeaderProps) {
  const years = [2024, 2025, 2026, 2027];

  return (
    <header
      className="bg-deep-blue border-b-2 border-walnut-dark shadow-flat"
      style={{ height: 'var(--header-height)', position: 'sticky', top: 0, zIndex: 40 }}
    >
      <div
        className="flex items-center justify-between px-4 h-full"
        style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}
      >
        {/* 로고 + 브랜드 */}
        <div className="flex items-center gap-3">
          <DolphinLogo size={32} color="#C75D2C" />
          <div>
            <h1 className="font-display text-cream text-lg leading-none">THAIDAI</h1>
            <p className="font-mono text-cream-dark text-xs leading-none mt-0.5">매입매출 장부</p>
          </div>
        </div>

        {/* 연도 선택 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cream-dark hidden sm:block">과세연도</span>
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="
              bg-deep-blue-dark text-cream border-2 border-walnut
              font-mono text-sm px-2 py-1 cursor-pointer
              focus:outline-none focus:border-burnt-orange
            "
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
