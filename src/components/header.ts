// Header component
import { cartManager } from '../utils/cart';

export function renderHeader(): string {

  return `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a href="/" data-link class="logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">TechVision</span>
          </a>
          
          <nav class="nav">
            <a href="/" data-link class="nav-link">Trang chủ</a>
            <a href="/categories" data-link class="nav-link">Danh mục</a>
            <a href="/phones" data-link class="nav-link">Tất cả sản phẩm</a>
          </nav>
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
