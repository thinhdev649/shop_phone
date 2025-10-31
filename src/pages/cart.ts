// Shopping cart page
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';

export function renderCartPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const cart = cartManager.getCart();

  app.innerHTML = `
    ${renderHeader()}
    <main class="main">
      <div class="container">
        <h1 class="page-title">Shopping Cart</h1>

        ${cart.items.length === 0 ? `
          <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some phones to get started!</p>
            <a href="/phones" data-link class="btn btn-primary">Browse Phones</a>
          </div>
        ` : `
          <div class="cart-container">
            <div class="cart-items">
              ${cart.items.map(item => renderCartItem(item)).join('')}
            </div>

            <div class="cart-summary">
              <h2 class="cart-summary-title">Order Summary</h2>
              
              <div class="cart-summary-row">
                <span>Subtotal (${cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>$${cart.total.toLocaleString()}</span>
              </div>
              
              <div class="cart-summary-row">
                <span>Shipping</span>
                <span>${cart.total >= 100 ? 'FREE' : '$10'}</span>
              </div>
              
              <div class="cart-summary-row">
                <span>Tax (10%)</span>
                <span>$${(cart.total * 0.1).toFixed(2)}</span>
              </div>
              
              <hr class="cart-divider">
              
              <div class="cart-summary-row cart-total">
                <span>Total</span>
                <span>$${(cart.total + (cart.total >= 100 ? 0 : 10) + cart.total * 0.1).toFixed(2)}</span>
              </div>

              <button class="btn btn-primary btn-block" id="checkout-btn">
                Proceed to Checkout
              </button>

              <a href="/phones" data-link class="continue-shopping">
                ← Continue Shopping
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
        <p class="cart-item-price">$${item.phone.price.toLocaleString()}</p>
      </div>

      <div class="cart-item-quantity">
        <button class="quantity-btn qty-decrease" data-phone-id="${item.phone.id}">-</button>
        <input type="number" value="${item.quantity}" min="1" class="quantity-input qty-input" data-phone-id="${item.phone.id}">
        <button class="quantity-btn qty-increase" data-phone-id="${item.phone.id}">+</button>
      </div>

      <div class="cart-item-total">
        $${(item.phone.price * item.quantity).toLocaleString()}
      </div>

      <button class="cart-item-remove" data-phone-id="${item.phone.id}" title="Remove">
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
    alert('Checkout functionality will be implemented soon!');
  });

  // Subscribe to cart changes
  cartManager.subscribe(() => {
    updateCartBadge();
  });
}
