import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Clock } from 'lucide-react';
import { paymentsApi } from '../../api';
import { Button } from '../../components/common';
import type { Payment } from '../../types';

export const PaymentProcessingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId } = location.state || {};
  
  const [, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (!paymentId) {
      navigate('/requests');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await paymentsApi.getPaymentStatus(paymentId);
        if (response.success && response.data) {
          setPayment(response.data);
          
          if (response.data.status === 'Approved') {
            navigate('/payment/success');
            return;
          }
        }
      } catch {
        // Silent fail
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [paymentId, navigate]);

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)' }}>
        <Clock className="w-10 h-10" style={{ color: '#6B7B8C' }} />
      </div>

      <h1 className="text-2xl font-bold mb-3" style={{ color: '#6B7B8C' }}>
        الدفع قيد المراجعة
      </h1>

      <p className="mb-8" style={{ color: '#9BA8B4' }}>
        تم إرسال إيصال الدفع بنجاح. فريقنا بيحاوله و هيتأكد في غضون ساعات قليلة.
      </p>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#DD643C' }} />
          <span className="font-medium" style={{ color: '#6B7B8C' }}>قيد المراجعة</span>
        </div>

        <p className="text-sm" style={{ color: '#9BA8B4' }}>
          الصفحة دي هتتحدث تلقائي لما الدفع يتأكد.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => navigate('/orders')}
          fullWidth
        >
          طلباتي
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate('/home')}
          fullWidth
        >
          أكمل التسوق
        </Button>
      </div>
    </div>
  );
};
