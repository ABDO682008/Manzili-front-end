import { PackageOpen, ShoppingCart, Heart, FileSearch, Inbox } from 'lucide-react';
import { Button } from './Button';

type EmptyStateType = 'cart' | 'orders' | 'requests' | 'favorites' | 'services' | 'default';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const defaultConfigs: Record<EmptyStateType, { icon: React.ReactNode; defaultTitle: string; defaultMessage: string }> = {
  cart: {
    icon: <ShoppingCart className="w-16 h-16 text-surface-300" />,
    defaultTitle: 'سلة التسوق فارغة',
    defaultMessage: 'تصفّح خدماتنا وأضف ما تحتاجه إلى سلتك.',
  },
  orders: {
    icon: <PackageOpen className="w-16 h-16 text-surface-300" />,
    defaultTitle: 'لا توجد أوامر بعد',
    defaultMessage: 'هل أنت مستعد لطلب خدمتك الأولى؟ تصفّح وابدأ رحلتك.',
  },
  requests: {
    icon: <FileSearch className="w-16 h-16 text-surface-300" />,
    defaultTitle: 'لا توجد طلبات بعد',
    defaultMessage: 'أضف خدمات وأرسل طلبك الأول!',
  },
  favorites: {
    icon: <Heart className="w-16 h-16 text-surface-300" />,
    defaultTitle: 'لا توجد مفضلات بعد',
    defaultMessage: 'تصفّح الخدمات واحفظ ما يعجبك في المفضلة.',
  },
  services: {
    icon: <PackageOpen className="w-16 h-16 text-surface-300" />,
    defaultTitle: 'لا توجد خدمات',
    defaultMessage: 'جرّب كلمات بحث مختلفة أو تصفّح جميع الفئات.',
  },
  default: {
    icon: <Inbox className="w-16 h-16 text-surface-300" />,
    defaultTitle: 'لا يوجد شيء هنا بعد',
    defaultMessage: 'تحقق لاحقاً أو استكشف أقساماً أخرى.',
  },
};

export const EmptyState = ({
  type = 'default',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const config = defaultConfigs[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 p-6 bg-surface-100 rounded-full animate-float">{config.icon}</div>
      <h3 className="text-xl font-semibold text-surface-900 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-surface-500 max-w-sm mb-6">
        {message || config.defaultMessage}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
