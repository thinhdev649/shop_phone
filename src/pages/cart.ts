// Shopping cart page
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';
import { router } from '../utils/router';

export function renderCartPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const cart = cartManager.getCart();

  app.innerHTML = `
    ${renderHeader()}
    <main class="main">
      <div class="container">
        <h1 class="page-title">Giỏ hàng</h1>

        ${cart.items.length === 0 ? `
          <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy thêm vài chiếc điện thoại để bắt đầu!</p>
            <a href="/phones" data-link class="btn btn-primary">Xem điện thoại</a>
          </div>
        ` : `
          <div class="cart-container">
            <div class="cart-items">
              ${cart.items.map(item => renderCartItem(item)).join('')}
            </div>

            <div class="cart-summary">
              <h2 class="cart-summary-title">Tổng đơn hàng</h2>
              
              <div class="cart-summary-row">
                <span>Tạm tính (${cart.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)</span>
                <span>${cart.total.toLocaleString()} ₫</span>
              </div>
              
              <div class="cart-summary-row">
                <span>Phí vận chuyển</span>
                <span>${cart.total >= 2000000 ? 'MIỄN PHÍ' : '30.000 ₫'}</span>
              </div>
              
              <hr class="cart-divider">
              
              <div class="cart-summary-row cart-total">
                <span>Tổng cộng</span>
                <span>${(cart.total + (cart.total >= 2000000 ? 0 : 30000)).toLocaleString()} ₫</span>
              </div>

              <button class="btn btn-primary btn-block" id="checkout-btn">
                Tiến hành thanh toán
              </button>

              <a href="/phones" data-link class="continue-shopping">
                ← Tiếp tục mua sắm
              </a>
            </div>
          </div>
        `}
      </div>
    </main>
  `;

  updateCartBadge();
  setupEventListeners();
}

function renderCartItem(item: any): string {
  return `
    <div class="cart-item" data-phone-id="${item.phone.id}">
      <img src="${item.phone.image}" alt="${item.phone.name}" class="cart-item-image">
      
      <div class="cart-item-details">
        <h3 class="cart-item-name">${item.phone.name}</h3>
        <p class="cart-item-price">${item.phone.price.toLocaleString()} ₫</p>
      </div>

      <div class="cart-item-quantity">
        <button class="quantity-btn qty-decrease" data-phone-id="${item.phone.id}">-</button>
        <input type="number" value="${item.quantity}" min="1" class="quantity-input qty-input" data-phone-id="${item.phone.id}">
        <button class="quantity-btn qty-increase" data-phone-id="${item.phone.id}">+</button>
      </div>

      <div class="cart-item-total">
        ${(item.phone.price * item.quantity).toLocaleString()} ₫
      </div>

      <button class="cart-item-remove" data-phone-id="${item.phone.id}" title="Xóa">
        ✕
      </button>
    </div>
  `;
}

function setupEventListeners(): void {
  // Remove item
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phoneId = (e.target as HTMLElement).dataset.phoneId;
      if (phoneId) {
        cartManager.removeItem(phoneId);
        renderCartPage();
      }
    });
  });

  // Decrease quantity
  document.querySelectorAll('.qty-decrease').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phoneId = (e.target as HTMLElement).dataset.phoneId;
      if (phoneId) {
        const input = document.querySelector(`.qty-input[data-phone-id="${phoneId}"]`) as HTMLInputElement;
        const current = parseInt(input.value);
        if (current > 1) {
          cartManager.updateQuantity(phoneId, current - 1);
          renderCartPage();
        }
      }
    });
  });

  // Increase quantity
  document.querySelectorAll('.qty-increase').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phoneId = (e.target as HTMLElement).dataset.phoneId;
      if (phoneId) {
        const input = document.querySelector(`.qty-input[data-phone-id="${phoneId}"]`) as HTMLInputElement;
        const current = parseInt(input.value);
        cartManager.updateQuantity(phoneId, current + 1);
        renderCartPage();
      }
    });
  });

  // Manual quantity input
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const phoneId = target.dataset.phoneId;
      const quantity = parseInt(target.value);

      if (phoneId && quantity > 0) {
        cartManager.updateQuantity(phoneId, quantity);
        renderCartPage();
      }
    });
  });

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  checkoutBtn?.addEventListener('click', () => {
    router.navigate('/checkout');
  });

  // Subscribe to cart changes
  cartManager.subscribe(() => {
    updateCartBadge();
  });
}
