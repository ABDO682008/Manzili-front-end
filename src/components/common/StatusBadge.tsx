import { STATUS_CONFIG } from '../../utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Request'];

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full
        text-xs font-bold uppercase
        ${config.bgClass} ${config.textClass}
        ${className}
      `}
      title={`${config.label} / ${config.labelAr}`}
    >
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.labelAr}</span>
    </span>
  );
};
