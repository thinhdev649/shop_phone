// Categories page - Visual directory of all brands
import { apiService } from '../api/apiService';
import type { Category } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';

export async function renderCategoriesPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Đang tải...</div>';
  updateCartBadge();

  try {
    // Fetch all categories
    const categories = await apiService.getCategories();

    // For each category, fetch products to get count
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        try {
          const products = await apiService.getProductsByCategory(category.code || category.id);
          return { ...category, productCount: products.length };
        } catch (e) {
          console.error(`Failed to load products for ${category.name}`, e);
          return { ...category, productCount: 0 };
        }
      })
    );

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <!-- Categories Hero -->
        <section class="categories-hero">
          <div class="container">
            <h1 class="categories-hero-title">Khám phá theo thương hiệu</h1>
            <p class="categories-hero-subtitle">Chọn thương hiệu yêu thích để xem toàn bộ sản phẩm chính hãng</p>
          </div>
        </section>

        <!-- Categories Grid -->
        <section class="section">
          <div class="container">
            <div class="categories-showcase-grid">
              ${categoriesWithCount.map(category => renderCategoryShowcaseCard(category)).join('')}
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="section section-alt">
          <div class="container" style="text-align: center;">
            <h2 class="section-title">Không tìm thấy thương hiệu bạn muốn?</h2>
            <p style="color: var(--gray-600); margin-bottom: 24px;">Xem toàn bộ sản phẩm của chúng tôi</p>
            <a href="/phones" data-link class="btn btn-primary btn-large">Xem tất cả sản phẩm</a>
          </div>
        </section>
      </main>
      
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-column">
              <div class="footer-logo">
                <span class="logo-icon">⚡</span>
                <span class="logo-text">TechVision</span>
              </div>
              <p class="footer-desc">Hệ thống bán lẻ điện thoại di động chính hãng uy tín hàng đầu.</p>
            </div>
            <div class="footer-column">
              <h3 class="footer-title">Sản phẩm</h3>
              <ul class="footer-links">
                <li><a href="/brand/apple" data-link>Apple</a></li>
                <li><a href="/brand/samsung" data-link>Samsung</a></li>
                <li><a href="/brand/xiaomi" data-link>Xiaomi</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h3 class="footer-title">Chính sách</h3>
              <ul class="footer-links">
                <li><a href="#">Bảo hành</a></li>
                <li><a href="#">Đổi trả</a></li>
                <li><a href="#">Vận chuyển</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h3 class="footer-title">Liên hệ</h3>
              <ul class="footer-contact">
                <li>📞 1900 123 456</li>
                <li>✉️ support@techvision.vn</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2024 TechVision. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;

    updateCartBadge();
  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Không thể tải danh mục</div>';
    console.error('Error rendering categories page:', error);
  }
}

interface CategoryWithCount extends Category {
  productCount: number;
}


function renderCategoryShowcaseCard(category: CategoryWithCount): string {
  const logo = category.iconLink || category.image;
  return `
    <a href="/brand/${category.code || category.id}" data-link class="category-showcase-card">
      <div class="category-showcase-image">
        ${logo ? `<img src="${logo}" alt="${category.name}">` : `<div class="category-placeholder">${category.name.charAt(0)}</div>`}
      </div>
      <div class="category-showcase-content">
        <h3 class="category-showcase-name">${category.name}</h3>
        <p class="category-showcase-count">${category.productCount} sản phẩm</p>
        <span class="category-showcase-cta">Xem ngay →</span>
      </div>
    </a>
  `;
}
