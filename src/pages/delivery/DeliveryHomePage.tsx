import { useEffect, useState } from 'react';
import { Package, Clock, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { Spinner } from '../../components/common';
import { formatCurrency } from '../../utils';
import toast from 'react-hot-toast';

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

interface DeliveryStats {
  available: number;
  active: number;
  completed: number;
  earnings: number;
}

export const DeliveryHomePage = () => {
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // For demo, using mock data
      setStats({
        available: 12,
        active: 3,
        completed: 47,
        earnings: 2350,
      });
      
      // Mock active deliveries
      setActiveDeliveries([
        {
          id: 1,
          orderId: 101,
          status: 'OutForDelivery',
          buyerName: 'Ahmed Mohamed',
          buyerPhone: '01234567890',
          address: '123 Main St, Cairo',
          estimatedTime: '30 mins',
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
          estimatedTime: '45 mins',
          sellerName: 'Handmade Crafts',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'OutForDelivery':
        return <Clock className="w-5 h-5" style={{ color: '#6B7B8C' }} />;
      case 'PickedUp':
        return <Package className="w-5 h-5" style={{ color: '#ED8E3C' }} />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5" style={{ color: '#769E66' }} />;
      default:
        return <MapPin className="w-5 h-5" style={{ color: '#9BA8B4' }} />;
    }
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'OutForDelivery':
        return { backgroundColor: 'rgba(107, 123, 140, 0.1)', color: '#6B7B8C' };
      case 'PickedUp':
        return { backgroundColor: 'rgba(237, 142, 60, 0.1)', color: '#ED8E3C' };
      case 'Delivered':
        return { backgroundColor: 'rgba(118, 158, 102, 0.1)', color: '#769E66' };
      default:
        return { backgroundColor: 'rgba(155, 168, 180, 0.1)', color: '#9BA8B4' };
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
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>أهلاً بيك، مندوب التوصيل!</h1>
        <p className="mt-1" style={{ color: '#9BA8B4' }}>نظرة عامة على توصيلاتك</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)' }}>
              <Package className="w-5 h-5" style={{ color: '#6B7B8C' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{stats?.available}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>متاحة</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)' }}>
              <Clock className="w-5 h-5" style={{ color: '#ED8E3C' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{stats?.active}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>نشطة</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(118, 158, 102, 0.1)' }}>
              <CheckCircle className="w-5 h-5" style={{ color: '#769E66' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{stats?.completed}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>مكتملة</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#DD643C' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{formatCurrency(stats?.earnings || 0)}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>الأرباح</p>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: '#6B7B8C' }}>التوصيلات النشطة</h2>
          <span className="text-sm" style={{ color: '#9BA8B4' }}>{activeDeliveries.length} جارية</span>
        </div>

        <div className="divide-y divide-surface-100">
          {activeDeliveries.map((delivery) => (
            <div key={delivery.id} className="p-4 hover:bg-surface-50/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl" style={getStatusColor(delivery.status)}>
                  {getStatusIcon(delivery.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium" style={{ color: '#6B7B8C' }}>طلب #{delivery.orderId}</h3>
                    <span className="text-xs px-2 py-1 rounded-full" style={getStatusColor(delivery.status)}>
                      {delivery.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p style={{ color: '#9BA8B4' }}>المشتري</p>
                      <p className="font-medium" style={{ color: '#6B7B8C' }}>{delivery.buyerName}</p>
                    </div>
                    <div>
                      <p style={{ color: '#9BA8B4' }}>البائع</p>
                      <p className="font-medium" style={{ color: '#6B7B8C' }}>{delivery.sellerName}</p>
                    </div>
                    <div className="col-span-2">
                      <p style={{ color: '#9BA8B4' }}>العنوان</p>
                      <p className="font-medium" style={{ color: '#6B7B8C' }}>{delivery.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span style={{ color: '#9BA8B4' }}>
                      <Clock className="w-4 h-4 inline ml-1" />
                      {delivery.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href="/delivery/available"
          className="p-4 rounded-2xl text-center transition-colors text-white"
          style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
        >
          <Package className="w-6 h-6 mx-auto mb-2" />
          <p className="font-medium">التوصيلات المتاحة</p>
          <p className="text-sm text-white/70">{stats?.available} متاحة</p>
        </a>

        <a
          href="/delivery/my-deliveries"
          className="bg-white hover:bg-surface-50 p-4 rounded-2xl text-center transition-colors shadow-soft"
        >
          <MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: '#6B7B8C' }} />
          <p className="font-medium" style={{ color: '#6B7B8C' }}>توصيلاتي</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>عرض السجل</p>
        </a>
      </div>
    </div>
  );
};
