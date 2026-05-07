import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { servicesApi, categoriesApi } from '../../api';
import { Spinner, ErrorState } from '../../components/common';
import { formatCurrency, getImageUrl } from '../../utils';
import type { HomeSectionItem } from '../../api/services.api';
import type { Category } from '../../api/categories.api';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }) };

export const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topDiscounts, setTopDiscounts] = useState<HomeSectionItem[]>([]);
  const [recommended, setRecommended] = useState<HomeSectionItem[]>([]);
  const [mostPurchased, setMostPurchased] = useState<HomeSectionItem[]>([]);
  const [regular, setRegular] = useState<HomeSectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const [homeRes, catRes] = await Promise.all([servicesApi.getHomeSections(4), categoriesApi.getCategories()]);

      if (homeRes.success && homeRes.data) {
        setTopDiscounts(homeRes.data.topDiscounts || []);
        setRecommended(homeRes.data.recommended || []);
        setMostPurchased(homeRes.data.mostPurchased || []);
        setRegular(homeRes.data.regular || []);
      }

      if (catRes.success && catRes.data) {
        setCategories(catRes.data.items || []);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHomeData(); }, [fetchHomeData]);

  const handleSearch = () => {
    if (searchQuery.trim()) navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    else navigate('/services');
  };

  if (error) return <ErrorState onRetry={fetchHomeData} />;

  const hasContent = topDiscounts.length > 0 || recommended.length > 0 || mostPurchased.length > 0 || regular.length > 0;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-dark via-heading-600 to-heading-700"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-warm/20 rounded-full blur-2xl translate-y-1/2 translate-x-1/4" />
        </div>

        <div className="relative z-10 px-6 py-10 md:px-12 md:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-sm mb-5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-warm" />
              سوق الخدمات المنزلية في مصر 🇪🇬
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              اعثر على الخدمة المثالية لمنزلك
            </h1>
            <p className="text-white/70 text-lg mb-8">
              اكتشف محترفين متخصصين مستعدين لمساعدتك اليوم.
            </p>

            <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-2xl max-w-xl">
              <Search className="w-5 h-5 text-surface-400 me-3 my-auto flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="دور على خدمة..."
                className="flex-1 py-3 px-2 outline-none text-heading-700 placeholder:text-neutral-400 bg-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95 bg-primary hover:bg-primary-dark shadow-warm"
              >
                بحث
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      {categories.length > 0 && (
        <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-heading-700">تصفّح الفئات</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i * 0.5}
                onClick={() => navigate(`/services?categoryId=${cat.id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-soft transition-all whitespace-nowrap flex-shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-primary font-bold text-sm">
                  {cat.nameAr?.[0]}
                </div>
                <span className="text-sm font-medium text-heading-600">{cat.nameAr}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="xl" />
        </div>
      )}

      {!loading && hasContent && (
        <>
          {topDiscounts.length > 0 && (
            <HomeSection title="أفضل الخصومات" link="/services?topDiscounts=true" items={topDiscounts} emoji="🔥" />
          )}
          {recommended.length > 0 && (
            <HomeSection title="موصى به لك" link="/services?isRecommended=true" items={recommended} emoji="⭐" />
          )}
          {mostPurchased.length > 0 && (
            <HomeSection title="الأكثر طلباً" link="/services?mostPurchased=true" items={mostPurchased} emoji="🏆" />
          )}
          {regular.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-surface-900">جميع الخدمات</h2>
                <Link to="/services" className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm font-medium">
                  عرض الكل <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {regular.map((service, i) => (
                  <ServiceCard key={service.id} service={service} index={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && !hasContent && !error && (
        <div className="text-center py-20">
          <p className="text-surface-400 text-lg">لا توجد خدمات متاحة حالياً.</p>
          <Link to="/services" className="mt-4 inline-block font-medium hover:underline" style={{ color: '#DD643C' }}>
            تصفّح جميع الخدمات
          </Link>
        </div>
      )}
    </div>
  );
};

const HomeSection = ({ title, link, items, emoji }: { title: string; link: string; items: HomeSectionItem[]; emoji: string }) => (
  <motion.section variants={fadeUp} initial="hidden" animate="visible">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h2>
      <Link to={link} className="flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: '#DD643C' }}>
        عرض الكل <ChevronLeft className="w-4 h-4" />
      </Link>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.slice(0, 4).map((service, i) => (
        <ServiceCard key={service.id} service={service} index={i} />
      ))}
    </div>
  </motion.section>
);

const ServiceCard = ({ service, index = 0 }: { service: HomeSectionItem; index?: number }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    custom={index * 0.3}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="bg-white rounded-2xl overflow-hidden group cursor-pointer"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}
  >
    <Link to={`/services/${service.id}`} className="block">
      <div className="aspect-video bg-surface-100 relative overflow-hidden">
        <img
          src={getImageUrl(service.imageUrl)}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-service.jpg'; }}
        />
      </div>
    </Link>

    <div className="p-4">
      <Link to={`/services/${service.id}`}>
        <h3 className="font-semibold text-surface-900 line-clamp-1 transition-colors text-sm hover:text-primary">
          {service.title}
        </h3>
      </Link>
      <p className="text-xs text-surface-500 mt-1 truncate">{service.providerName}</p>

      <div className="flex items-center gap-1 mt-2">
        <Star className="w-3.5 h-3.5" style={{ color: '#ED8E3C', fill: '#ED8E3C' }} />
        <span className="text-xs font-semibold text-surface-700">{(service.rating || 0).toFixed(1)}</span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="font-bold text-sm" style={{ color: '#DD643C' }}>{formatCurrency(service.basePrice)}</span>
        <Link
          to={`/services/${service.id}`}
          className="px-3 py-1.5 text-white text-xs font-semibold rounded-xl transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
        >
          عرض
        </Link>
      </div>
    </div>
  </motion.div>
);
