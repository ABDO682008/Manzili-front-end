// Manzili Color System ONLY:
// Primary: #DD643C | Headings: #6B7B8C | Nature: #769E66 | Neutral: #9BA8B4 | Warm: #ED8E3C

export const STATUS_CONFIG: Record<string, {
  label: string;
  labelAr: string;
  color: string;
  bgClass: string;
  textClass: string;
}> = {
  Request:          { label: 'Sent',             labelAr: 'طلب مُرسَل',       color: 'heading',   bgClass: 'bg-[#6B7B8C]/10',   textClass: 'text-[#6B7B8C]' },
  RePriced:         { label: 'Price Updated',    labelAr: 'تم تعديل السعر',   color: 'warm',      bgClass: 'bg-[#ED8E3C]/10',  textClass: 'text-[#ED8E3C]' },
  AcceptedPrice:    { label: 'Price Accepted',     labelAr: 'تم قبول السعر',    color: 'nature',    bgClass: 'bg-[#769E66]/10',   textClass: 'text-[#769E66]' },
  Accepted:         { label: 'Accepted',          labelAr: 'مقبول',            color: 'nature',    bgClass: 'bg-[#769E66]/10',   textClass: 'text-[#769E66]' },
  PaymentFailed:    { label: 'Payment Failed',    labelAr: 'فشل الدفع',        color: 'primary',   bgClass: 'bg-[#DD643C]/10',   textClass: 'text-[#DD643C]' },
  Paid:             { label: 'Paid',              labelAr: 'تم الدفع',         color: 'nature',    bgClass: 'bg-[#769E66]/10',   textClass: 'text-[#769E66]' },
  InProgress:       { label: 'In Progress',        labelAr: 'جاري التنفيذ',     color: 'heading',   bgClass: 'bg-[#6B7B8C]/10',   textClass: 'text-[#6B7B8C]' },
  ReadyForShipping: { label: 'Ready',             labelAr: 'جاهز للتسليم',     color: 'warm',      bgClass: 'bg-[#ED8E3C]/10',  textClass: 'text-[#ED8E3C]' },
  OutForDelivery:   { label: 'Out for Delivery',  labelAr: 'في الطريق',        color: 'heading',   bgClass: 'bg-[#6B7B8C]/10',   textClass: 'text-[#6B7B8C]' },
  Delivered:        { label: 'Delivered',         labelAr: 'تم التسليم',       color: 'nature',    bgClass: 'bg-[#769E66]/10',   textClass: 'text-[#769E66]' },
  Completed:        { label: 'Completed',         labelAr: 'مكتمل',            color: 'nature',    bgClass: 'bg-[#769E66]/10',   textClass: 'text-[#769E66]' },
  CancelledByBuyer: { label: 'Cancelled',         labelAr: 'ملغي',             color: 'primary',   bgClass: 'bg-[#DD643C]/10',   textClass: 'text-[#DD643C]' },
  CancelledBySeller:{ label: 'Cancelled',         labelAr: 'ملغي من البائع',   color: 'primary',   bgClass: 'bg-[#DD643C]/10',   textClass: 'text-[#DD643C]' },
  Rejected:         { label: 'Rejected',          labelAr: 'مرفوض',            color: 'primary',   bgClass: 'bg-[#DD643C]/10',   textClass: 'text-[#DD643C]' },
  Expired:          { label: 'Expired',           labelAr: 'منتهي',            color: 'neutral',   bgClass: 'bg-[#9BA8B4]/10',   textClass: 'text-[#9BA8B4]' },
};
