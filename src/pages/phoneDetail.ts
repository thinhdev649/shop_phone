// Phone detail page
import { apiService } from '../api/apiService';
import type { Phone, ProductDetail } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';

export async function renderPhoneDetailPage(phoneId: string): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Đang tải...</div>';
  updateCartBadge();

  try {
    // Fetch detailed product info
    const productDetail = await apiService.getProductDetail(phoneId);

    if (!productDetail) {
      app.innerHTML = renderHeader() + '<div class="error">Không tìm thấy điện thoại</div>';
      return;
    }

    // Create display phone object from API data
    const displayPhone = createDisplayPhoneFromDetail(productDetail, phoneId);

    // We need to find the brand. Since the API doesn't return brand ID directly in product detail,
    // we might need to infer it or fetch categories. For now, let's try to guess or leave it empty.
    // Ideally, the product detail should contain the category/brand code.
    // If not available, we can skip the brand badge or fetch all categories to find where this product belongs (expensive).
    // Let's assume we can't easily get the brand name without extra calls, so we'll just show the name.

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <div class="container">
          <div class="breadcrumb">
            <a href="/" data-link>Trang chủ</a>
            <span>/</span>
            <span>${displayPhone.name}</span>
          </div>

          <div class="phone-detail">
            ${renderProductGallery(productDetail, displayPhone)}

            <div class="phone-detail-info">
              <h1 class="phone-detail-title">${displayPhone.name}</h1>
              <div class="phone-detail-brand">
                ${displayPhone.inStock ? '<span class="stock-badge in-stock">Còn hàng</span>' : '<span class="stock-badge out-of-stock">Hết hàng</span>'}
              </div>
              
              ${renderPriceSection(productDetail, displayPhone)}
              
              <p class="phone-detail-description">${displayPhone.description}</p>

              ${renderVariants(productDetail)}

              <div class="phone-detail-actions">
                <div class="quantity-selector">
                  <button class="quantity-btn" id="decrease-qty">-</button>
                  <input type="number" id="quantity" value="1" min="1" max="10" class="quantity-input">
                  <button class="quantity-btn" id="increase-qty">+</button>
                </div>
                <button class="btn btn-primary btn-large" id="add-to-cart" ${!displayPhone.inStock ? 'disabled' : ''}>
                  ${displayPhone.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                </button>
              </div>

              ${renderTechnicalSpecs(productDetail, displayPhone)}
            </div>
          </div>

          <!-- Related phones section -->
          <div id="related-phones-container"></div>
        </div>
      </main>
    `;

    updateCartBadge();
    setupEventListeners(displayPhone);
    setupVariantListeners();

    // Load related phones in background
    loadRelatedPhones(phoneId);

  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Không thể tải thông tin sản phẩm</div>';
    console.error('Error rendering phone detail page:', error);
  }
}

function createDisplayPhoneFromDetail(productDetail: ProductDetail, phoneId: string): Phone {
  const techSpecs = productDetail.technicalContent.reduce((acc, spec) => {
    acc[spec.key] = spec.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    id: phoneId,
    name: productDetail.name,
    brand: '', // We don't have this easily from detail
    price: productDetail.salePrice,
    image: productDetail.boxGallery[0]?.src || '',
    description: productDetail.boxLinked || '',
    specs: {
      screen: techSpecs['Kích thước màn hình'] || '',
      cpu: techSpecs['Chipset'] || techSpecs['Loại CPU'] || '',
      ram: techSpecs['Dung lượng RAM'] || '',
      storage: techSpecs['Bộ nhớ trong'] || '',
      camera: techSpecs['Camera sau'] || '',
      battery: techSpecs['Pin'] || '',
    },
    inStock: true,
    featured: false,
  };
}

// Render product gallery with multiple images
function renderProductGallery(productDetail: ProductDetail | null, displayPhone: Phone): string {
  if (productDetail && productDetail.boxGallery.length > 0) {
    const mainImage = productDetail.variants[0]?.src || productDetail.boxGallery[0]?.src || displayPhone.image;
    const thumbnails = productDetail.variants.map((variant, index) => `
      <div class="gallery-thumb ${index === 0 ? 'active' : ''}" data-src="${variant.src}" data-variant-name="${variant.name}">
        <img src="${variant.src}" alt="${variant.name}" loading="lazy">
      </div>
    `).join('');

    return `
      <div class="phone-detail-gallery">
        <div class="gallery-main">
          <img src="${mainImage}" alt="${displayPhone.name}" id="main-product-image" loading="lazy">
        </div>
        <div class="gallery-thumbnails">
          ${thumbnails}
        </div>
      </div>
    `;
  }

  return `
    <div class="phone-detail-image">
      <img src="${displayPhone.image}" alt="${displayPhone.name}" loading="lazy">
    </div>
  `;
}

// Render price section with sale price
function renderPriceSection(productDetail: ProductDetail | null, displayPhone: Phone): string {
  if (productDetail && productDetail.basePrice > productDetail.salePrice) {
    const discount = Math.round((1 - productDetail.salePrice / productDetail.basePrice) * 100);
    return `
      <div class="phone-detail-price-section">
        <p class="phone-detail-price">${formatVND(productDetail.salePrice)}</p>
        <p class="phone-detail-price-original">${formatVND(productDetail.basePrice)}</p>
        <span class="discount-badge">-${discount}%</span>
      </div>
    `;
  }

  const price = productDetail?.salePrice || displayPhone.price;
  return `<p class="phone-detail-price">${formatVND(price)}</p>`;
}

// Format price in VND
function formatVND(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Render color/storage variants
function renderVariants(productDetail: ProductDetail | null): string {
  if (!productDetail || productDetail.variants.length === 0) return '';

  return `
    <div class="phone-variants">
      <h3 class="variants-title">Màu sắc</h3>
      <div class="variants-grid">
        ${productDetail.variants.map((variant, index) => `
          <div class="variant-item ${index === 0 ? 'active' : ''}" data-variant-src="${variant.src}" data-variant-name="${variant.name}" data-variant-price="${variant.price}">
            <img src="${variant.src}" alt="${variant.name}" loading="lazy">
            <span class="variant-name">${variant.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ${productDetail.boxLinked ? `
      <div class="phone-storage-options">
        <h3 class="storage-title">Dung lượng</h3>
        <div class="storage-grid">
          ${productDetail.boxLinked.split(', ').map((storage, index) => `
            <button class="storage-option ${index === 0 ? 'active' : ''}">${storage}</button>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// Render technical specifications from API
function renderTechnicalSpecs(productDetail: ProductDetail | null, displayPhone: Phone): string {
  if (productDetail && productDetail.technicalContent.length > 0) {
    return `
      <div class="phone-specs">
        <h2 class="specs-title">Thông số kỹ thuật</h2>
        <div class="specs-grid detailed">
          ${productDetail.technicalContent.map(spec => `
            <div class="spec-item">
              <span class="spec-label">${spec.key}</span>
              <span class="spec-value">${spec.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Fallback to basic specs
  return `
    <div class="phone-specs">
      <h2 class="specs-title">Thông số kỹ thuật</h2>
      <div class="specs-grid">
        <div class="spec-item">
          <span class="spec-label">Màn hình</span>
          <span class="spec-value">${displayPhone.specs.screen}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Chip</span>
          <span class="spec-value">${displayPhone.specs.cpu}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">RAM</span>
          <span class="spec-value">${displayPhone.specs.ram}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Bộ nhớ</span>
          <span class="spec-value">${displayPhone.specs.storage}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Camera</span>
          <span class="spec-value">${displayPhone.specs.camera}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Pin</span>
          <span class="spec-value">${displayPhone.specs.battery}</span>
        </div>
      </div>
    </div>
  `;
}

// Setup variant selection listeners
function setupVariantListeners(): void {
  const variantItems = document.querySelectorAll('.variant-item');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  const mainImage = document.getElementById('main-product-image') as HTMLImageElement;
  const storageOptions = document.querySelectorAll('.storage-option');

  variantItems.forEach(item => {
    item.addEventListener('click', () => {
      variantItems.forEach(v => v.classList.remove('active'));
      item.classList.add('active');

      const newSrc = item.getAttribute('data-variant-src');
      if (mainImage && newSrc) {
        mainImage.src = newSrc;
      }
    });
  });

  galleryThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      galleryThumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      const newSrc = thumb.getAttribute('data-src');
      if (mainImage && newSrc) {
        mainImage.src = newSrc;
      }
    });
  });

  storageOptions.forEach(option => {
    option.addEventListener('click', () => {
      storageOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
    });
  });
}

async function loadRelatedPhones(currentPhoneId: string): Promise<void> {
  const container = document.getElementById('related-phones-container');
  if (!container) return;

  try {
    // Since we don't know the brand easily, we'll fetch a default category like 'apple' or 'samsung'
    // Or better, try to guess from the ID if possible, or just show some popular phones.
    // A simple heuristic: check if ID contains brand name
    let brandToFetch = 'apple';
    if (currentPhoneId.toLowerCase().includes('samsung')) brandToFetch = 'samsung';
    else if (currentPhoneId.toLowerCase().includes('xiaomi')) brandToFetch = 'xiaomi';
    else if (currentPhoneId.toLowerCase().includes('oppo')) brandToFetch = 'oppo';

    const relatedPhones = await apiService.getProductsByCategory(brandToFetch);
    const filtered = relatedPhones.filter(p => p.id !== currentPhoneId).slice(0, 4);

    if (filtered.length === 0) return;

    container.innerHTML = `
      <section class="related-phones">
        <h2 class="section-title">Sản phẩm tương tự</h2>
        <div class="phones-grid">
          ${filtered.map(p => `
            <div class="phone-card">
              <a href="/phone/${p.id}" data-link class="phone-image-link">
                <img src="${p.image}" alt="${p.name}" class="phone-image" loading="lazy">
              </a>
              <div class="phone-info">
                <h3 class="phone-name">
                  <a href="/phone/${p.id}" data-link>${p.name}</a>
                </h3>
                <p class="phone-price">${p.price.toLocaleString()} ₫</p>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  } catch (e) {
    console.error('Failed to load related phones', e);
  }
}

function setupEventListeners(phone: Phone): void {
  const quantityInput = document.getElementById('quantity') as HTMLInputElement;
  const decreaseBtn = document.getElementById('decrease-qty');
  const increaseBtn = document.getElementById('increase-qty');
  const addToCartBtn = document.getElementById('add-to-cart');

  decreaseBtn?.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    if (current > 1) quantityInput.value = (current - 1).toString();
  });

  increaseBtn?.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    if (current < 10) quantityInput.value = (current + 1).toString();
  });

  addToCartBtn?.addEventListener('click', () => {
    const quantity = parseInt(quantityInput.value);
    cartManager.addItem(phone, quantity);

    addToCartBtn.textContent = `Đã thêm ${quantity} vào giỏ! ✓`;
    addToCartBtn.classList.add('btn-success');
    updateCartBadge();

    setTimeout(() => {
      addToCartBtn.textContent = 'Thêm vào giỏ';
      addToCartBtn.classList.remove('btn-success');
    }, 2000);
  });
}
