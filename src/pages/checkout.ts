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
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  app.innerHTML = `
    ${renderHeader()}
    <main class="main">
      <div class="container">
        <div class="breadcrumb">
          <a href="/" data-link>Home</a>
          <span>/</span>
          <a href="/cart" data-link>Cart</a>
          <span>/</span>
          <span>Checkout</span>
        </div>

        <h1 class="page-title">Checkout</h1>

        <div class="checkout-container">
          <div class="checkout-form-section">
            <form id="checkout-form" class="checkout-form">
              <div class="checkout-section">
                <h2 class="checkout-section-title">Contact Information</h2>
                <div class="form-group">
                  <label for="email" class="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    class="form-input" 
                    placeholder="your.email@example.com"
                    required
                  >
                </div>
                <div class="form-group">
                  <label for="phone" class="form-label">Phone Number *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    class="form-input" 
                    placeholder="+1 (555) 000-0000"
                    required
                  >
                </div>
              </div>

              <div class="checkout-section">
                <h2 class="checkout-section-title">Shipping Address</h2>
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName" class="form-label">First Name *</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      class="form-input" 
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="lastName" class="form-label">Last Name *</label>
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
                  <label for="address" class="form-label">Street Address *</label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address" 
                    class="form-input" 
                    placeholder="123 Main Street"
                    required
                  >
                </div>

                <div class="form-group">
                  <label for="apartment" class="form-label">Apartment, suite, etc. (optional)</label>
                  <input 
                    type="text" 
                    id="apartment" 
                    name="apartment" 
                    class="form-input" 
                    placeholder="Apt 4B"
                  >
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="city" class="form-label">City *</label>
                    <input 
                      type="text" 
                      id="city" 
                      name="city" 
                      class="form-input" 
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="state" class="form-label">State / Province *</label>
                    <input 
                      type="text" 
                      id="state" 
                      name="state" 
                      class="form-input" 
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="zipCode" class="form-label">ZIP / Postal Code *</label>
                    <input 
                      type="text" 
                      id="zipCode" 
                      name="zipCode" 
                      class="form-input" 
                      required
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label for="country" class="form-label">Country *</label>
                  <select id="country" name="country" class="form-select" required>
                    <option value="">Select a country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="VN">Vietnam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div class="checkout-section">
                <h2 class="checkout-section-title">Payment Method</h2>
                <div class="payment-methods">
                  <label class="payment-method">
                    <input type="radio" name="paymentMethod" value="card" checked>
                    <span class="payment-method-label">
                      <span class="payment-icon">💳</span>
                      Credit / Debit Card
                    </span>
                  </label>
                  <label class="payment-method">
                    <input type="radio" name="paymentMethod" value="paypal">
                    <span class="payment-method-label">
                      <span class="payment-icon">🅿️</span>
                      PayPal
                    </span>
                  </label>
                  <label class="payment-method">
                    <input type="radio" name="paymentMethod" value="cod">
                    <span class="payment-method-label">
                      <span class="payment-icon">💵</span>
                      Cash on Delivery
                    </span>
                  </label>
                </div>

                <div id="card-details" class="card-details">
                  <div class="form-group">
                    <label for="cardNumber" class="form-label">Card Number *</label>
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
                      <label for="expiryDate" class="form-label">Expiry Date *</label>
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
                  ← Back to Cart
                </a>
                <button type="submit" class="btn btn-primary btn-large">
                  Place Order - $${total.toFixed(2)}
                </button>
              </div>
            </form>
          </div>

          <div class="checkout-summary">
            <h2 class="checkout-summary-title">Order Summary</h2>
            
            <div class="checkout-items">
              ${cart.items.map(item => `
                <div class="checkout-item">
                  <img src="${item.phone.image}" alt="${item.phone.name}" class="checkout-item-image">
                  <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.phone.name}</div>
                    <div class="checkout-item-quantity">Qty: ${item.quantity}</div>
                  </div>
                  <div class="checkout-item-price">$${(item.phone.price * item.quantity).toLocaleString()}</div>
                </div>
              `).join('')}
            </div>

            <div class="checkout-summary-details">
              <div class="checkout-summary-row">
                <span>Subtotal (${cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>$${subtotal.toLocaleString()}</span>
              </div>
              
              <div class="checkout-summary-row">
                <span>Shipping</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping}</span>
              </div>
              
              <div class="checkout-summary-row">
                <span>Tax (10%)</span>
                <span>$${tax.toFixed(2)}</span>
              </div>
              
              <hr class="checkout-divider">
              
              <div class="checkout-summary-row checkout-total">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
              </div>
            </div>

            <div class="checkout-security">
              <div class="security-badge">
                <span class="security-icon">🔒</span>
                <span>Secure Checkout</span>
              </div>
              <p class="security-text">Your payment information is encrypted and secure</p>
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
    const shipping = subtotal >= 100 ? 0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    
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
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country'),
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
    alert(`✅ Order placed successfully!\n\nOrder Total: $${total.toFixed(2)}\n\nThank you for your purchase!`);
    
    // Clear cart and redirect to home
    cartManager.clearCart();
    router.navigate('/');
  });
}
