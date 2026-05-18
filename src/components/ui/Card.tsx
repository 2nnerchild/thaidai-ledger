import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const base = 'bg-cream border-2 border-walnut-dark shadow-flat p-4';
  const hoverStyle = hover ? 'transition-all duration-150 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-flat-lg' : '';
  return (
    <div className={`${base} ${hoverStyle} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: 'orange' | 'blue' | 'green' | 'red';
}

export function KPICard({ label, value, sub, accent = 'orange' }: KPICardProps) {
  const accentMap = {
    orange: 'border-l-4 border-l-burnt-orange',
    blue:   'border-l-4 border-l-deep-blue',
    green:  'border-l-4 border-l-green-success',
    red:    'border-l-4 border-l-red-warn',
  };
  return (
    <Card className={`${accentMap[accent]} pl-3`}>
      <p className="text-xs font-body text-walnut uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono text-2xl font-medium text-black-ink leading-tight">{value}</p>
      {sub && <p className="text-xs font-mono text-grey-border mt-1">{sub}</p>}
    </Card>
  );
}
