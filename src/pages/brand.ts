// Brand page - shows phones by brand
import { mockAPI } from '../api/mockApi';
import type { Phone } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';

export async function renderBrandPage(brandId: string): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Loading...</div>';
  updateCartBadge();

  try {
    const [brand, phones] = await Promise.all([
      mockAPI.getBrandById(brandId),
      mockAPI.getPhonesByBrand(brandId)
    ]);

    if (!brand) {
      app.innerHTML = renderHeader() + '<div class="error">Brand not found</div>';
      return;
    }

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <section class="brand-hero">
          <div class="container">
            <div class="brand-header">
              <span class="brand-logo-large">${brand.logo}</span>
              <div>
                <h1 class="brand-title">${brand.name}</h1>
                <p class="brand-subtitle">${brand.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <h2 class="section-title">${brand.name} Phones (${phones.length})</h2>
            ${phones.length > 0 ? `
              <div class="phones-grid">
                ${phones.map(phone => renderPhoneCard(phone)).join('')}
              </div>
            ` : `
              <p class="empty-state">No phones available for this brand.</p>
            `}
          </div>
        </section>
      </main>
    `;

    updateCartBadge();
    setupEventListeners();
  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Failed to load brand page</div>';
    console.error('Error rendering brand page:', error);
  }
}

function renderPhoneCard(phone: Phone): string {
  return `
    <div class="phone-card">
      <a href="/phone/${phone.id}" data-link class="phone-image-link">
        <img src="${phone.image}" alt="${phone.name}" class="phone-image" loading="lazy">
      </a>
      <div class="phone-info">
        <h3 class="phone-name">
          <a href="/phone/${phone.id}" data-link>${phone.name}</a>
        </h3>
        <p class="phone-price">$${phone.price.toLocaleString()}</p>
        <p class="phone-description">${phone.description}</p>
        <button class="btn btn-primary add-to-cart-btn" data-phone-id="${phone.id}">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function setupEventListeners(): void {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.target as HTMLButtonElement;
      const phoneId = button.dataset.phoneId;
      if (!phoneId) return;

      const phone = await mockAPI.getPhoneById(phoneId);
      if (phone) {
        cartManager.addItem(phone);
        button.textContent = 'Added! ✓';
        button.classList.add('btn-success');
        updateCartBadge();
        
        setTimeout(() => {
          button.textContent = 'Add to Cart';
          button.classList.remove('btn-success');
        }, 2000);
      }
    });
  });
}
