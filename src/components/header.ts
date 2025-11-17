// Header component
import { cartManager } from '../utils/cart';

export function renderHeader(): string {
  const itemCount = cartManager.getItemCount();
  
  return `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a href="/" data-link class="logo">
            <span class="logo-icon">📱</span>
            <span class="logo-text">PhoneShop</span>
          </a>
          
          <nav class="nav">
            <a href="/" data-link class="nav-link">Home</a>
            <a href="/brands" data-link class="nav-link">Brands</a>
            <a href="/phones" data-link class="nav-link">All Phones</a>
            <a href="/categories" data-link class="nav-link">Categories</a>
          </nav>
          
          <div class="header-actions">
            <a href="/cart" data-link class="cart-button">
              <span class="cart-icon">🛒</span>
              ${itemCount > 0 ? `<span class="cart-badge">${itemCount}</span>` : ''}
            </a>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function updateCartBadge(): void {
  const badge = document.querySelector('.cart-badge');
  const itemCount = cartManager.getItemCount();
  
  if (badge) {
    if (itemCount > 0) {
      badge.textContent = itemCount.toString();
    } else {
      badge.remove();
    }
  } else if (itemCount > 0) {
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
      const newBadge = document.createElement('span');
      newBadge.className = 'cart-badge';
      newBadge.textContent = itemCount.toString();
      cartButton.appendChild(newBadge);
    }
  }
}
