// Homepage
import { apiService } from '../api/apiService';
import type { Phone } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';

export async function renderHomePage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // 1. Render Header & Hero IMMEDIATELY
  app.innerHTML = `
    ${renderHeader()}
    <main class="main">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <span class="hero-badge">Công nghệ mới nhất 2024</span>
            <h1 class="hero-title">TechVision <br> Tương lai trong tầm tay</h1>
            <p class="hero-subtitle">Trải nghiệm đỉnh cao công nghệ với bộ sưu tập smartphone flagship hàng đầu thế giới. Chính hãng, uy tín và đẳng cấp.</p>
            <div class="hero-actions">
              <a href="/phones" data-link class="btn btn-primary btn-large">Khám phá ngay</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Placeholder -->
      <div id="home-content">
        <div class="container" style="padding: 60px 0; text-align: center;">
          <div class="loading-spinner"></div>
          <p style="margin-top: 16px; color: var(--gray-500);">Đang tải trải nghiệm...</p>
        </div>
      </div>
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

  try {
    // 2. Fetch Data in Background
    // We only need categories for the brand list, and specific products for featured sections
    const categories = await apiService.getCategories();

    // Filter for main brands we want to highlight
    const brandList = ['apple', 'samsung', 'xiaomi', 'oppo', 'vivo'];
    const displayBrands = categories.filter(c => brandList.includes((c.code || c.id).toLowerCase()));

    // Fetch "Featured" (Apple) and "New Arrivals" (Samsung)
    const [featuredProducts, newArrivals] = await Promise.all([
      apiService.getProductsByCategory('apple'),
      apiService.getProductsByCategory('samsung')
    ]);

    // 3. Update Content Area
    const contentContainer = document.getElementById('home-content');
    if (contentContainer) {
      contentContainer.innerHTML = `
        <!-- Shop by Brand -->
        <section class="section">
          <div class="container">
            <h2 class="section-title text-center">Thương hiệu nổi bật</h2>
            <div class="brands-grid">
              ${displayBrands.map(brand => {
        const logo = brand.iconLink || brand.image;
        return `
                <a href="/brand/${brand.code || brand.id}" data-link class="brand-card">
                  ${logo ? `<img src="${logo}" alt="${brand.name}" class="brand-logo">` : `<span class="brand-name">${brand.name}</span>`}
                </a>
              `}).join('')}
            </div>
            <div style="text-align: center; margin-top: 32px;">
              <a href="/categories" data-link class="btn btn-secondary btn-large">Xem tất cả danh mục</a>
            </div>
          </div>
        </section>

        <!-- Featured Products (Apple) -->
        <section class="section">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">Sản phẩm nổi bật</h2>
              <a href="/brand/apple" data-link class="view-all-link">Xem tất cả Apple <span class="arrow">→</span></a>
            </div>
            <div class="phones-grid">
              ${featuredProducts.slice(0, 4).map(phone => renderPhoneCard(phone)).join('')} 
            </div>
          </div>
        </section>

        <!-- Promo Banner -->
        <section class="section-banner">
          <div class="container">
            <div class="promo-banner">
              <div class="promo-content">
                <span class="promo-tag">Ưu đãi đặc biệt</span>
                <h2 class="promo-title">Nâng cấp lên iPhone 15 Pro</h2>
                <p class="promo-desc">Giảm ngay 2.000.000đ khi thu cũ đổi mới. Trả góp 0% lãi suất.</p>
                <a href="/brand/apple" data-link class="btn btn-white">Mua ngay</a>
              </div>
              <div class="promo-image">
                <img src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80" alt="iPhone 15 Pro" loading="lazy">
              </div>
            </div>
          </div>
        </section>

        <!-- New Arrivals (Samsung) -->
        <section class="section">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">Xu hướng mới</h2>
              <a href="/brand/samsung" data-link class="view-all-link">Xem tất cả Samsung <span class="arrow">→</span></a>
            </div>
            <div class="phones-grid">
              ${newArrivals.slice(0, 4).map(phone => renderPhoneCard(phone)).join('')} 
            </div>
          </div>
        </section>

        <!-- Why Choose Us -->
        <section class="section section-alt">
          <div class="container">
            <h2 class="section-title text-center">Tại sao chọn TechVision</h2>
            <div class="features-grid">
              ${renderFeatures()}
            </div>
          </div>
        </section>
      `;
    }
  } catch (error) {
    console.error('Error loading home page data:', error);
    const contentContainer = document.getElementById('home-content');
    if (contentContainer) {
      contentContainer.innerHTML = '<div class="error">Không thể tải sản phẩm. Vui lòng tải lại trang.</div>';
    }
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

function renderFeatures(): string {
  const features = [
    { icon: '✅', title: 'Sản phẩm chính hãng', desc: '100% điện thoại chính hãng từ các nhà phân phối ủy quyền' },
    { icon: '🚚', title: 'Giao hàng nhanh', desc: 'Miễn phí vận chuyển cho đơn hàng trên 2.000.000 ₫' },
    { icon: '💯', title: 'Giá tốt nhất', desc: 'Giá cả cạnh tranh với nhiều ưu đãi hấp dẫn' },
    { icon: '🔧', title: 'Bảo hành', desc: 'Bảo hành chính hãng cho tất cả sản phẩm' }
  ];

  return features.map(f => `
    <div class="feature-card">
      <div class="feature-icon">${f.icon}</div>
      <h3 class="feature-title">${f.title}</h3>
      <p class="feature-desc">${f.desc}</p>
    </div>
  `).join('');
}
