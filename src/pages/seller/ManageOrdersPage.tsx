import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export const ManageOrdersPage = () => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center py-20">
    <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
      <ShoppingBag className="w-10 h-10 text-amber-500" />
    </div>
    <h1 className="text-2xl font-bold text-surface-900 mb-3">إدارة الطلبات</h1>
    <p className="text-surface-500">
      ستتمكن قريباً من قبول أو رفض وتتبع جميع طلباتك من هنا.
    </p>
    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
      🚧 قريباً
    </div>
  </motion.div>
);
