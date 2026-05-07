import { useEffect, useState } from 'react';
import { Package, Clock, Phone, Navigation } from 'lucide-react';
import { Spinner, EmptyState, Button, Modal } from '../../components/common';
import { formatCurrency } from '../../utils';
import toast from 'react-hot-toast';

// Local type for available delivery
interface AvailableDelivery {
  id: number;
  orderId: number;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  distance: string;
  estimatedTime: string;
  fee: number;
  items: number;
}

export const AvailableDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState<AvailableDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<AvailableDelivery | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAvailableDeliveries();
  }, []);

  const fetchAvailableDeliveries = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      setDeliveries([
        {
          id: 1,
          orderId: 201,
          sellerName: 'Fresh Bakery',
          sellerAddress: '15 Nasr City, Cairo',
          buyerName: 'Mohamed Hassan',
          buyerAddress: '42 Dokki, Giza',
          buyerPhone: '01001234567',
          distance: '4.2 km',
          estimatedTime: '25 mins',
          fee: 45,
          items: 3,
        },
        {
          id: 2,
          orderId: 202,
          sellerName: 'Handmade Crafts',
          sellerAddress: '8 Maadi, Cairo',
          buyerName: 'Laila Ahmed',
          buyerAddress: '120 Zamalek, Cairo',
          buyerPhone: '01112223333',
          distance: '7.5 km',
          estimatedTime: '40 mins',
          fee: 60,
          items: 1,
        },
        {
          id: 3,
          orderId: 203,
          sellerName: 'Flower Shop',
          sellerAddress: '3 Heliopolis, Cairo',
          buyerName: 'Omar Khalid',
          buyerAddress: '55 New Cairo',
          buyerPhone: '01223334455',
          distance: '12 km',
          estimatedTime: '55 mins',
          fee: 85,
          items: 2,
        },
      ]);
    } catch {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedDelivery) return;
    
    setProcessing(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Delivery accepted!');
      setDeliveries(prev => prev.filter(d => d.id !== selectedDelivery.id));
      setShowAcceptModal(false);
      setSelectedDelivery(null);
    } catch {
      toast.error('Failed to accept delivery');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>توصيلات متاحة</h1>
          <p className="mt-1" style={{ color: '#9BA8B4' }}>{deliveries.length} توصيلة في الانتظار</p>
        </div>
      </div>

      {/* Deliveries List */}
      {deliveries.length === 0 ? (
        <EmptyState
          type="default"
          title="لا توجد توصيلات متاحة"
          message="رجع تاني بعدين للتوصيلات الجديدة"
        />
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  {/* Order Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)' }}>
                      <Package className="w-5 h-5" style={{ color: '#6B7B8C' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#6B7B8C' }}>طلب #{delivery.orderId}</h3>
                      <p className="text-sm" style={{ color: '#9BA8B4' }}>{delivery.items} عناصر</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#769E66' }} />
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: '#9BA8B4' }}>استلام من</p>
                        <p className="font-medium">{delivery.sellerName}</p>
                        <p className="text-sm" style={{ color: '#9BA8B4' }}>{delivery.sellerAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#DD643C' }} />
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: '#9BA8B4' }}>توصيل لـ</p>
                        <p className="font-medium">{delivery.buyerName}</p>
                        <p className="text-sm" style={{ color: '#9BA8B4' }}>{delivery.buyerAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#9BA8B4' }}>
                    <span className="flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      {delivery.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {delivery.estimatedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {delivery.buyerPhone}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: '#DD643C' }}>{formatCurrency(delivery.fee)}</p>
                    <p className="text-sm" style={{ color: '#9BA8B4' }}>أجر التوصيل</p>
                  </div>
                  <Button
                    onClick={() => { setSelectedDelivery(delivery); setShowAcceptModal(true); }}
                  >
                    قبول التوصيلة
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => { setShowAcceptModal(false); setSelectedDelivery(null); }}
        title="قبول التوصيلة"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowAcceptModal(false); setSelectedDelivery(null); }}>
              إلغاء
            </Button>
            <Button
              onClick={handleAccept}
              isLoading={processing}
            >
              تأكيد القبول
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p style={{ color: '#9BA8B4' }}>
            قبول التوصيلة لـ <strong>طلب #{selectedDelivery?.orderId}</strong>؟
          </p>
          <div className="bg-surface-50 rounded-lg p-3 text-sm">
            <p><strong>استلام:</strong> {selectedDelivery?.sellerName}</p>
            <p><strong>توصيل لـ:</strong> {selectedDelivery?.buyerName}</p>
            <p><strong>المسافة:</strong> {selectedDelivery?.distance}</p>
            <p><strong>الأجر:</strong> {formatCurrency(selectedDelivery?.fee || 0)}</p>
          </div>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>
            بعد القبول، هيكون معاك 30 دقيقة لاستلام الطلب.
          </p>
        </div>
      </Modal>
    </div>
  );
};
