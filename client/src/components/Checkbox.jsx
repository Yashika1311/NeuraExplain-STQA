import { forwardRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const Checkbox = forwardRef(({ checked, onChange, label, disabled = false, className = '', ...props }, ref) => {
  const { theme } = useTheme();

  const baseClasses = `
    w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2
    ${theme === 'dark'
      ? 'bg-slate-900 border-blue-700 text-blue-200 focus:ring-blue-500'
      : 'bg-blue-100 border-blue-600 text-blue-700 focus:ring-blue-400'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={baseClasses}
        onClick={() => !disabled && onChange?.(!checked)}
      >
        {checked && (
          <svg
            className="w-full h-full flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      {label && (
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
