import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/common';

export const RequestConfirmationPage = () => {
  const location = useLocation();
  const count = location.state?.count || 1;

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(118, 158, 102, 0.1)' }}>
        <CheckCircle className="w-10 h-10" style={{ color: '#769E66' }} />
      </div>

      <h1 className="text-2xl font-bold mb-3" style={{ color: '#6B7B8C' }}>
        تم إرسال الطلبات!
      </h1>

      <p className="mb-6" style={{ color: '#9BA8B4' }}>
        {count > 1 ? 'طلباتك' : 'طلبك'} {count} {count > 1 ? 'تم إرسالهم' : 'تم إرساله'} للبائعين. هيراجعوهم ويردوا في غضون 48 ساعة.
      </p>

      {/* Countdown Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)', border: '1px solid rgba(237, 142, 60, 0.2)' }}>
        <Clock className="w-4 h-4" style={{ color: '#ED8E3C' }} />
        <span className="text-sm font-medium" style={{ color: '#ED8E3C' }}>
          الرد متوقع خلال 48 ساعة
        </span>
      </div>

      <div className="space-y-3">
        <Link to="/requests">
          <Button fullWidth size="lg">
            طلباتي
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>

        <Link to="/services">
          <Button variant="outline" fullWidth size="lg">
            <ShoppingBag className="w-5 h-5" />
            أكمل التسوق
          </Button>
        </Link>
      </div>
    </div>
  );
};
