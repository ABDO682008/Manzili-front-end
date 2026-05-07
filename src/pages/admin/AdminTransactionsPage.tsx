import { useEffect, useState, useCallback } from 'react';
import { Check, X, Eye, AlertTriangle } from 'lucide-react';
import { paymentsApi } from '../../api';
import { Spinner, EmptyState, Badge, Button, Modal } from '../../components/common';
import { formatCurrency, formatDateTime } from '../../utils';
import toast from 'react-hot-toast';
import type { Payment, PaymentMethod } from '../../types';

// Mock buyer names for display
const buyerNames: Record<number, string> = {
  5: 'Ahmed Mohamed',
  6: 'Sara Ali',
};

export const AdminTransactionsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll use mock data since admin endpoints may not be fully implemented
      setPayments([]);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleApprove = async () => {
    if (!selectedPayment) return;
    
    setProcessing(true);
    try {
      const response = await paymentsApi.approvePayment(selectedPayment.id);
      if (response.success) {
        toast.success('Payment approved');
        fetchPayments();
        setShowApproveModal(false);
        setSelectedPayment(null);
      }
    } catch {
      toast.error('Failed to approve payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectReason) return;
    
    setProcessing(true);
    try {
      const response = await paymentsApi.rejectPayment(selectedPayment.id, rejectReason);
      if (response.success) {
        toast.success('Payment rejected');
        fetchPayments();
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedPayment(null);
      }
    } catch {
      toast.error('Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="warning">في الانتظار</Badge>;
      case 'Approved':
        return <Badge variant="success">تمت الموافقة</Badge>;
      case 'Rejected':
        return <Badge variant="danger">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    return method === 'Instapay' ? 'Instapay' : 'Vodafone Cash';
  };

  // Mock payments for demo
  const mockPayments: Payment[] = [
    {
      id: 1,
      transactionIds: [101],
      buyerId: 5,
      amount: 1500,
      method: 'Instapay',
      status: 'Pending',
      proofImageUrl: '/mock-proof.jpg',
      note: 'Payment for order #101',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      transactionIds: [102],
      buyerId: 6,
      amount: 2500,
      method: 'VodafoneCash',
      status: 'Pending',
      proofImageUrl: '/mock-proof.jpg',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const displayPayments = payments.length > 0 ? payments : (activeTab === 'pending' ? mockPayments : []);

  const getBuyerName = (buyerId: number) => buyerNames[buyerId] || `User #${buyerId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>الموافقة على المدفوعات</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-white'
                : 'bg-surface-100 text-heading-600 hover:bg-surface-200'
            }`}
            style={activeTab === 'pending' ? { backgroundColor: '#DD643C' } : {}}
          >
            في الانتظار ({mockPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-white'
                : 'bg-surface-100 text-heading-600 hover:bg-surface-200'
            }`}
            style={activeTab === 'all' ? { backgroundColor: '#DD643C' } : {}}
          >
            كل المعاملات
          </button>
        </div>
      </div>

      {/* Info Banner */}
      {activeTab === 'pending' && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)', border: '1px solid rgba(237, 142, 60, 0.2)' }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ED8E3C' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#6B7B8C' }}>مطلوب مراجعة الدفع</p>
            <p className="text-sm mt-1" style={{ color: '#9BA8B4' }}>
              راجع إثباتات الدفع بعناية قبل الموافقة. بمجرد الموافقة، الطلب هيتحول للبائع.
            </p>
          </div>
        </div>
      )}

      {/* Payments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : displayPayments.length === 0 ? (
        <EmptyState
          type="default"
          title={activeTab === 'pending' ? "لا توجد مدفوعات معلقة" : "لا توجد معاملات"}
          message={activeTab === 'pending' ? "كله تمام! رجع تاني بعدين." : "ما فيش معاملات."}
        />
      ) : (
        <div className="space-y-4">
          {displayPayments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[#1A1A2E]">Payment #{payment.id}</h3>
                    {getStatusBadge(payment.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[#6B7280]">Buyer</p>
                      <p className="font-medium">{getBuyerName(payment.buyerId)}</p>
                    </div>
                    <div>
                      <p className="text-[#6B7280]">Amount</p>
                      <p className="font-bold text-[#E94560]">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-[#6B7280]">Method</p>
                      <p className="font-medium">{getMethodIcon(payment.method)}</p>
                    </div>
                    <div>
                      <p className="text-[#6B7280]">Submitted</p>
                      <p className="font-medium">{formatDateTime(payment.createdAt)}</p>
                    </div>
                  </div>
                  
                  {payment.note && (
                    <p className="text-sm text-[#6B7280] mt-3">
                      Note: {payment.note}
                    </p>
                  )}
                </div>

                {payment.status === 'Pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => { setSelectedPayment(payment); setShowApproveModal(true); }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelectedPayment(payment); setShowRejectModal(true); }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <a
                      href={payment.proofImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#0F3460] hover:bg-gray-100 rounded-lg"
                      title="View Proof"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => { setShowApproveModal(false); setSelectedPayment(null); }}
        title="Approve Payment"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowApproveModal(false); setSelectedPayment(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              isLoading={processing}
            >
              Confirm Approval
            </Button>
          </>
        }
      >
        <p className="text-[#6B7280]">
          Approve payment of <strong>{formatCurrency(selectedPayment?.amount || 0)}</strong> from {selectedPayment ? getBuyerName(selectedPayment.buyerId) : ''}?
        </p>
        <p className="text-sm text-[#6B7280] mt-2">
          The order will proceed to the seller for fulfillment.
        </p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setSelectedPayment(null); setRejectReason(''); }}
        title="Reject Payment"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowRejectModal(false); setSelectedPayment(null); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleReject}
              isLoading={processing}
              disabled={!rejectReason}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <p className="text-[#6B7280] mb-4">
          Reject payment from {selectedPayment ? getBuyerName(selectedPayment.buyerId) : ''}? The buyer will be notified and can resubmit.
        </p>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
            Reason for Rejection *
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F3460]/20 outline-none resize-none"
            placeholder="e.g., Proof unclear, Amount mismatch..."
            required
          />
        </div>
      </Modal>
    </div>
  );
};
