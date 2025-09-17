import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/useStore';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const { colorTheme } = useStore();
    
    const getThemeColors = () => {
      const themes = {
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
        orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
        red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      };
      return themes[colorTheme];
    };

    const variants = {
      primary: `${getThemeColors()} text-white shadow-md hover:shadow-lg`,
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300',
      ghost: 'hover:bg-gray-100 text-gray-700 hover:text-gray-900',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          `focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant === 'primary' ? getThemeColors().split(' ')[2] : 'focus:ring-blue-500'}`,
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';