import { useEffect, useState } from 'react';
import { Package, CheckCircle, MapPin, Phone, Navigation } from 'lucide-react';
import { Spinner, EmptyState, Badge, Button, Modal } from '../../components/common';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

// Local types
type DeliveryStatus = 'Pending' | 'PickedUp' | 'OutForDelivery' | 'Delivered' | 'Failed';

interface Delivery {
  id: number;
  orderId: number;
  status: DeliveryStatus;
  buyerName: string;
  buyerPhone: string;
  address: string;
  estimatedTime: string;
  sellerName: string;
  createdAt: string;
}

export const MyDeliveriesPage = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // Mock data
      setActiveDeliveries([
        {
          id: 1,
          orderId: 101,
          status: 'OutForDelivery',
          buyerName: 'Ahmed Mohamed',
          buyerPhone: '01234567890',
          address: '123 Main St, Cairo',
          estimatedTime: '15 mins',
          sellerName: 'Bakery Delight',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          orderId: 102,
          status: 'PickedUp',
          buyerName: 'Sara Ali',
          buyerPhone: '01112223333',
          address: '456 Elm St, Giza',
          estimatedTime: '30 mins',
          sellerName: 'Handmade Crafts',
          createdAt: new Date().toISOString(),
        },
      ]);

      setCompletedDeliveries([
        {
          id: 3,
          orderId: 95,
          status: 'Delivered',
          buyerName: 'Khaled Omar',
          buyerPhone: '01005556677',
          address: '789 Palm St, Maadi',
          estimatedTime: '',
          sellerName: 'Fresh Flowers',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 4,
          orderId: 96,
          status: 'Delivered',
          buyerName: 'Mona Ibrahim',
          buyerPhone: '01223334455',
          address: '321 Oak Rd, Heliopolis',
          estimatedTime: '',
          sellerName: 'Sweet Treats',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } catch {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedDelivery) return;
    
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Delivery marked as complete!');
      setActiveDeliveries(prev => prev.filter(d => d.id !== selectedDelivery.id));
      setCompletedDeliveries(prev => [{ ...selectedDelivery, status: 'Delivered' as DeliveryStatus }, ...prev]);
      setShowCompleteModal(false);
      setSelectedDelivery(null);
    } catch {
      toast.error('Failed to complete delivery');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'PickedUp':
        return <Badge variant="warning">Picked Up</Badge>;
      case 'OutForDelivery':
        return <Badge variant="info">Out for Delivery</Badge>;
      case 'Delivered':
        return <Badge variant="success">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getNextAction = (status: DeliveryStatus) => {
    switch (status) {
      case 'PickedUp':
        return 'Start Delivery';
      case 'OutForDelivery':
        return 'Mark Delivered';
      default:
        return '';
    }
  };

  const currentDeliveries = activeTab === 'active' ? activeDeliveries : completedDeliveries;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>توصيلاتي</h1>
        <p className="mt-1" style={{ color: '#9BA8B4' }}>إدارة مهام التوصيل</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'text-white'
              : 'bg-surface-100 text-heading-600 hover:bg-surface-200'
          }`}
          style={activeTab === 'active' ? { backgroundColor: '#DD643C' } : undefined}
        >
          نشطة ({activeDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'text-white'
              : 'bg-surface-100 text-heading-600 hover:bg-surface-200'
          }`}
          style={activeTab === 'completed' ? { backgroundColor: '#DD643C' } : undefined}
        >
          مكتملة ({completedDeliveries.length})
        </button>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : currentDeliveries.length === 0 ? (
        <EmptyState
          type="default"
          title={activeTab === 'active' ? "لا توجد توصيلات نشطة" : "لا توجد توصيلات مكتملة"}
          message={activeTab === 'active' ? "اقبل توصيلة من قائمة التوصيلات المتاحة" : "أكمل التوصيلات عشان تظهر هنا"}
        />
      ) : (
        <div className="space-y-4">
          {currentDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)' }}>
                      <Package className="w-5 h-5" style={{ color: '#6B7B8C' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#6B7B8C' }}>طلب #{delivery.orderId}</h3>
                      <p className="text-sm" style={{ color: '#9BA8B4' }}>{formatDate(delivery.createdAt)}</p>
                    </div>
                  </div>
                  {getStatusBadge(delivery.status)}
                </div>

                {/* Route */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1" style={{ color: '#769E66' }} />
                    <div>
                      <p className="text-sm" style={{ color: '#9BA8B4' }}>استلام من {delivery.sellerName}</p>
                      <p className="font-medium text-sm">{delivery.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Navigation className="w-4 h-4 mt-1" style={{ color: '#DD643C' }} />
                    <div>
                      <p className="text-sm" style={{ color: '#9BA8B4' }}>توصيل لـ {delivery.buyerName}</p>
                      <p className="font-medium text-sm">{delivery.address}</p>
                    </div>
                  </div>
                </div>

                {/* Contact & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                  <a
                    href={`tel:${delivery.buyerPhone}`}
                    className="flex items-center gap-2 hover:underline"
                    style={{ color: '#6B7B8C' }}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{delivery.buyerPhone}</span>
                  </a>

                  {activeTab === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => { setSelectedDelivery(delivery); setShowCompleteModal(true); }}
                    >
                      {getNextAction(delivery.status)}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => { setShowCompleteModal(false); setSelectedDelivery(null); }}
        title="إكمال التوصيل"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowCompleteModal(false); setSelectedDelivery(null); }}>
              إلغاء
            </Button>
            <Button
              onClick={handleComplete}
              isLoading={processing}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              تأكيد التوصيل
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p style={{ color: '#9BA8B4' }}>
            تأكيد توصيل <strong>طلب #{selectedDelivery?.orderId}</strong> لـ {selectedDelivery?.buyerName}؟
          </p>
          <div className="bg-surface-50 rounded-lg p-3">
            <p className="text-sm" style={{ color: '#9BA8B4' }}>العنوان</p>
            <p className="font-medium">{selectedDelivery?.address}</p>
          </div>
          <p className="text-sm" style={{ color: '#ED8E3C' }}>
            اتأكد إنك وصلت للعنوان الصحيح قبل التأكيد.
          </p>
        </div>
      </Modal>
    </div>
  );
};
