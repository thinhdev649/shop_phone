// Categories page - demonstrates the two integrated APIs
import { apiService } from '../api/apiService';
import type { Category } from '../types';
import { renderHeader, updateCartBadge } from '../components/header';

export async function renderCategoriesPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Loading categories...</div>';
  updateCartBadge();

  try {
    // API 1: Get list of categories
    const categories = await apiService.getCategories();

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <section class="page-header">
          <div class="container">
            <h1 class="page-title">Product Categories</h1>
            <p class="page-subtitle">Browse products by category</p>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="categories-grid">
              ${categories.map(category => renderCategoryCard(category)).join('')}
            </div>
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
          <h2>Failed to load categories</h2>
          <p>Unable to connect to the API. Please try again later.</p>
          <p class="error-detail">${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    `;
    console.error('Error rendering categories page:', error);
  }
}

function renderCategoryCard(category: Category): string {
  // Use iconLink from API or fallback to image
  const imageUrl = category.iconLink || category.image;
  
  return `
    <div class="category-card">
      <div class="category-icon-wrapper">
        ${imageUrl ? `<img src="${imageUrl}" alt="${category.name}" class="category-icon" loading="lazy">` : '<div class="category-icon-placeholder">📱</div>'}
      </div>
      <div class="category-info">
        <h3 class="category-name">${category.name}</h3>
        ${category.description ? `<p class="category-description">${category.description}</p>` : ''}
        <button class="btn btn-primary view-products-btn" data-category-id="${category.code || category.id}">
          View Products
        </button>
      </div>
    </div>
  `;
}

function setupEventListeners(): void {
  document.querySelectorAll('.view-products-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.target as HTMLButtonElement;
      const categoryId = button.dataset.categoryId;
      if (!categoryId) return;

      // Navigate to brand page (which shows products by category)
      window.history.pushState({}, '', `/brand/${categoryId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  });
}
