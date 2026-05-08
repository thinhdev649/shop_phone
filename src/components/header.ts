// Header component
import { authService } from '../api/authService';
import { cartManager } from '../utils/cart';

export function renderHeader(): string {
  const isLoggedIn = authService.isAuthenticated();
  const displayName = authService.getDisplayName();

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

          <div class="header-actions">
            ${isLoggedIn ? `
              <span class="auth-user">${displayName}</span>
              <button type="button" class="auth-link" data-auth-action="logout">Đăng xuất</button>
            ` : `
              <a href="/login" data-link class="auth-link">Đăng nhập</a>
              <a href="/register" data-link class="btn btn-primary btn-small">Đăng ký</a>
            `}
            <a href="/cart" data-link class="cart-button" aria-label="Giỏ hàng">
              <span class="cart-icon">🛒</span>
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

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const logoutButton = target.closest('[data-auth-action="logout"]');

  if (!logoutButton) return;

  authService.logout();
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
});
