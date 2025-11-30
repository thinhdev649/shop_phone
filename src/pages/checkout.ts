// Checkout page
import { renderHeader } from '../components/header';
import { cartManager } from '../utils/cart';
import { router } from '../utils/router';

export function renderCheckoutPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const cart = cartManager.getCart();

  // Redirect to cart if empty
  if (cart.items.length === 0) {
    router.navigate('/cart');
    return;
  }

  const subtotal = cart.total;
  const shipping = subtotal >= 2000000 ? 0 : 30000;
  const total = subtotal + shipping;

  app.innerHTML = `
    ${renderHeader()}
    <main class="main">
      <div class="container">
        <div class="breadcrumb">
          <a href="/" data-link>Trang chủ</a>
          <span>/</span>
          <a href="/cart" data-link>Giỏ hàng</a>
          <span>/</span>
          <span>Thanh toán</span>
        </div>

        <h1 class="page-title">Thanh toán</h1>

        <div class="checkout-container">
          <div class="checkout-form-section">
            <form id="checkout-form" class="checkout-form">
              <div class="checkout-section">
                <h2 class="checkout-section-title">Thông tin liên hệ</h2>
                <div class="form-group">
                  <label for="email" class="form-label">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    class="form-input" 
                    placeholder="email.cua.ban@example.com"
                    required
                  >
                </div>
                <div class="form-group">
                  <label for="phone" class="form-label">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    class="form-input" 
                    placeholder="0912 345 678"
                    required
                  >
                </div>
              </div>

              <div class="checkout-section">
                <h2 class="checkout-section-title">Địa chỉ giao hàng</h2>
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName" class="form-label">Tên *</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      class="form-input" 
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="lastName" class="form-label">Họ *</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName" 
                      class="form-input" 
                      required
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label for="address" class="form-label">Địa chỉ *</label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address" 
                    class="form-input" 
                    placeholder="Số nhà, tên đường"
                    required
                  >
                </div>

                <div class="form-group">
                  <label for="apartment" class="form-label">Căn hộ, tòa nhà (tùy chọn)</label>
                  <input 
                    type="text" 
                    id="apartment" 
                    name="apartment" 
                    class="form-input" 
                    placeholder="Tầng 4, Tòa nhà A"
                  >
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="city" class="form-label">Thành phố / Tỉnh *</label>
                    <input 
                      type="text" 
                      id="city" 
                      name="city" 
                      class="form-input" 
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="district" class="form-label">Quận / Huyện *</label>
                    <input 
                      type="text" 
                      id="district" 
                      name="district" 
                      class="form-input" 
                      required
                    >
                  </div>
                </div>
              </div>

              <div class="checkout-section">
                <h2 class="checkout-section-title">Phương thức thanh toán</h2>
                <div class="payment-methods">
                  <label class="payment-method">
                    <input type="radio" name="paymentMethod" value="cod" checked>
                    <span class="payment-method-label">
                      <span class="payment-icon">💵</span>
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </label>
                  <label class="payment-method">
                    <input type="radio" name="paymentMethod" value="card">
                    <span class="payment-method-label">
                      <span class="payment-icon">💳</span>
                      Thẻ tín dụng / Ghi nợ
                    </span>
                  </label>
                  <label class="payment-method">
                    <input type="radio" name="paymentMethod" value="momo">
                    <span class="payment-method-label">
                      <span class="payment-icon">📱</span>
                      Ví MoMo
                    </span>
                  </label>
                </div>

                <div id="card-details" class="card-details" style="display: none;">
                  <div class="form-group">
                    <label for="cardNumber" class="form-label">Số thẻ *</label>
                    <input 
                      type="text" 
                      id="cardNumber" 
                      name="cardNumber" 
                      class="form-input" 
                      placeholder="1234 5678 9012 3456"
                      maxlength="19"
                    >
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="expiryDate" class="form-label">Ngày hết hạn *</label>
                      <input 
                        type="text" 
                        id="expiryDate" 
                        name="expiryDate" 
                        class="form-input" 
                        placeholder="MM/YY"
                        maxlength="5"
                      >
                    </div>
                    <div class="form-group">
                      <label for="cvv" class="form-label">CVV *</label>
                      <input 
                        type="text" 
                        id="cvv" 
                        name="cvv" 
                        class="form-input" 
                        placeholder="123"
                        maxlength="4"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div class="checkout-actions">
                <a href="/cart" data-link class="btn btn-secondary">
                  ← Quay lại giỏ hàng
                </a>
                <button type="submit" class="btn btn-primary btn-large">
                  Đặt hàng - ${total.toLocaleString()} ₫
                </button>
              </div>
            </form>
          </div>

          <div class="checkout-summary">
            <h2 class="checkout-summary-title">Đơn hàng của bạn</h2>
            
            <div class="checkout-items">
              ${cart.items.map(item => `
                <div class="checkout-item">
                  <img src="${item.phone.image}" alt="${item.phone.name}" class="checkout-item-image">
                  <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.phone.name}</div>
                    <div class="checkout-item-quantity">SL: ${item.quantity}</div>
                  </div>
                  <div class="checkout-item-price">${(item.phone.price * item.quantity).toLocaleString()} ₫</div>
                </div>
              `).join('')}
            </div>

            <div class="checkout-summary-details">
              <div class="checkout-summary-row">
                <span>Tạm tính (${cart.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)</span>
                <span>${subtotal.toLocaleString()} ₫</span>
              </div>
              
              <div class="checkout-summary-row">
                <span>Phí vận chuyển</span>
                <span>${shipping === 0 ? 'MIỄN PHÍ' : shipping.toLocaleString() + ' ₫'}</span>
              </div>
              
              <hr class="checkout-divider">
              
              <div class="checkout-summary-row checkout-total">
                <span>Tổng cộng</span>
                <span>${total.toLocaleString()} ₫</span>
              </div>
            </div>

            <div class="checkout-security">
              <div class="security-badge">
                <span class="security-icon">🔒</span>
                <span>Thanh toán an toàn</span>
              </div>
              <p class="security-text">Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  setupCheckoutListeners();
}

function setupCheckoutListeners(): void {
  const form = document.getElementById('checkout-form') as HTMLFormElement;
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cardDetails = document.getElementById('card-details');

  // Handle payment method change
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (cardDetails) {
        cardDetails.style.display = value === 'card' ? 'block' : 'none';

        // Update required fields based on payment method
        const cardInputs = cardDetails.querySelectorAll('input');
        cardInputs.forEach(input => {
          input.required = value === 'card';
        });
      }
    });
  });

  // Format card number
  const cardNumberInput = document.getElementById('cardNumber') as HTMLInputElement;
  cardNumberInput?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    let value = target.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    target.value = value;
  });

  // Format expiry date
  const expiryInput = document.getElementById('expiryDate') as HTMLInputElement;
  expiryInput?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    target.value = value;
  });

  // Handle form submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const cart = cartManager.getCart();
    const subtotal = cart.total;
    const shipping = subtotal >= 2000000 ? 0 : 30000;
    const total = subtotal + shipping;

    const orderData = {
      contact: {
        email: formData.get('email'),
        phone: formData.get('phone'),
      },
      shipping: {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        address: formData.get('address'),
        apartment: formData.get('apartment'),
        city: formData.get('city'),
        district: formData.get('district'),
      },
      payment: {
        method: formData.get('paymentMethod'),
      },
      items: cart.items,
      total: total,
    };

    // In a real application, this would send to a backend API
    console.log('Order placed:', orderData);

    // Show success message
    alert(`✅ Đặt hàng thành công!\n\nTổng đơn hàng: ${total.toLocaleString()} ₫\n\nCảm ơn bạn đã mua sắm!`);

    // Clear cart and redirect to home
    cartManager.clearCart();
    router.navigate('/');
  });
}
