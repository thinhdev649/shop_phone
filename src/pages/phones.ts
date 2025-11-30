// All phones listing page
import { apiService } from '../api/apiService';
import type { Phone } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';

export async function renderPhonesPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Đang tải...</div>';
  updateCartBadge();

  try {
    // Fetch all categories to get all products
    const categories = await apiService.getCategories();

    // Fetch products for all categories
    const allProductsArrays = await Promise.all(
      categories.map(async (category) => {
        try {
          return await apiService.getProductsByCategory(category.code || category.id);
        } catch (e) {
          console.error(`Failed to load products for ${category.name}`, e);
          return [];
        }
      })
    );

    // Flatten array
    const phones = allProductsArrays.flat();

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <section class="page-header">
          <div class="container">
            <h1 class="page-title">Tất cả điện thoại</h1>
            <p class="page-subtitle">Khám phá bộ sưu tập smartphone đầy đủ của chúng tôi</p>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="phones-grid">
              ${phones.map(phone => renderPhoneCard(phone)).join('')}
            </div>
          </div>
        </section>
      </main>
    `;

    updateCartBadge();
  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Không thể tải danh sách điện thoại</div>';
    console.error('Error rendering phones page:', error);
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
        <p class="phone-price">${phone.price.toLocaleString()} ₫</p>
        <p class="phone-description">${phone.description}</p>
      </div>
    </div>
  `;
}
