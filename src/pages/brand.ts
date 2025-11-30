// Brand page
import { apiService } from '../api/apiService';
import type { Phone } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';

export async function renderBrandPage(brandId: string): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Đang tải...</div>';
  updateCartBadge();

  try {
    // Fetch all categories to find the current brand name
    const categories = await apiService.getCategories();
    const currentCategory = categories.find(c => (c.code || c.id) === brandId);
    const brandName = currentCategory ? currentCategory.name : brandId;

    // Fetch products for this brand
    const products = await apiService.getProductsByCategory(brandId);

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <section class="brand-hero">
          <div class="container">
            <div class="brand-header">
              ${currentCategory?.image ? `
                <div class="brand-logo-large">
                  <img src="${currentCategory.image}" alt="${brandName}">
                </div>
              ` : ''}
              <div>
                <div class="breadcrumb" style="margin-bottom: 8px; padding: 0;">
                  <a href="/" data-link>Trang chủ</a>
                  <span>/</span>
                  <span>${brandName}</span>
                </div>
                <h1 class="brand-title">${brandName}</h1>
                <p class="brand-subtitle">Danh sách sản phẩm chính hãng từ ${brandName}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            ${products.length > 0 ? `
              <div class="phones-grid">
                ${products.map(phone => renderPhoneCard(phone)).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <p>Chưa có sản phẩm nào cho thương hiệu này.</p>
                <a href="/" data-link class="btn btn-primary">Quay lại trang chủ</a>
              </div>
            `}
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
    app.innerHTML = renderHeader() + '<div class="error">Không thể tải thông tin thương hiệu</div>';
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
        <p class="phone-price">${phone.price.toLocaleString()} ₫</p>
        <p class="phone-description">${phone.description}</p>
      </div>
    </div>
  `;
}
