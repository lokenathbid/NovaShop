// ─── Product Types ────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  type: 'color' | 'size' | 'storage' | 'material';
  inStock: boolean;
  priceModifier?: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  brand: string;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  tags: string[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  shippingInfo?: string;
  returnInfo?: string;
}

// ─── Category Types ───────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  featured?: boolean;
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
}

// ─── Order Types ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'upi' | 'cod' | 'netbanking' | 'wallet';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variant?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

// ─── User / Account Types ─────────────────────────────────────────────────────

export interface Address extends ShippingAddress {
  id: string;
  label: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

// ─── UI Utility Types ─────────────────────────────────────────────────────────

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'popular';

export interface FilterState {
  categories: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  inStock: boolean;
  brands: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  rating: number;
  text: string;
  date: string;
}
