import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-body font-medium text-walnut uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            border-2 border-walnut-dark bg-white px-3 text-sm w-full
            font-body text-black-ink
            focus:outline-none focus:border-burnt-orange focus:shadow-flat-sm
            transition-all duration-100 cursor-pointer
            min-h-[44px]
            ${error ? 'border-red-warn' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-warn font-body mt-0.5">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
