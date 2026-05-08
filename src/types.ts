// Core types for the phone shop

export interface Phone {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  specs: {
    screen: string;
    cpu: string;
    ram: string;
    storage: string;
    camera: string;
    battery: string;
  };
  inStock: boolean;
  featured: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export interface CartItem {
  phone: Phone;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// API Response types
export interface Category {
  id: string;
  name: string;
  code?: string;
  description?: string;
  image?: string;
  iconLink?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
  message?: string;
}

// Product Detail API types
export interface TechnicalSpec {
  key: string;
  value: string;
}

export interface ProductVariant {
  href: string;
  name: string;
  src: string;
  price: number;
  priority: number;
}

export interface ProductGalleryImage {
  title: string;
  alt: string;
  src: string;
  priority: number;
}

export interface ProductDetail {
  name: string;
  technicalContent: TechnicalSpec[];
  boxLinked: string;
  salePrice: number;
  basePrice: number;
  variants: ProductVariant[];
  boxGallery: ProductGalleryImage[];
}

// Authentication API types
export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role?: 'ADMIN' | 'USER' | string;
  adminSecret?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthSession {
  token?: string;
  tokenType?: string;
  expiresAt?: number;
  username?: string;
  fullName?: string;
  email?: string;
  role?: string;
  raw: unknown;
}

export interface ProductListItem {
  code: string;
  name: string;
  iconLink?: string;
  cloneHref?: string;
  installment?: number;
  priceShow?: number;
  priceThrough?: number;
  percentDetail?: string;
  productDisplay?: string;
  productStorage?: string;
  couponPrice?: string | null;
  priority?: number;
  status?: number;
  categoryCode?: string;
}

export interface ProductPage {
  content: ProductListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ProductSearchParams {
  keyword?: string;
  categoryCode?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page?: number;
  size?: number;
}

export interface ProductUpsertReq {
  code: string;
  name: string;
  iconLink?: string;
  cloneHref?: string;
  installment?: number;
  priceShow: number;
  priceThrough?: number;
  percentDetail?: string;
  productDisplay?: string;
  productStorage?: string;
  couponPrice?: string;
  priority?: number;
  status?: number;
  categoryCode: string;
}

export interface CategoryAdminItem {
  code: string;
  name: string;
  iconLink?: string;
  cloneHref?: string;
  priority?: number;
  status?: number;
  createdDate?: string;
  updatedDate?: string;
}

export interface CategoryUpsertReq {
  code: string;
  name: string;
  iconLink?: string;
  cloneHref?: string;
  priority?: number;
  status?: number;
}

export interface ProductDetailAdminItem {
  id: string;
  productId: string;
  code: string;
  name?: string;
  technicalContent?: TechnicalSpec[] | string;
  boxLinked?: string;
  salePrice?: number;
  basePrice?: number;
  status?: number;
  createdDate?: string;
  updatedDate?: string;
}

export interface ProductDetailUpsertReq {
  productId: string;
  code: string;
  name?: string;
  technicalContent?: string;
  boxLinked?: string;
  salePrice?: number;
  basePrice?: number;
  status?: number;
}

export interface ProductVariantAdminItem {
  id: string;
  parent: string;
  href?: string;
  name?: string;
  src?: string;
  price?: number;
  priority?: number;
  status?: number;
  createdDate?: string;
  updatedDate?: string;
}

export interface ProductVariantUpsertReq {
  parent: string;
  href?: string;
  name?: string;
  src?: string;
  price?: number;
  priority?: number;
  status?: number;
}

export interface BoxGalleryAdminItem {
  id: string;
  parent: string;
  title?: string;
  alt?: string;
  src?: string;
  priority?: number;
  status?: number;
  createdDate?: string;
  updatedDate?: string;
}

export interface BoxGalleryUpsertReq {
  parent: string;
  title?: string;
  alt?: string;
  src?: string;
  priority?: number;
  status?: number;
}
