import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, mono = false, className = '', type, ...props }, ref) => {
    // 숫자 입력은 모바일에서 자동으로 numeric 키패드 사용
    const inputMode = props.inputMode ?? (type === 'number' ? 'numeric' : undefined);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-body font-medium text-walnut uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          inputMode={inputMode}
          className={`
            border-2 border-walnut-dark bg-white px-3 text-sm w-full
            font-${mono ? 'mono' : 'body'} text-black-ink
            placeholder:text-grey-border
            focus:outline-none focus:border-burnt-orange focus:shadow-flat-sm
            transition-all duration-100
            min-h-[44px]
            ${error ? 'border-red-warn' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-warn font-body mt-0.5">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
