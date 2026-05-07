interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

// Manzili Color System ONLY
const variantStyles = {
  primary: 'bg-[#DD643C]/10 text-[#DD643C] border-[#DD643C]/20',
  secondary: 'bg-surface-100 text-surface-700 border-surface-200',
  success: 'bg-[#769E66]/10 text-[#769E66] border-[#769E66]/20',
  warning: 'bg-[#ED8E3C]/10 text-[#ED8E3C] border-[#ED8E3C]/20',
  danger: 'bg-[#DD643C]/10 text-[#DD643C] border-[#DD643C]/20',
  info: 'bg-[#6B7B8C]/10 text-[#6B7B8C] border-[#6B7B8C]/20',
  gray: 'bg-[#9BA8B4]/10 text-[#9BA8B4] border-[#9BA8B4]/20',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs font-semibold uppercase',
  md: 'px-3 py-1 text-sm font-semibold uppercase',
};

export const Badge = ({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}: BadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
