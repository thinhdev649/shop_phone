// Shopping cart management
// Shopping cart management
import type {Cart, Phone} from '../types.ts';

class CartManager {
  private cart: Cart = {
    items: [],
    total: 0
  };

  private listeners: Array<(cart: Cart) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        this.cart = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load cart from storage', e);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.notifyListeners();
  }

  private calculateTotal(): void {
    this.cart.total = this.cart.items.reduce(
      (sum, item) => sum + item.phone.price * item.quantity,
      0
    );
  }

  addItem(phone: Phone, quantity: number = 1): void {
    const existingItem = this.cart.items.find(item => item.phone.id === phone.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.items.push({ phone, quantity });
    }
    
    this.calculateTotal();
    this.saveToStorage();
  }

  removeItem(phoneId: string): void {
    this.cart.items = this.cart.items.filter(item => item.phone.id !== phoneId);
    this.calculateTotal();
    this.saveToStorage();
  }

  updateQuantity(phoneId: string, quantity: number): void {
    const item = this.cart.items.find(item => item.phone.id === phoneId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.calculateTotal();
      this.saveToStorage();
    }
  }

  clearCart(): void {
    this.cart.items = [];
    this.cart.total = 0;
    this.saveToStorage();
  }

  getCart(): Cart {
    return { ...this.cart };
  }

  getItemCount(): number {
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  subscribe(listener: (cart: Cart) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getCart()));
  }
}

export const cartManager = new CartManager();
