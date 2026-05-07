import { useEffect, useState } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Eye, Users, Store, Truck } from 'lucide-react';
import { Spinner, EmptyState, Badge, Button, Modal } from '../../components/common';
import { formatDateTime } from '../../utils';
import toast from 'react-hot-toast';

interface Announcement {
  id: number;
  title: string;
  content: string;
  targetAudience: 'All' | 'Buyers' | 'Sellers' | 'Delivery';
  priority: 'Low' | 'Medium' | 'High';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'All' as Announcement['targetAudience'],
    priority: 'Medium' as Announcement['priority'],
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      setAnnouncements([
        {
          id: 1,
          title: 'Platform Maintenance',
          content: 'The platform will undergo scheduled maintenance on Sunday, 2 AM - 4 AM. Some features may be unavailable.',
          targetAudience: 'All',
          priority: 'High',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'New Seller Features',
          content: 'We have added bulk order management and improved analytics dashboard for sellers.',
          targetAudience: 'Sellers',
          priority: 'Medium',
          isActive: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          title: 'Delivery Partner Update',
          content: 'New delivery zones added: 6th of October and Sheikh Zayed areas now covered.',
          targetAudience: 'Delivery',
          priority: 'Medium',
          isActive: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      const newAnnouncement: Announcement = {
        id: Date.now(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast.success('Announcement created');
      setShowCreateModal(false);
      setFormData({ title: '', content: '', targetAudience: 'All', priority: 'Medium' });
    } catch {
      toast.error('Failed to create announcement');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    
    setProcessing(true);
    try {
      setAnnouncements(prev => prev.filter(a => a.id !== selectedAnnouncement.id));
      toast.success('Announcement deleted');
      setShowDeleteModal(false);
      setSelectedAnnouncement(null);
    } catch {
      toast.error('Failed to delete announcement');
    } finally {
      setProcessing(false);
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'All':
        return <Users className="w-4 h-4" />;
      case 'Sellers':
        return <Store className="w-4 h-4" />;
      case 'Delivery':
        return <Truck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="danger">High</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="gray">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>الإعلانات</h1>
          <p className="mt-1" style={{ color: '#9BA8B4' }}>إدارة الإعلانات المنشورة على المنصة</p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          إعلان جديد
        </Button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          type="default"
          title="لا توجد إعلانات"
          message="أنشئ إعلانك الأول للتواصل مع المستخدمين"
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Megaphone className="w-5 h-5" style={{ color: '#DD643C' }} />
                    <h3 className="font-semibold" style={{ color: '#6B7B8C' }}>{announcement.title}</h3>
                    {getPriorityBadge(announcement.priority)}
                    {!announcement.isActive && (
                      <Badge variant="gray">غير نشط</Badge>
                    )}
                  </div>

                  <p className="mb-3" style={{ color: '#9BA8B4' }}>{announcement.content}</p>

                  <div className="flex items-center gap-4 text-sm" style={{ color: '#9BA8B4' }}>
                    <span className="flex items-center gap-1">
                      {getAudienceIcon(announcement.targetAudience)}
                      {announcement.targetAudience}
                    </span>
                    <span>•</span>
                    <span>{formatDateTime(announcement.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-[#6B7280] hover:text-[#0F3460] hover:bg-gray-100 rounded-lg"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-[#6B7280] hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedAnnouncement(announcement); setShowDeleteModal(true); }}
                    className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFormData({ title: '', content: '', targetAudience: 'All', priority: 'Medium' }); }}
        title="Create Announcement"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowCreateModal(false); setFormData({ title: '', content: '', targetAudience: 'All', priority: 'Medium' }); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              isLoading={processing}
              disabled={!formData.title || !formData.content}
            >
              Create Announcement
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F3460]/20 outline-none"
              placeholder="Enter announcement title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F3460]/20 outline-none resize-none"
              placeholder="Enter announcement content..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                Target Audience
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as Announcement['targetAudience'] }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F3460]/20 outline-none"
              >
                <option value="All">All Users</option>
                <option value="Buyers">Buyers Only</option>
                <option value="Sellers">Sellers Only</option>
                <option value="Delivery">Delivery Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Announcement['priority'] }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F3460]/20 outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedAnnouncement(null); }}
        title="Delete Announcement"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setSelectedAnnouncement(null); }}>
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleDelete}
              isLoading={processing}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-[#6B7280]">
          Are you sure you want to delete "<strong>{selectedAnnouncement?.title}</strong>"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
