// Category products page - demonstrates API 2: Get products by category
import { apiService } from '../api/apiService';
import { mockAPI } from '../api/mockApi';
import type { Phone } from '../types';
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';

export async function renderCategoryProductsPage(categoryId: string): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Loading products...</div>';
  updateCartBadge();

  try {
    // API 2: Get list of products by category
    const products = await apiService.getProductsByCategory(categoryId);
    const category = await apiService.getCategoryById(categoryId);

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <section class="page-header">
          <div class="container">
            <h1 class="page-title">${category.name}</h1>
            <p class="page-subtitle">${category.description || 'Browse products in this category'}</p>
          </div>
        </section>

        <section class="section">
          <div class="container">
            ${products.length > 0 ? `
              <div class="phones-grid">
                ${products.map(product => renderProductCard(product)).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <p>No products found in this category.</p>
                <a href="/categories" data-link class="btn btn-primary">Back to Categories</a>
              </div>
            `}
          </div>
        </section>
      </main>
    `;

    updateCartBadge();
    setupEventListeners();
  } catch (error) {
    app.innerHTML = `
      ${renderHeader()}
      <div class="container">
        <div class="error">
          <h2>Failed to load products</h2>
          <p>Unable to load products for this category. Please try again later.</p>
          <p class="error-detail">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <a href="/categories" data-link class="btn btn-primary">Back to Categories</a>
        </div>
      </div>
    `;
    console.error('Error rendering category products page:', error);
  }
}

function renderProductCard(product: Phone): string {
  return `
    <div class="phone-card">
      <a href="/phone/${product.id}" data-link class="phone-image-link">
        <img src="${product.image}" alt="${product.name}" class="phone-image" loading="lazy">
      </a>
      <div class="phone-info">
        <h3 class="phone-name">
          <a href="/phone/${product.id}" data-link>${product.name}</a>
        </h3>
        <p class="phone-price">$${product.price.toLocaleString()}</p>
        <p class="phone-description">${product.description}</p>
        <button class="btn btn-primary add-to-cart-btn" data-phone-id="${product.id}">
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
