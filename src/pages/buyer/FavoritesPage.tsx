import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export const FavoritesPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center py-20"
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)' }}>
        <Heart className="w-10 h-10" style={{ color: '#ED8E3C' }} />
      </div>
      <h1 className="text-2xl font-bold text-surface-900 mb-3">المفضلة</h1>
      <p className="text-surface-500 mb-8">
        احفظ خدماتك المفضلة هنا للوصول إليها بسرعة. هذه الميزة قادمة قريباً!
      </p>
      <Link
        to="/services"
        className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-2xl transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
      >
        <Search className="w-4 h-4" />
        تصفّح الخدمات
      </Link>
    </motion.div>
  );
};
