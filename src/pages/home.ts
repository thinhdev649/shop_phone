// Homepage
import { apiService } from '../api/apiService';
import type { Phone, Category } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';

export async function renderHomePage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // Show loading state
  app.innerHTML = renderHeader() + '<div class="loading">Đang tải...</div>';
  updateCartBadge();

  try {
    // Fetch categories from API
    const categories = await apiService.getCategories();

    // Fetch products for each category
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        try {
          const products = await apiService.getProductsByCategory(category.code || category.id);
          return { ...category, products };
        } catch (e) {
          console.error(`Failed to load products for ${category.name}`, e);
          return { ...category, products: [] };
        }
      })
    );

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <!-- Hero Section -->
        <section class="hero">
          <div class="container">
            <h1 class="hero-title">Tìm chiếc điện thoại hoàn hảo của bạn</h1>
            <p class="hero-subtitle">Khám phá những mẫu smartphone mới nhất từ các thương hiệu hàng đầu</p>
          </div>
        </section>

        <!-- Category Sections -->
        ${categoriesWithProducts.map(cat => {
      if (cat.products.length === 0) return '';
      return `
            <section class="section">
              <div class="container">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 class="section-title" style="margin-bottom: 0;">${cat.name}</h2>
                    <a href="/brand/${cat.code || cat.id}" data-link class="view-all-link" style="color: var(--primary); font-weight: 600;">Xem tất cả &rarr;</a>
                </div>
                <div class="phones-grid">
                  ${cat.products.slice(0, 5).map(phone => renderPhoneCard(phone)).join('')} 
                </div>
              </div>
            </section>
            `;
    }).join('')}

        <!-- Why Choose Us -->
        <section class="section section-alt">
          <div class="container">
            <h2 class="section-title">Tại sao chọn chúng tôi</h2>
            <div class="features-grid">
              ${renderFeatures()}
            </div>
          </div>
        </section>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 PhoneShop. All rights reserved.</p>
        </div>
      </footer>
    `;

    updateCartBadge();
    // No event listeners needed for add to cart anymore on homepage
  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Tải trang thất bại. Vui lòng thử lại.</div>';
    console.error('Error rendering home page:', error);
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
