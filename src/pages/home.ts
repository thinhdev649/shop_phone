// Homepage
import { mockAPI } from '../api/mockApi';
import { apiService } from '../api/apiService';
import type { Phone, Category } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';

export async function renderHomePage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  // Show loading state
  app.innerHTML = renderHeader() + '<div class="loading">Loading...</div>';
  updateCartBadge();

  try {
    // Fetch categories from API and featured phones from mock
    const [categories, featuredPhones] = await Promise.all([
      apiService.getCategories(),
      mockAPI.getFeaturedPhones()
    ]);

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <!-- Hero Section -->
        <section class="hero">
          <div class="container">
            <h1 class="hero-title">Find Your Perfect Phone</h1>
            <p class="hero-subtitle">Explore the latest smartphones from top brands</p>
          </div>
        </section>

        <!-- Brands Section -->
        <section class="section">
          <div class="container">
            <h2 class="section-title">Shop by Brand</h2>
            <div class="brands-grid">
              ${categories.map(category => renderCategoryCard(category)).join('')}
            </div>
          </div>
        </section>

        <!-- Featured Phones -->
        <section class="section section-alt">
          <div class="container">
            <h2 class="section-title">Featured Phones</h2>
            <div class="phones-grid">
              ${featuredPhones.map(phone => renderPhoneCard(phone)).join('')}
            </div>
          </div>
        </section>

        <!-- Why Choose Us -->
        <section class="section">
          <div class="container">
            <h2 class="section-title">Why Choose Us</h2>
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
    setupEventListeners();
  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Failed to load page. Please try again.</div>';
    console.error('Error rendering home page:', error);
  }
}

function renderCategoryCard(category: Category): string {
  const categoryId = category.code || category.id;
  return `
    <a href="/brand/${categoryId}" data-link class="brand-card">
      <div class="brand-logo">
        ${category.iconLink 
          ? `<img src="${category.iconLink}" alt="${category.name}" class="brand-icon-img" loading="lazy">` 
          : '📱'}
      </div>
      <h3 class="brand-name">${category.name}</h3>
    </a>
  `;
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

function renderFeatures(): string {
  const features = [
    { icon: '✅', title: 'Authentic Products', desc: '100% genuine phones from authorized distributors' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Free shipping on all orders above $100' },
    { icon: '💯', title: 'Best Prices', desc: 'Competitive prices with regular discounts' },
    { icon: '🔧', title: 'Warranty', desc: 'Official warranty on all products' }
  ];

  return features.map(f => `
    <div class="feature-card">
      <div class="feature-icon">${f.icon}</div>
      <h3 class="feature-title">${f.title}</h3>
      <p class="feature-desc">${f.desc}</p>
    </div>
  `).join('');
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
