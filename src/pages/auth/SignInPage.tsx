import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { axiosInstance } from '../../api/axiosInstance';
import { useAuthStore } from '../../stores';
import type { APIRole } from '../../types';

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type FormData = z.infer<typeof schema>;

const defaultRoutes: Record<string, string> = {
  Buyer: '/home',
  Seller: '/seller/dashboard',
  Admin: '/admin/hub',
  DeliveryAgent: '/delivery',
};

export const SignInPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/login', data);
      const body = res.data?.data || res.data;
      const { accessToken, refreshToken, role } = body as {
        accessToken: string;
        refreshToken: string;
        role: APIRole;
      };

      if (!accessToken) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }

      setAuth(accessToken, refreshToken, role);

      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const name = payload.name || payload.fullName || 'مستخدم';
      toast.success(`أهلاً بعودتك، ${name}!`);

      const uiRole = role === 'Provider' ? 'Seller' : role;
      navigate(defaultRoutes[uiRole] || '/home', { replace: true });
    } catch {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-6 md:p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-heading-700 mb-1">أهلاً بيك 👋</h1>
        <p className="text-neutral-500">سجل دخولك عشان تكمل معانا</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)', border: '1px solid rgba(221, 100, 60, 0.2)', color: '#DD643C' }}>
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-heading-700 mb-1.5">البريد الإلكتروني</label>
          <input
            type="email"
            {...register('email')}
            placeholder="name@email.com"
            className={`w-full px-4 py-3 border-[1.5px] rounded-xl focus:border-primary focus:shadow-[0_0_0_3px_rgba(221,100,60,0.15)] outline-none transition-all bg-white ${
              errors.email ? 'border-primary' : 'border-surface-300'
            }`}
          />
          {errors.email && <p className="mt-1 text-xs" style={{ color: '#DD643C' }}>{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-heading-700 mb-1.5">كلمة المرور</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="أدخل كلمة المرور"
              className={`w-full px-4 py-3 ps-12 border-[1.5px] rounded-xl focus:border-primary focus:shadow-[0_0_0_3px_rgba(221,100,60,0.15)] outline-none transition-all bg-white ${
                errors.password ? 'border-primary' : 'border-surface-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs" style={{ color: '#DD643C' }}>{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 font-semibold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-primary hover:bg-primary-dark shadow-warm"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          تسجيل الدخول
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        لسه معندكش حساب؟{' '}
        <Link to="/signup" className="font-semibold text-primary hover:text-primary-dark transition-colors">
          سجل الآن
        </Link>
      </p>
    </motion.div>
  );
};
