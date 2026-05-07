import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

// Manzili Color System ONLY: Primary #DD643C, Headings #6B7B8C, Nature #769E66, Neutral #9BA8B4, Warm #ED8E3C
const variantStyles = {
  primary: 'bg-[#DD643C] text-white hover:bg-[#c95a36] hover:shadow-soft focus:ring-[#DD643C]/50',
  secondary: 'bg-[#6B7B8C] text-white hover:bg-[#5a6978] focus:ring-[#6B7B8C]/50',
  outline: 'border-2 border-[#DD643C] text-[#DD643C] hover:bg-[#DD643C]/10 focus:ring-[#DD643C]/50',
  ghost: 'text-[#6B7B8C] hover:bg-[#6B7B8C]/10 focus:ring-[#6B7B8C]/30',
  danger: 'bg-[#DD643C] text-white hover:bg-[#c95a36] focus:ring-[#DD643C]/50',
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    className = '',
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          font-semibold transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
