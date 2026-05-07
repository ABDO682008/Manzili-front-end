import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../hooks';
import { Button, Input } from '../../components/common';
import { usersApi } from '../../api';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.updateProfile(formData);
      if (response.success && response.data) {
        // Profile updated successfully
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await usersApi.uploadAvatar(file);
      if (response.success && response.data) {
        // Avatar uploaded successfully
        toast.success('Avatar updated');
      }
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#6B7B8C' }}>ملفي الشخصي</h1>

      {/* Avatar */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
              {user?.fullName?.[0]}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors" style={{ backgroundColor: '#6B7B8C' }}>
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <h2 className="text-xl font-semibold mt-4" style={{ color: '#6B7B8C' }}>
            {user?.fullName}
          </h2>
          <p style={{ color: '#9BA8B4' }}>{user?.email}</p>
          <span className="mt-2 px-3 py-1 rounded-full text-sm font-medium capitalize" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)', color: '#DD643C' }}>
            {user?.uiRole}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold" style={{ color: '#6B7B8C' }}>المعلومات الشخصية</h3>
          <Button
            variant={isEditing ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'إلغاء' : 'تعديل'}
          </Button>
        </div>

        <div className="space-y-4">
          <Input
            label="الاسم الكامل"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            disabled={!isEditing}
          />

          <Input
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={true}
          />

          {isEditing && (
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              fullWidth
              className="mt-4"
            >
              حفظ التغييرات
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
