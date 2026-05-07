import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Clock, Copy, AlertTriangle } from 'lucide-react';
import { transactionsApi } from '../../api';
import { Spinner, ErrorState, Badge, Button, ConfirmDialog } from '../../components/common';
import { getStatusLabel, getStatusColor, getOrderTimeline, getCancellationFeeInfo, getBuyerAllowedActions } from '../../utils';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import type { Transaction } from '../../types';

export const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState<{ code: string; expiry: string } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      
      const response = await transactionsApi.getTransactionById(Number(orderId));
      if (response.success && response.data) {
        setOrder(response.data);
        
        // Fetch delivery code if status allows
        if (['ReadyForShipping', 'OutForDelivery', 'Delivered', 'Completed'].includes(response.data.status)) {
          try {
            const codeResponse = await transactionsApi.getDeliveryCode(Number(orderId));
            if (codeResponse.success && codeResponse.data) {
              setDeliveryCode(codeResponse.data);
            }
          } catch {
            // Delivery code may not be available yet
          }
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [fetchOrder, orderId]);

  const handleCopyCode = () => {
    if (deliveryCode) {
      navigator.clipboard.writeText(deliveryCode.code);
      toast.success('Code copied to clipboard');
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    
    setCancelling(true);
    try {
      const response = await transactionsApi.cancelByBuyer(order.id);
      if (response.success) {
        toast.success('Order cancelled');
        fetchOrder();
      }
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const cancellationInfo = order ? getCancellationFeeInfo(order.status) : null;
  const canCancel = order ? getBuyerAllowedActions(order.status).includes('cancel') : false;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorState 
          title="Order not found"
          message="The order you're looking for doesn't exist or you don't have access to it."
          onRetry={fetchOrder}
        />
      </div>
    );
  }

  const timeline = getOrderTimeline(order.status);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-[#6B7280] hover:text-[#1A1A2E] transition-colors mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Orders
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-[#6B7280]">Order #{order.id}</p>
            <h1 className="text-xl font-bold text-[#1A1A2E] mt-1">{order.serviceTitle}</h1>
            <p className="text-sm text-[#6B7280] mt-1">Seller: {order.sellerName}</p>
          </div>
          <Badge variant={getStatusColor(order.status) as any} size="md">
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Clock className="w-4 h-4" />
            <span>Placed {formatDateTime(order.createdAt)}</span>
          </div>
          <span className="text-xl font-bold text-[#E94560]">
            {formatCurrency(order.finalPrice * order.quantity)}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-[#1A1A2E] mb-4">Order Timeline</h2>
        <div className="space-y-4">
          {timeline.map((step, index) => (
            <div key={step.label} className="flex items-start gap-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${step.completed ? 'bg-green-500 text-white' : step.current ? 'bg-[#0F3460] text-white' : 'bg-gray-200 text-gray-400'}
              `}>
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="flex-1 pt-1">
                <p className={`font-medium ${step.current ? 'text-[#0F3460]' : step.completed ? 'text-[#1A1A2E]' : 'text-[#6B7280]'}`}>
                  {step.label}
                </p>
                {step.current && (
                  <p className="text-sm text-[#6B7280] mt-0.5">Current status</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Code */}
      {deliveryCode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Your Delivery Code</h3>
              <p className="text-sm text-amber-700 mt-1">
                Share this code with the delivery agent when they arrive
              </p>
              
              <div className="flex items-center gap-3 mt-3">
                <div className="bg-white px-6 py-3 rounded-lg border-2 border-amber-300">
                  <span className="text-2xl font-mono font-bold tracking-widest text-amber-800">
                    {deliveryCode.code}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
              
              {deliveryCode.expiry && (
                <p className="text-sm text-amber-600 mt-2">
                  Expires {formatRelativeTime(deliveryCode.expiry)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Option */}
      {canCancel && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-[#1A1A2E] mb-3">Cancel Order</h3>
          
          {cancellationInfo && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#1A1A2E]">
                <p className="font-medium">Cancellation Fee Information:</p>
                <p className="text-[#6B7280] mt-1">
                  Cancellation charge: <strong>{cancellationInfo.charge}</strong>
                </p>
                <p className="text-[#6B7280]">
                  Refund amount: <strong>{cancellationInfo.refund}</strong>
                </p>
              </div>
            </div>
          )}
          
          <Button
            variant="danger"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel Order
          </Button>
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel this order? ${cancellationInfo ? `You will be charged ${cancellationInfo.charge} and receive ${cancellationInfo.refund} refund.` : ''}`}
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        isDangerous
        isLoading={cancelling}
      />
    </div>
  );
};
