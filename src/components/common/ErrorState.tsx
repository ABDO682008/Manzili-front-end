import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'حدث خطأ ما',
  message = 'واجهنا خطأ أثناء تحميل هذا المحتوى. يرجى المحاولة مجدداً.',
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 p-6 rounded-full" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)' }}>
        <AlertTriangle className="w-16 h-16" style={{ color: '#DD643C' }} />
      </div>
      <h3 className="text-xl font-semibold text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-500 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          حاول مجدداً
        </Button>
      )}
    </div>
  );
};
