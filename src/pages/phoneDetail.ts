// Phone detail page
import { mockAPI } from '../api/mockApi';
import type { Phone } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';

export async function renderPhoneDetailPage(phoneId: string): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Loading...</div>';
  updateCartBadge();

  try {
    const phone = await mockAPI.getPhoneById(phoneId);

    if (!phone) {
      app.innerHTML = renderHeader() + '<div class="error">Phone not found</div>';
      return;
    }

    const brand = await mockAPI.getBrandById(phone.brand);

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <div class="container">
          <div class="breadcrumb">
            <a href="/" data-link>Home</a>
            <span>/</span>
            <a href="/brand/${phone.brand}" data-link>${brand?.name || phone.brand}</a>
            <span>/</span>
            <span>${phone.name}</span>
          </div>

          <div class="phone-detail">
            <div class="phone-detail-image">
              <img src="${phone.image}" alt="${phone.name}" loading="lazy">
            </div>

            <div class="phone-detail-info">
              <h1 class="phone-detail-title">${phone.name}</h1>
              <div class="phone-detail-brand">
                <span class="brand-badge">${brand?.name || phone.brand}</span>
                ${phone.inStock ? '<span class="stock-badge in-stock">In Stock</span>' : '<span class="stock-badge out-of-stock">Out of Stock</span>'}
              </div>
              
              <p class="phone-detail-price">$${phone.price.toLocaleString()}</p>
              
              <p class="phone-detail-description">${phone.description}</p>

              <div class="phone-detail-actions">
                <div class="quantity-selector">
                  <button class="quantity-btn" id="decrease-qty">-</button>
                  <input type="number" id="quantity" value="1" min="1" max="10" class="quantity-input">
                  <button class="quantity-btn" id="increase-qty">+</button>
                </div>
                <button class="btn btn-primary btn-large" id="add-to-cart" ${!phone.inStock ? 'disabled' : ''}>
                  ${phone.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              <div class="phone-specs">
                <h2 class="specs-title">Specifications</h2>
                <div class="specs-grid">
                  <div class="spec-item">
                    <span class="spec-label">Screen</span>
                    <span class="spec-value">${phone.specs.screen}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Processor</span>
                    <span class="spec-value">${phone.specs.cpu}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">RAM</span>
                    <span class="spec-value">${phone.specs.ram}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Storage</span>
                    <span class="spec-value">${phone.specs.storage}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Camera</span>
                    <span class="spec-value">${phone.specs.camera}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Battery</span>
                    <span class="spec-value">${phone.specs.battery}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Related phones section -->
          ${await renderRelatedPhones(phone)}
        </div>
      </main>
    `;

    updateCartBadge();
    setupEventListeners(phone);
  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Failed to load phone details</div>';
    console.error('Error rendering phone detail page:', error);
  }
}

async function renderRelatedPhones(phone: Phone): Promise<string> {
  const relatedPhones = await mockAPI.getPhonesByBrand(phone.brand);
  const filtered = relatedPhones.filter(p => p.id !== phone.id).slice(0, 4);

  if (filtered.length === 0) return '';

  return `
    <section class="related-phones">
      <h2 class="section-title">More from this brand</h2>
      <div class="phones-grid">
        ${filtered.map(p => `
          <div class="phone-card">
            <a href="/phone/${p.id}" data-link class="phone-image-link">
              <img src="${p.image}" alt="${p.name}" class="phone-image" loading="lazy">
            </a>
            <div class="phone-info">
              <h3 class="phone-name">
                <a href="/phone/${p.id}" data-link>${p.name}</a>
              </h3>
              <p class="phone-price">$${p.price.toLocaleString()}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function setupEventListeners(phone: Phone): void {
  const quantityInput = document.getElementById('quantity') as HTMLInputElement;
  const decreaseBtn = document.getElementById('decrease-qty');
  const increaseBtn = document.getElementById('increase-qty');
  const addToCartBtn = document.getElementById('add-to-cart');

  decreaseBtn?.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    if (current > 1) quantityInput.value = (current - 1).toString();
  });

  increaseBtn?.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    if (current < 10) quantityInput.value = (current + 1).toString();
  });

  addToCartBtn?.addEventListener('click', () => {
    const quantity = parseInt(quantityInput.value);
    cartManager.addItem(phone, quantity);
    
    addToCartBtn.textContent = `Added ${quantity} to Cart! ✓`;
    addToCartBtn.classList.add('btn-success');
    updateCartBadge();
    
    setTimeout(() => {
      addToCartBtn.textContent = 'Add to Cart';
      addToCartBtn.classList.remove('btn-success');
    }, 2000);
  });
}
