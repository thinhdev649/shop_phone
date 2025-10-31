// All phones listing page
import { mockAPI } from '../api/mockApi';
import type { Phone } from '../types.ts';
import { renderHeader, updateCartBadge } from '../components/header';
import { cartManager } from '../utils/cart';

export async function renderPhonesPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = renderHeader() + '<div class="loading">Loading...</div>';
  updateCartBadge();

  try {
    const phones = await mockAPI.getPhones();

    app.innerHTML = `
      ${renderHeader()}
      <main class="main">
        <section class="page-header">
          <div class="container">
            <h1 class="page-title">All Phones</h1>
            <p class="page-subtitle">Browse our complete collection of smartphones</p>
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
    setupEventListeners();
  } catch (error) {
    app.innerHTML = renderHeader() + '<div class="error">Failed to load phones</div>';
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
        <p class="phone-price">$${phone.price.toLocaleString()}</p>
        <p class="phone-description">${phone.description}</p>
        <button class="btn btn-primary add-to-cart-btn" data-phone-id="${phone.id}">
          Add to Cart
        </button>
      </div>
    </div>
  `;
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
