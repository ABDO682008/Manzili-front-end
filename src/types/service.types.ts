export interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  minPrice?: number;
  categoryId: number;
  images: string[];
  sellerId: number;
  sellerName: string;
  sellerIsVIP: boolean;
  rating: number;
  reviewCount: number;
  duration?: string;
  status: 'Active' | 'Paused' | 'Draft';
  options?: ServiceOptionGroup[];
  autoAccept: boolean;
  viewCount?: number;
}

export interface ServiceOptionGroup {
  id?: number;
  name: string;
  isRequired: boolean;
  allowMultiple: boolean;
  options: ServiceOptionItem[];
}

export interface ServiceOptionItem {
  id?: number;
  name: string;
  price: number;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateServiceRequest {
  title: string;
  categoryId: number;
  description: string;
  price: number;
  minPrice?: number;
  duration?: string;
  images: File[];
  options?: ServiceOptionGroup[];
  autoAccept?: boolean;
  status?: 'Active' | 'Draft';
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {}
