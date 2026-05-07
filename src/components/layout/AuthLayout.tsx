import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6B7B8C 0%, #9BA8B4 100%)' }}>
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
              <span className="text-white font-bold text-2xl">م</span>
            </div>
            <span className="font-bold text-3xl text-white">منزلي</span>
          </Link>
          <p className="mt-3 text-white/70">سوقك الموثوق للخدمات المنزلية</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <Outlet />
        </div>

        <p className="mt-8 text-center text-sm text-white/50">
          © 2025 منزلي. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
};
