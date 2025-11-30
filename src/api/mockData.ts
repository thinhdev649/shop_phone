// Mock data for phone shop
// Mock data for phone shop
import type { Brand, Phone } from '../types.ts';

export const brands: Brand[] = [
  {
    id: 'apple',
    name: 'Apple',
    logo: '🍎',
    description: 'Điện thoại cao cấp với hệ điều hành iOS'
  },
  {
    id: 'samsung',
    name: 'Samsung',
    logo: '📱',
    description: 'Tiên phong về công nghệ và đổi mới'
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi',
    logo: '🔥',
    description: 'Hiệu năng tốt nhất trong tầm giá'
  },
  {
    id: 'oppo',
    name: 'OPPO',
    logo: '💚',
    description: 'Điện thoại chuyên chụp ảnh'
  },
  {
    id: 'vivo',
    name: 'Vivo',
    logo: '💙',
    description: 'Thiết kế thời trang và sáng tạo'
  },
  {
    id: 'google',
    name: 'Google',
    logo: '🔷',
    description: 'Trải nghiệm Android thuần khiết'
  }
];

export const phones: Phone[] = [
  // Apple phones
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    brand: 'apple',
    price: 34990000,
    image: 'https://images.unsplash.com/photo-1696446702183-cbd5818c8b0c?w=400&h=400&fit=crop',
    description: 'Chiếc iPhone tối thượng với thiết kế titan và chip A17 Pro',
    specs: {
      screen: '6.7" Super Retina XDR',
      cpu: 'A17 Pro',
      ram: '8GB',
      storage: '256GB',
      camera: '48MP + 12MP + 12MP',
      battery: '4422mAh'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    brand: 'apple',
    price: 22990000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
    description: 'Dynamic Island và hiệu năng mạnh mẽ',
    specs: {
      screen: '6.1" Super Retina XDR',
      cpu: 'A16 Bionic',
      ram: '6GB',
      storage: '128GB',
      camera: '48MP + 12MP',
      battery: '3349mAh'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    brand: 'apple',
    price: 19990000,
    image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=400&h=400&fit=crop',
    description: 'iPhone đáng tin cậy với camera tuyệt vời',
    specs: {
      screen: '6.1" Super Retina XDR',
      cpu: 'A15 Bionic',
      ram: '6GB',
      storage: '128GB',
      camera: '12MP + 12MP',
      battery: '3279mAh'
    },
    inStock: true,
    featured: false
  },

  // Samsung phones
  {
    id: 'galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra',
    brand: 'samsung',
    price: 33990000,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    description: 'Flagship Samsung đỉnh cao với bút S Pen',
    specs: {
      screen: '6.8" Dynamic AMOLED 2X',
      cpu: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      camera: '200MP + 50MP + 12MP + 10MP',
      battery: '5000mAh'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'galaxy-s24',
    name: 'Galaxy S24',
    brand: 'samsung',
    price: 22990000,
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&h=400&fit=crop',
    description: 'Flagship nhỏ gọn với tính năng AI',
    specs: {
      screen: '6.2" Dynamic AMOLED 2X',
      cpu: 'Snapdragon 8 Gen 3',
      ram: '8GB',
      storage: '128GB',
      camera: '50MP + 12MP + 10MP',
      battery: '4000mAh'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'galaxy-z-fold5',
    name: 'Galaxy Z Fold5',
    brand: 'samsung',
    price: 40990000,
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=400&fit=crop',
    description: 'Điện thoại gập với các tính năng năng suất',
    specs: {
      screen: '7.6" Foldable AMOLED',
      cpu: 'Snapdragon 8 Gen 2',
      ram: '12GB',
      storage: '256GB',
      camera: '50MP + 12MP + 10MP',
      battery: '4400mAh'
    },
    inStock: true,
    featured: false
  },

  // Xiaomi phones
  {
    id: 'xiaomi-14-pro',
    name: 'Xiaomi 14 Pro',
    brand: 'xiaomi',
    price: 24990000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
    description: 'Flagship với hệ thống camera Leica',
    specs: {
      screen: '6.73" AMOLED',
      cpu: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      camera: '50MP + 50MP + 50MP',
      battery: '4880mAh'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'xiaomi-13',
    name: 'Xiaomi 13',
    brand: 'xiaomi',
    price: 15990000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    description: 'Hiệu năng và giá cả cân bằng',
    specs: {
      screen: '6.36" AMOLED',
      cpu: 'Snapdragon 8 Gen 2',
      ram: '8GB',
      storage: '256GB',
      camera: '50MP + 12MP + 10MP',
      battery: '4500mAh'
    },
    inStock: true,
    featured: false
  },

  // OPPO phones
  {
    id: 'oppo-find-x6-pro',
    name: 'OPPO Find X6 Pro',
    brand: 'oppo',
    price: 28990000,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop',
    description: 'Sức mạnh nhiếp ảnh',
    specs: {
      screen: '6.82" AMOLED',
      cpu: 'Snapdragon 8 Gen 2',
      ram: '12GB',
      storage: '256GB',
      camera: '50MP + 50MP + 50MP',
      battery: '5000mAh'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'oppo-reno-11',
    name: 'OPPO Reno 11',
    brand: 'oppo',
    price: 10990000,
    image: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=400&h=400&fit=crop',
    description: 'Tầm trung với camera xuất sắc',
    specs: {
      screen: '6.7" AMOLED',
      cpu: 'Dimensity 8200',
      ram: '8GB',
      storage: '256GB',
      camera: '50MP + 32MP + 8MP',
      battery: '4800mAh'
    },
    inStock: true,
    featured: false
  },

  // Vivo phones
  {
    id: 'vivo-x100-pro',
    name: 'Vivo X100 Pro',
    brand: 'vivo',
    price: 29990000,
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop',
    description: 'Flagship với ống kính Zeiss',
    specs: {
      screen: '6.78" AMOLED',
      cpu: 'Dimensity 9300',
      ram: '12GB',
      storage: '256GB',
      camera: '50MP + 50MP + 50MP',
      battery: '5400mAh'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'vivo-v29',
    name: 'Vivo V29',
    brand: 'vivo',
    price: 9990000,
    image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&h=400&fit=crop',
    description: 'Thiết kế thời trang và selfie tuyệt đẹp',
    specs: {
      screen: '6.78" AMOLED',
      cpu: 'Snapdragon 778G',
      ram: '8GB',
      storage: '256GB',
      camera: '50MP + 8MP + 2MP',
      battery: '4600mAh'
    },
    inStock: true,
    featured: false
  },

  // Google phones
  {
    id: 'pixel-8-pro',
    name: 'Pixel 8 Pro',
    brand: 'google',
    price: 24990000,
    image: 'https://images.unsplash.com/photo-1598618443855-232ee0f819f1?w=400&h=400&fit=crop',
    description: 'Camera Android tốt nhất với tính năng AI',
    specs: {
      screen: '6.7" LTPO OLED',
      cpu: 'Google Tensor G3',
      ram: '12GB',
      storage: '128GB',
      camera: '50MP + 48MP + 48MP',
      battery: '5050mAh'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'pixel-8',
    name: 'Pixel 8',
    brand: 'google',
    price: 16990000,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
    description: 'Android thuần khiết với camera tuyệt vời',
    specs: {
      screen: '6.2" OLED',
      cpu: 'Google Tensor G3',
      ram: '8GB',
      storage: '128GB',
      camera: '50MP + 12MP',
      battery: '4575mAh'
    },
    inStock: true,
    featured: false
  }
];
