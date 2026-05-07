import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShoppingCart, Store, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { axiosInstance } from '../../api/axiosInstance';

const schema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z
    .string()
    .min(8, 'كلمة المرور 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
    .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم')
    .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص'),
  role: z.union([z.literal('1'), z.literal('2')]),
});

type FormData = z.infer<typeof schema>;

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: '1' },
  });

  const password = watch('password', '');
  const selectedRole = watch('role');

  const requirements = [
    { label: '8 أحرف على الأقل', met: password.length >= 8 },
    { label: 'حرف كبير', met: /[A-Z]/.test(password) },
    { label: 'حرف صغير', met: /[a-z]/.test(password) },
    { label: 'رقم واحد', met: /[0-9]/.test(password) },
    { label: 'رمز خاص', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const metCount = requirements.filter((r) => r.met).length;

  const strengthColor =
    metCount <= 1 ? 'bg-[#DD643C]' : metCount <= 2 ? 'bg-[#ED8E3C]' : metCount <= 3 ? 'bg-[#9BA8B4]' : 'bg-[#769E66]';

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setEmailError(null);
    try {
      await axiosInstance.post('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: parseInt(data.role),
      });
      toast.success('تم إنشاء الحساب! سجّل دخولك الآن.');
      navigate('/signin', { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || '';
      if (status === 409 || msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('already')) {
        setEmailError('هذا البريد الإلكتروني مسجّل بالفعل');
      } else {
        toast.error('فشل إنشاء الحساب. حاول مجدداً.');
      }
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-heading-700 mb-1">إنشاء حساب جديد</h1>
        <p className="text-surface-500">انضم إلى منزلي اليوم</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-heading-700 mb-2">أريد...</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '1', icon: ShoppingCart, title: 'طلب خدمات', sub: 'تصفّح خدمات منزلية رائعة' },
              { value: '2', icon: Store, title: 'تقديم خدمات', sub: 'اعرض خدماتك وابدأ الكسب' },
            ].map(({ value, icon: Icon, title, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value as '1' | '2')}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === value
                    ? 'border-brand-500 bg-brand-50 shadow-[0_0_0_1px_rgba(79,70,229,0.3),0_4px_16px_rgba(79,70,229,0.15)]'
                    : 'border-surface-200 hover:border-brand-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === value ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${selectedRole === value ? 'text-brand-700' : 'text-surface-700'}`}>{title}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{sub}</p>
                </div>
                {selectedRole === value && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-heading-700 mb-1.5">الاسم الكامل</label>
          <input
            type="text"
            {...register('fullName')}
            placeholder="محمد أحمد"
            className={`w-full px-4 py-3 border-[1.5px] rounded-xl focus:border-primary focus:shadow-[0_0_0_3px_rgba(221,100,60,0.15)] outline-none transition-all bg-white ${errors.fullName ? 'border-primary' : 'border-surface-200'}`}
          />
          {errors.fullName && <p className="mt-1 text-xs" style={{ color: '#DD643C' }}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-heading-700 mb-1.5">البريد الإلكتروني</label>
          <input
            type="email"
            {...register('email')}
            placeholder="example@email.com"
            className={`w-full px-4 py-3 border-[1.5px] rounded-xl focus:border-primary focus:shadow-[0_0_0_3px_rgba(221,100,60,0.15)] outline-none transition-all bg-white ${(errors.email || emailError) ? 'border-primary' : 'border-surface-200'}`}
          />
          {errors.email && <p className="mt-1 text-xs" style={{ color: '#DD643C' }}>{errors.email.message}</p>}
          {emailError && (
            <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)', border: '1px solid rgba(221, 100, 60, 0.2)', color: '#DD643C' }}>
              {emailError}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-heading-700 mb-1.5">كلمة المرور</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="أنشئ كلمة مرور قوية"
              className={`w-full px-4 py-3 ps-12 border-[1.5px] rounded-xl focus:border-primary focus:shadow-[0_0_0_3px_rgba(221,100,60,0.15)] outline-none transition-all bg-white ${errors.password ? 'border-primary' : 'border-surface-200'}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < metCount ? strengthColor : 'bg-surface-200'}`} />
                ))}
              </div>
              <div className="space-y-1">
                {requirements.map((req) => (
                  <div key={req.label} className={`flex items-center gap-1.5 text-xs transition-colors ${req.met ? 'text-[#769E66]' : 'text-surface-400'}`}>
                    <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-0'}`} />
                    <span className={req.met ? 'line-through opacity-60' : ''}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 font-semibold rounded-xl text-white mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          إنشاء الحساب
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-surface-500">
        لديك حساب بالفعل؟{' '}
        <Link to="/signin" className="font-semibold hover:opacity-80 transition-colors" style={{ color: '#DD643C' }}>
          تسجيل الدخول
        </Link>
      </p>
    </motion.div>
  );
};
