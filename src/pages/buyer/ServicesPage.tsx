import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { servicesApi, categoriesApi } from '../../api';
import { Spinner, ErrorState, EmptyState } from '../../components/common';
import { useDebounce } from '../../hooks';
import { formatCurrency, getImageUrl } from '../../utils';
import type { HomeSectionItem, SearchServiceItem } from '../../api/services.api';
import type { Category } from '../../api/categories.api';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }) };

export const ServicesPage = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<HomeSectionItem[] | SearchServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 450);

  useEffect(() => {
    categoriesApi.getCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data.items || []);
    }).catch(() => {});
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      if (debouncedSearch.trim()) {
        const res = await servicesApi.searchServices(debouncedSearch.trim(), page, 12);
        if (res.success && res.data) {
          setServices(res.data.items || []);
          setTotalPages(1);
        } else {
          setServices([]);
        }
      } else {
        const params: Record<string, unknown> = { page, pageSize: 12 };
        if (selectedCategory) params.categoryId = selectedCategory;
        if (searchParams.get('topDiscounts')) params.topDiscounts = true;
        if (searchParams.get('isRecommended')) params.isRecommended = true;
        if (searchParams.get('mostPurchased')) params.mostPurchased = true;

        const res = await servicesApi.getServices(params as any);
        if (res.success && res.data) {
          setServices((res.data as any).items || []);
          setTotalPages((res.data as any).totalPages || 1);
        } else {
          setServices([]);
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, page, searchParams]);

  useEffect(() => { fetchServices(); }, [fetchServices]);
  useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setPage(1);
  };

  const isSearchItem = (s: any): s is SearchServiceItem => 'thumbnailImageUrl' in s;
  const getImageForCard = (s: any) => isSearchItem(s) ? s.thumbnailImageUrl : s.imageUrl;
  const getPriceForCard = (s: any) => s.basePrice;

  if (error) return <ErrorState onRetry={fetchServices} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-surface-900">تصفّح الخدمات</h1>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن خدمة..."
              className="w-full pe-10 ps-4 py-2.5 border-[1.5px] border-surface-200 rounded-xl focus:border-primary outline-none transition-all text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-[1.5px] text-sm font-medium transition-all ${
              showFilters ? 'text-white border-primary' : 'border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
            style={showFilters ? { backgroundColor: '#DD643C', borderColor: '#DD643C' } : undefined}
          >
            <SlidersHorizontal className="w-4 h-4" />
            فلترة
          </button>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-2xl border border-surface-100 shadow-sm"
        >
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-surface-600 mb-1.5">الفئة</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-surface-200 rounded-xl text-sm outline-none focus:border-primary"
              >
                <option value="">كل الفئات</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                ))}
              </select>
            </div>
            <button onClick={clearFilters} className="text-sm font-medium px-2 py-2 hover:opacity-80 transition-opacity" style={{ color: '#DD643C' }}>
              مسح الفلاتر
            </button>
          </div>
        </motion.div>
      )}

      {(selectedCategory || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-surface-500">نشط:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)', color: '#DD643C' }}>
              بحث: "{searchQuery}" <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)', color: '#DD643C' }}>
              {categories.find(c => c.id === selectedCategory)?.nameAr || `فئة ${selectedCategory}`}
              <button onClick={() => setSelectedCategory(null)}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="xl" /></div>
      ) : services.length === 0 ? (
        <EmptyState type="services" actionLabel="مسح الفلاتر" onAction={clearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map((service: any, i) => (
              <motion.div
                key={service.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl overflow-hidden group"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <Link to={`/services/${service.id}`}>
                  <div className="aspect-video bg-surface-100 relative overflow-hidden">
                    <img
                      src={getImageUrl(getImageForCard(service))}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-service.jpg'; }}
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/services/${service.id}`}>
                    <h3 className="font-semibold text-surface-900 line-clamp-1 hover:text-primary transition-colors text-sm">
                      {service.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-surface-500 mt-1 truncate">{service.providerName}</p>
                  {service.rating !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3.5 h-3.5" style={{ color: '#ED8E3C', fill: '#ED8E3C' }} />
                      <span className="text-xs font-semibold text-surface-700">{(service.rating || 0).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-sm" style={{ color: '#DD643C' }}>{formatCurrency(getPriceForCard(service))}</span>
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-surface-200 rounded-xl text-sm text-surface-700 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                السابق
              </button>
              <span className="text-sm text-surface-500">صفحة {page} من {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 border border-surface-200 rounded-xl text-sm text-surface-700 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
