// Brands listing page - using real API categories
import { apiService } from '../api/apiService';
import type { Category } from '../types';
import { renderHeader, updateCartBadge } from '../components/header';

export async function renderBrandsPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Loading...</div>';
  updateCartBadge();

  try {
    const categories = await apiService.getCategories();

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <section class="page-header">
          <div class="container">
            <h1 class="page-title">All Brands</h1>
            <p class="page-subtitle">Choose from the world's leading phone manufacturers</p>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="brands-grid-large">
              ${categories.map(category => renderBrandCard(category)).join('')}
            </div>
          </div>
        </section>
      </main>
    `;

    updateCartBadge();
  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Failed to load brands</div>';
    console.error('Error rendering brands page:', error);
  }
}

function renderBrandCard(category: Category): string {
  // Use iconLink as image if available, otherwise show first letter
  const brandLogo = category.iconLink
    ? `<img src="${category.iconLink}" alt="${category.name}" style="width: 80px; height: 80px; object-fit: contain;">`
    : `<div style="font-size: 48px;">${category.name.charAt(0).toUpperCase()}</div>`;

  return `
    <a href="/brand/${category.code}" data-link class="brand-card-large">
      <div class="brand-logo-large">${brandLogo}</div>
      <h3 class="brand-name">${category.name}</h3>
      <p class="brand-description">${category.description || 'View all products'}</p>
      <span class="brand-link">View Phones →</span>
    </a>
  `;
}
