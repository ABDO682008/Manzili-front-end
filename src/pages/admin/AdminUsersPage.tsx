import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, UserX, UserCheck, MoreHorizontal } from 'lucide-react';
import { usersApi } from '../../api';
import { Spinner, EmptyState, Badge, Modal, Button } from '../../components/common';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';
import type { User } from '../../types';

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Action modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUsers({
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        pageSize: 20,
      });
      
      if (response.success && response.data) {
        setUsers(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch {
      toast.error('فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (status: 'Active' | 'Suspended' | 'Banned') => {
    if (!selectedUser || !actionReason) return;
    
    setProcessing(true);
    try {
      const response = await usersApi.updateUserStatus(Number(selectedUser.id), status, actionReason);
      if (response.success) {
        const statusText = status === 'Active' ? 'تم التفعيل' : status === 'Suspended' ? 'تم الإيقاف' : 'تم الحظر';
        toast.success(statusText);
        fetchUsers();
        setShowSuspendModal(false);
        setShowBanModal(false);
        setShowReactivateModal(false);
        setActionReason('');
        setSelectedUser(null);
      }
    } catch {
      toast.error('فشل تنفيذ الإجراء');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">نشط</Badge>;
      case 'Suspended':
        return <Badge variant="warning">موقوف</Badge>;
      case 'Banned':
        return <Badge variant="danger">محظور</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge variant="primary"><Shield className="w-3 h-3 ml-1" />أدمن</Badge>;
      case 'Seller':
        return <Badge variant="nature">بائع</Badge>;
      case 'DeliveryAgent':
        return <Badge variant="warm">مندوب</Badge>;
      default:
        return <Badge variant="neutral">مشتري</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>إدارة المستخدمين</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA8B4' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المستخدمين..."
              className="pr-10 pl-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none w-64"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
          >
            <option value="">كل الأدوار</option>
            <option value="Buyer">مشترين</option>
            <option value="Seller">بائعين</option>
            <option value="DeliveryAgent">مندوبين توصيل</option>
            <option value="Admin">أدمن</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
          >
            <option value="">كل الحالات</option>
            <option value="Active">نشط</option>
            <option value="Suspended">موقوف</option>
            <option value="Banned">محظور</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          type="default"
          title="لا يوجد مستخدمين"
          message="جرب تعديل البحث أو الفلاتر"
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-100">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الدور</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">تاريخ الانضمام</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: '#6B7B8C' }}>
                        {user.fullName?.[0]}{user.fullName?.split(' ')[1]?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#6B7B8C' }}>{user.fullName}</p>
                        <p className="text-sm" style={{ color: '#9BA8B4' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.uiRole)}</td>
                  <td className="px-6 py-4">{getStatusBadge((user as any).status || 'Active')}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#9BA8B4' }}>
                    {formatDate(new Date().toISOString())}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="p-2 rounded-xl hover:bg-surface-100 transition-colors"
                        style={{ color: '#9BA8B4' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#6B7B8C'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9BA8B4'}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {(user as any).status !== 'Suspended' && (user as any).status !== 'Banned' ? (
                        <>
                          <button
                            onClick={() => { setSelectedUser(user); setShowSuspendModal(true); }}
                            className="p-2 rounded-xl hover:bg-warm-50 transition-colors"
                            style={{ color: '#ED8E3C' }}
                            title="إيقاف"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setShowBanModal(true); }}
                            className="p-2 rounded-xl hover:bg-primary-50 transition-colors"
                            style={{ color: '#DD643C' }}
                            title="حظر"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setSelectedUser(user); setShowReactivateModal(true); }}
                          className="p-2 rounded-xl hover:bg-nature-50 transition-colors"
                          style={{ color: '#769E66' }}
                          title="تفعيل"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 transition-colors"
                style={{ color: '#6B7B8C' }}
              >
                السابق
              </button>
              <span className="text-sm" style={{ color: '#9BA8B4' }}>
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 transition-colors"
                style={{ color: '#6B7B8C' }}
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => { setShowSuspendModal(false); setActionReason(''); }}
        title="إيقاف المستخدم"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowSuspendModal(false); setActionReason(''); }}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={() => handleStatusChange('Suspended')}
              isLoading={processing}
              disabled={!actionReason}
            >
              إيقاف
            </Button>
          </>
        }
      >
        <p className="mb-4" style={{ color: '#9BA8B4' }}>
          إيقاف {selectedUser?.fullName}؟ مش هيبقى يقدر يستخدم المنصة لحد ما يتفعل تاني.
        </p>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7B8C' }}>
            سبب الإيقاف *
          </label>
          <textarea
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
            placeholder="اكتب السبب..."
            required
          />
        </div>
      </Modal>

      {/* Ban Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => { setShowBanModal(false); setActionReason(''); }}
        title="حظر المستخدم"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowBanModal(false); setActionReason(''); }}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={() => handleStatusChange('Banned')}
              isLoading={processing}
              disabled={!actionReason}
            >
              حظر نهائي
            </Button>
          </>
        }
      >
        <p className="mb-4" style={{ color: '#9BA8B4' }}>
          حظر {selectedUser?.fullName} نهائي؟ الإجراء ده صعب ترجعه.
        </p>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7B8C' }}>
            سبب الحظر *
          </label>
          <textarea
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
            placeholder="اكتب السبب..."
            required
          />
        </div>
      </Modal>

      {/* Reactivate Modal */}
      <Modal
        isOpen={showReactivateModal}
        onClose={() => { setShowReactivateModal(false); setActionReason(''); }}
        title="تفعيل المستخدم"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowReactivateModal(false); setActionReason(''); }}>
              إلغاء
            </Button>
            <Button
              onClick={() => handleStatusChange('Active')}
              isLoading={processing}
              disabled={!actionReason}
            >
              تفعيل
            </Button>
          </>
        }
      >
        <p className="mb-4" style={{ color: '#9BA8B4' }}>
          تفعيل {selectedUser?.fullName}؟ هيسترجع كل صلاحياته على المنصة.
        </p>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7B8C' }}>
            سبب التفعيل *
          </label>
          <textarea
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
            placeholder="اكتب السبب..."
            required
          />
        </div>
      </Modal>
    </div>
  );
};
