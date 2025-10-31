// Brands listing page
import { mockAPI } from '../api/mockApi';
import type {Brand} from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';

export async function renderBrandsPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Loading...</div>';
  updateCartBadge();

  try {
    const brands = await mockAPI.getBrands();

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
              ${brands.map(brand => renderBrandCard(brand)).join('')}
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

function renderBrandCard(brand: Brand): string {
  return `
    <a href="/brand/${brand.id}" data-link class="brand-card-large">
      <div class="brand-logo-large">${brand.logo}</div>
      <h3 class="brand-name">${brand.name}</h3>
      <p class="brand-description">${brand.description}</p>
      <span class="brand-link">View Phones →</span>
    </a>
  `;
}
