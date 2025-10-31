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
