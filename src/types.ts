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
  description?: string;
  image?: string;
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
