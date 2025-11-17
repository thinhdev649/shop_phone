// Brand page - shows phones by category using real API
import { apiService } from '../api/apiService';
import type { Phone } from '../types';
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';

export async function renderBrandPage(brandId: string): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Loading...</div>';
  updateCartBadge();

  try {
    // Fetch products by category and all categories to get brand info
    const [phones, categories] = await Promise.all([
      apiService.getProductsByCategory(brandId),
      apiService.getCategories()
    ]);

    // Find the current category/brand
    const brand = categories.find(cat => cat.code === brandId);

    if (!brand) {
      app.innerHTML = renderHeader() + '<div class="error">Brand not found</div>';
      return;
    }

    // Use iconLink as logo if available
    const brandLogo = brand.iconLink
      ? `<img src="${brand.iconLink}" alt="${brand.name}" style="width: 80px; height: 80px; object-fit: contain;">`
      : `<div style="font-size: 48px;">${brand.name.charAt(0).toUpperCase()}</div>`;

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <section class="brand-hero">
          <div class="container">
            <div class="brand-header">
              <span class="brand-logo-large">${brandLogo}</span>
              <div>
                <h1 class="brand-title">${brand.name}</h1>
                <p class="brand-subtitle">${brand.description || 'Premium quality products'}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <h2 class="section-title">${brand.name} Products (${phones.length})</h2>
            ${phones.length > 0 ? `
              <div class="phones-grid">
                ${phones.map(phone => renderPhoneCard(phone)).join('')}
              </div>
            ` : `
              <p class="empty-state">No products available for this brand.</p>
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
    btn.addEventListener('click', (e) => {
      const button = e.target as HTMLButtonElement;
      const phoneId = button.dataset.phoneId;
      if (!phoneId) return;

      // Get phone data from the current page
      const phoneCard = button.closest('.phone-card');
      if (!phoneCard) return;

      const nameElement = phoneCard.querySelector('.phone-name a');
      const priceElement = phoneCard.querySelector('.phone-price');
      const imageElement = phoneCard.querySelector('.phone-image') as HTMLImageElement;
      const descElement = phoneCard.querySelector('.phone-description');

      if (!nameElement || !priceElement || !imageElement) return;

      const phone: Phone = {
        id: phoneId,
        name: nameElement.textContent || '',
        brand: '',
        price: parseFloat(priceElement.textContent?.replace(/[^0-9.]/g, '') || '0'),
        image: imageElement.src,
        description: descElement?.textContent || '',
        specs: { screen: '', cpu: '', ram: '', storage: '', camera: '', battery: '' },
        inStock: true,
        featured: false
      };

      cartManager.addItem(phone);
      button.textContent = 'Added! ✓';
      button.classList.add('btn-success');
      updateCartBadge();

      setTimeout(() => {
        button.textContent = 'Add to Cart';
        button.classList.remove('btn-success');
      }, 2000);
    });
  });
}
