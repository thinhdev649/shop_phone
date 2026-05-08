import { adminProductService } from '../api/adminProductService';
import { apiService } from '../api/apiService';
import { authService } from '../api/authService';
import { renderHeader, updateCartBadge } from '../components/header';
import { router } from '../utils/router';
import type {
  BoxGalleryAdminItem,
  BoxGalleryUpsertReq,
  Category,
  CategoryAdminItem,
  CategoryUpsertReq,
  ProductDetailAdminItem,
  ProductDetailUpsertReq,
  ProductListItem,
  ProductPage,
  ProductSearchParams,
  ProductUpsertReq,
  ProductVariantAdminItem,
  ProductVariantUpsertReq,
} from '../types';

type AdminResourceKey = 'categories' | 'details' | 'variants' | 'gallery';
type AdminViewKey = 'products' | 'resources';

type AdminResourceItem = CategoryAdminItem | ProductDetailAdminItem | ProductVariantAdminItem | BoxGalleryAdminItem;
const RESOURCE_DISPLAY_LIMIT = 100;

let categories: Category[] = [];
let currentProducts: ProductListItem[] = [];
let currentPage: ProductPage | null = null;
let currentParams: ProductSearchParams = {
  page: 0,
  size: 10,
};
let editingProductCode = '';
let activeAdminView: AdminViewKey = 'products';
let activeResourceKey: AdminResourceKey = 'categories';
let editingResourceId = '';
let resourceLoadId = 0;
let categoryAdminItems: CategoryAdminItem[] = [];
let productDetailItems: ProductDetailAdminItem[] = [];
let productVariantItems: ProductVariantAdminItem[] = [];
let boxGalleryItems: BoxGalleryAdminItem[] = [];

export async function renderAdminProductsPage(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  if (!authService.isAuthenticated()) {
    router.navigate('/login');
    return;
  }

  app.innerHTML = `
    ${renderHeader()}
    <main class="main admin-page">
      <div class="container">
        <div class="admin-loading">
          <div class="loading-spinner"></div>
          <p>Đang tải trang quản trị...</p>
        </div>
      </div>
    </main>
  `;

  updateCartBadge();

  if (!authService.hasRole('ADMIN')) {
    renderUnauthorized(app);
    return;
  }

  try {
    categories = await apiService.getCategories();
  } catch (error) {
    console.error('Failed to load categories for admin page', error);
    categories = [];
  }

  app.innerHTML = renderAdminShell();
  updateCartBadge();
  setupAdminListeners();
  await Promise.all([
    loadProducts(),
    loadAdminResource(activeResourceKey),
    loadAdminOverviewStats(),
  ]);
}

function renderUnauthorized(app: HTMLDivElement): void {
  app.innerHTML = `
    ${renderHeader()}
    <main class="main admin-page">
      <div class="container">
        <section class="admin-empty-state">
          <h1>Không có quyền truy cập</h1>
          <p>Tài khoản hiện tại không có quyền ADMIN để mở màn quản lý.</p>
          <a href="/" data-link class="btn btn-primary">Về trang chủ</a>
        </section>
      </div>
    </main>
  `;
}

function renderAdminShell(): string {
  return `
    ${renderHeader()}
    <main class="main admin-page">
      <div class="container">
        <section class="admin-hero">
          <div>
            <span class="admin-eyebrow">Trang quản trị</span>
            <h1>Quản trị cửa hàng điện thoại</h1>
            <p>Theo dõi và cập nhật nhanh dữ liệu đang hiển thị trên website bán hàng.</p>
          </div>
          <button type="button" id="admin-product-new" class="btn btn-primary">Thêm sản phẩm</button>
        </section>

        <section class="admin-api-grid">
          <div class="admin-api-card active">
            <span>Sản phẩm</span>
            <strong id="admin-stat-products">--</strong>
            <p>Điện thoại trong hệ thống</p>
          </div>
          <div class="admin-api-card active">
            <span>Danh mục</span>
            <strong id="admin-stat-categories">--</strong>
            <p>Hãng điện thoại đang quản lý</p>
          </div>
          <div class="admin-api-card active">
            <span>Thông số</span>
            <strong id="admin-stat-details">--</strong>
            <p>Bản ghi cấu hình chi tiết</p>
          </div>
          <div class="admin-api-card active">
            <span>Cần bổ sung</span>
            <strong>Đơn hàng</strong>
            <p>Chưa mở chức năng xử lý đơn đặt hàng</p>
          </div>
        </section>

        <nav class="admin-view-tabs" aria-label="Chọn màn quản trị">
          <button type="button" class="admin-view-tab ${activeAdminView === 'products' ? 'active' : ''}" data-admin-view-tab="products">Sản phẩm</button>
          <button type="button" class="admin-view-tab ${activeAdminView === 'resources' ? 'active' : ''}" data-admin-view-tab="resources">Dữ liệu sản phẩm</button>
        </nav>

        <section id="admin-products-view" class="admin-workspace" data-admin-view="products" ${activeAdminView === 'products' ? '' : 'hidden'}>
          <div class="admin-section-heading">
            <div>
              <span class="admin-eyebrow">Sản phẩm</span>
              <h2>Quản lý sản phẩm bán hàng</h2>
            </div>
            <p>Danh sách có lọc nhanh theo tên, hãng, giá và trạng thái.</p>
          </div>
          <div class="admin-layout">
            <div class="admin-list-panel">
              ${renderFilters()}
              <div id="admin-products-status" class="admin-status" hidden></div>
              <div id="admin-products-table"></div>
            </div>
          </div>
        </section>

        <section id="admin-resources-view" class="admin-workspace" data-admin-view="resources" ${activeAdminView === 'resources' ? '' : 'hidden'}>
          <div class="admin-section-heading">
            <div>
              <span class="admin-eyebrow">Dữ liệu sản phẩm</span>
              <h2>Quản lý danh mục, thông số và hình ảnh</h2>
            </div>
            <p>Mỗi tab bên dưới là một nhóm dữ liệu riêng.</p>
          </div>
          ${renderAdminResourceSection()}
        </section>

        ${renderProductModal()}
      </div>
    </main>
  `;
}

function renderProductModal(): string {
  return `
    <div id="admin-product-modal" class="admin-modal" hidden>
      <div class="admin-modal-backdrop" data-admin-product-modal-close></div>
      <section class="admin-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-form-title">
        ${renderProductForm()}
      </section>
    </div>
  `;
}

function renderAdminResourceSection(): string {
  return `
    <section class="admin-resource-section">
      <div class="admin-resource-tabs" role="tablist" aria-label="Quản lý dữ liệu sản phẩm">
        <button type="button" class="admin-resource-tab ${activeResourceKey === 'categories' ? 'active' : ''}" data-admin-resource-tab="categories">Danh mục</button>
        <button type="button" class="admin-resource-tab ${activeResourceKey === 'details' ? 'active' : ''}" data-admin-resource-tab="details">Thông số</button>
        <button type="button" class="admin-resource-tab ${activeResourceKey === 'variants' ? 'active' : ''}" data-admin-resource-tab="variants">Phiên bản</button>
        <button type="button" class="admin-resource-tab ${activeResourceKey === 'gallery' ? 'active' : ''}" data-admin-resource-tab="gallery">Hình ảnh</button>
      </div>

      <div id="admin-resource-status" class="admin-status" hidden></div>
      <div id="admin-resource-panel" class="admin-resource-panel">
        ${renderResourceLoading(getResourceLoadingText(activeResourceKey))}
      </div>
    </section>
  `;
}

function renderFilters(): string {
  return `
    <form id="admin-filter-form" class="admin-filter-form">
      <div class="form-group">
        <label class="form-label" for="admin-keyword">Tìm theo tên/mã</label>
        <input id="admin-keyword" name="keyword" class="form-input" type="search" placeholder="iPhone, Samsung...">
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-category">Hãng</label>
        <select id="admin-category" name="categoryCode" class="form-select">
          <option value="">Tất cả hãng</option>
          ${categories.map(category => `
            <option value="${escapeHtml(category.code || category.id)}">${escapeHtml(category.name)}</option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-status-filter">Trạng thái</label>
        <select id="admin-status-filter" name="status" class="form-select">
          <option value="">Tất cả</option>
          <option value="1">Đang bán</option>
          <option value="0">Ẩn/xóa mềm</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-min-price">Giá từ</label>
        <input id="admin-min-price" name="minPrice" class="form-input" type="number" min="0" step="100000">
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-max-price">Giá đến</label>
        <input id="admin-max-price" name="maxPrice" class="form-input" type="number" min="0" step="100000">
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-page-size">Số dòng</label>
        <select id="admin-page-size" name="size" class="form-select">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      <div class="admin-filter-actions">
        <button type="submit" class="btn btn-primary">Lọc</button>
        <button type="button" id="admin-filter-reset" class="btn btn-secondary">Xóa lọc</button>
      </div>
    </form>
  `;
}

function renderProductForm(): string {
  return `
    <form id="admin-product-form" class="admin-product-form">
      <div class="admin-form-heading">
        <div>
          <span class="admin-eyebrow">Thông tin sản phẩm</span>
          <h2 id="admin-form-title">Thêm sản phẩm</h2>
        </div>
        <div class="admin-modal-heading-actions">
          <button type="button" id="admin-form-cancel" class="btn btn-secondary btn-small" hidden>Hủy sửa</button>
          <button type="button" class="admin-modal-close" data-admin-product-modal-close aria-label="Đóng">×</button>
        </div>
      </div>

      <div id="admin-form-message" class="form-message" hidden></div>

      <div class="form-group">
        <label class="form-label" for="product-code">Mã sản phẩm *</label>
        <input id="product-code" name="code" class="form-input" type="text" required>
      </div>

      <div class="form-group">
        <label class="form-label" for="product-name">Tên sản phẩm *</label>
        <input id="product-name" name="name" class="form-input" type="text" required>
      </div>

      <div class="form-group">
        <label class="form-label" for="product-category">Hãng *</label>
        <select id="product-category" name="categoryCode" class="form-select" required>
          <option value="">Chọn hãng</option>
          ${categories.map(category => `
            <option value="${escapeHtml(category.code || category.id)}">${escapeHtml(category.name)}</option>
          `).join('')}
        </select>
      </div>

      <div class="admin-form-row">
        <div class="form-group">
          <label class="form-label" for="product-price-show">Giá bán *</label>
          <input id="product-price-show" name="priceShow" class="form-input" type="number" min="0" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="product-price-through">Giá gốc</label>
          <input id="product-price-through" name="priceThrough" class="form-input" type="number" min="0">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="form-group">
          <label class="form-label" for="product-display">Màn hình</label>
          <input id="product-display" name="productDisplay" class="form-input" type="text" placeholder="6.9 inches">
        </div>
        <div class="form-group">
          <label class="form-label" for="product-storage">RAM/Bộ nhớ</label>
          <input id="product-storage" name="productStorage" class="form-input" type="text" placeholder="8 GB / 256 GB">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="form-group">
          <label class="form-label" for="product-percent">Giảm giá (%)</label>
          <input id="product-percent" name="percentDetail" class="form-input" type="text">
        </div>
        <div class="form-group">
          <label class="form-label" for="product-priority">Ưu tiên</label>
          <input id="product-priority" name="priority" class="form-input" type="number" min="0" value="1">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="product-coupon">Khuyến mãi</label>
        <textarea id="product-coupon" name="couponPrice" class="form-input admin-textarea" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="product-icon-link">URL ảnh hiện có</label>
        <input id="product-icon-link" name="iconLink" class="form-input" type="url" placeholder="Dán link ảnh sản phẩm">
      </div>

      <div class="form-group">
        <label class="form-label" for="product-image">Chọn ảnh mới</label>
        <input id="product-image" name="image" class="form-input" type="file" accept="image/*">
      </div>

      <div class="admin-form-row">
        <div class="form-group">
          <label class="form-label" for="product-status">Trạng thái</label>
          <select id="product-status" name="status" class="form-select">
            <option value="1">Đang bán</option>
            <option value="0">Ẩn/xóa mềm</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="product-installment">Trả góp</label>
          <input id="product-installment" name="installment" class="form-input" type="number" min="0" step="0.01" value="0">
        </div>
      </div>

      <input id="product-clone-href" name="cloneHref" type="hidden">

      <button type="submit" id="admin-product-submit" class="btn btn-primary btn-block">Thêm sản phẩm</button>
    </form>
  `;
}

function setupAdminListeners(): void {
  const filterForm = document.getElementById('admin-filter-form') as HTMLFormElement | null;
  const resetButton = document.getElementById('admin-filter-reset');
  const productForm = document.getElementById('admin-product-form') as HTMLFormElement | null;
  const cancelButton = document.getElementById('admin-form-cancel');
  const newProductButton = document.getElementById('admin-product-new');
  const productModal = document.getElementById('admin-product-modal');

  setupAdminViewListeners();
  setupAdminResourceListeners();

  newProductButton?.addEventListener('click', () => {
    resetProductForm();
    openProductModal();
  });

  filterForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    currentParams = getFilterParams(filterForm);
    await loadProducts();
  });

  resetButton?.addEventListener('click', async () => {
    filterForm?.reset();
    currentParams = { page: 0, size: 10 };
    await loadProducts();
  });

  productForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveProduct(productForm);
  });

  cancelButton?.addEventListener('click', () => {
    resetProductForm();
    closeProductModal();
  });

  productModal?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.matches('[data-admin-product-modal-close]')) {
      closeProductModal();
    }
  });
}

function setupAdminViewListeners(): void {
  document.querySelectorAll('[data-admin-view-tab]').forEach(button => {
    button.addEventListener('click', () => {
      const key = (button as HTMLElement).dataset.adminViewTab;
      if (key === 'products' || key === 'resources') {
        setActiveAdminView(key);
      }
    });
  });
}

function setActiveAdminView(key: AdminViewKey): void {
  activeAdminView = key;

  document.querySelectorAll<HTMLElement>('[data-admin-view-tab]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.adminViewTab === key);
  });

  document.querySelectorAll<HTMLElement>('[data-admin-view]').forEach(view => {
    view.hidden = view.dataset.adminView !== key;
  });
}

function setupAdminResourceListeners(): void {
  const panel = document.getElementById('admin-resource-panel');

  document.querySelectorAll('[data-admin-resource-tab]').forEach(button => {
    button.addEventListener('click', async () => {
      const key = (button as HTMLElement).dataset.adminResourceTab;
      if (!isResourceKey(key)) return;

      activeResourceKey = key;
      editingResourceId = '';
      document.querySelectorAll('[data-admin-resource-tab]').forEach(tab => {
        tab.classList.toggle('active', tab === button);
      });
      await loadAdminResource(activeResourceKey);
    });
  });

  panel?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    if (form.id === 'admin-resource-filter') {
      editingResourceId = '';
      await loadAdminResource(activeResourceKey, getResourceFilters(form));
      return;
    }

    if (form.id === 'admin-resource-form') {
      await saveAdminResource(form);
    }
  });

  panel?.addEventListener('click', async (event) => {
    const target = (event.target as HTMLElement).closest(
      '[data-resource-action], [data-resource-edit], [data-resource-delete]'
    ) as HTMLElement | null;
    if (!target) return;

    const action = target.dataset.resourceAction;
    if (action === 'reset') {
      resetAdminResourceForm();
      closeAdminResourceModal();
      return;
    }

    if (action === 'new') {
      resetAdminResourceForm();
      openAdminResourceModal();
      return;
    }

    if (action === 'close-modal') {
      closeAdminResourceModal();
      return;
    }

    if (action === 'reload') {
      await loadAdminResource(activeResourceKey, getCurrentResourceFilters());
      return;
    }

    if (action === 'clear-filter') {
      const filterForm = document.getElementById('admin-resource-filter') as HTMLFormElement | null;
      filterForm?.reset();
      await loadAdminResource(activeResourceKey);
      return;
    }

    const editId = target.dataset.resourceEdit;
    if (editId) {
      const item = findResourceItem(activeResourceKey, editId);
      if (item) fillAdminResourceForm(activeResourceKey, item);
      return;
    }

    const deleteId = target.dataset.resourceDelete;
    if (deleteId) {
      await deleteAdminResource(activeResourceKey, deleteId);
    }
  });
}

async function loadAdminOverviewStats(): Promise<void> {
  try {
    const detailItems = await adminProductService.listProductDetails();
    updateAdminStat('admin-stat-details', detailItems.length.toLocaleString());
  } catch (error) {
    console.error('Failed to load admin overview stats', error);
    updateAdminStat('admin-stat-details', '0');
  }
}

async function loadAdminResource(key: AdminResourceKey, filters: Record<string, string> = {}): Promise<void> {
  const panel = document.getElementById('admin-resource-panel');
  const status = document.getElementById('admin-resource-status');
  if (!panel) return;

  const loadId = ++resourceLoadId;
  panel.innerHTML = renderResourceLoading(getResourceLoadingText(key));
  setStatus(status, '', '');

  try {
    if (key === 'categories') {
      const items = await adminProductService.listAdminCategories(filters.status);
      if (!isLatestResourceLoad(loadId, key)) return;

      categoryAdminItems = items;
      updateAdminStat('admin-stat-categories', items.length.toLocaleString());
      panel.innerHTML = renderCategoryResourcePanel(categoryAdminItems, filters);
    }

    if (key === 'details') {
      const items = await adminProductService.listProductDetails({
        productId: filters.productId,
        status: filters.status,
      });
      if (!isLatestResourceLoad(loadId, key)) return;

      productDetailItems = items;
      updateAdminStat('admin-stat-details', items.length.toLocaleString());
      panel.innerHTML = renderDetailResourcePanel(productDetailItems, filters);
    }

    if (key === 'variants') {
      const items = await adminProductService.listProductVariants({
        parent: filters.parent,
        status: filters.status,
      });
      if (!isLatestResourceLoad(loadId, key)) return;

      productVariantItems = items;
      panel.innerHTML = renderVariantResourcePanel(productVariantItems, filters);
    }

    if (key === 'gallery') {
      const items = await adminProductService.listBoxGallery({
        parent: filters.parent,
        status: filters.status,
      });
      if (!isLatestResourceLoad(loadId, key)) return;

      boxGalleryItems = items;
      panel.innerHTML = renderGalleryResourcePanel(boxGalleryItems, filters);
    }
  } catch (error) {
    if (!isLatestResourceLoad(loadId, key)) return;

    panel.innerHTML = renderResourceError(getResourceTitle(key));
    setStatus(status, error instanceof Error ? error.message : 'Không tải được dữ liệu quản trị', 'error');
  }
}

function renderCategoryResourcePanel(items: CategoryAdminItem[], filters: Record<string, string>): string {
  return `
    <div class="admin-resource-layout">
      <div class="admin-resource-list">
        ${renderResourceFilter('categories', filters)}
        <div class="admin-table-header">
          <div>
            <h2>Danh mục hãng</h2>
            <p>${items.length.toLocaleString()} danh mục đang quản lý</p>
          </div>
          <div class="admin-table-actions">
            <button type="button" class="btn btn-secondary btn-small" data-resource-action="reload">Tải lại</button>
            <button type="button" class="btn btn-primary btn-small" data-resource-action="new">Thêm danh mục</button>
          </div>
        </div>
        ${items.length ? `
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Ưu tiên</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>${items.map(renderCategoryRow).join('')}</tbody>
            </table>
          </div>
        ` : renderResourceEmpty('Chưa có danh mục phù hợp.')}
      </div>
      ${renderResourceModal(renderCategoryForm())}
    </div>
  `;
}

function renderDetailResourcePanel(items: ProductDetailAdminItem[], filters: Record<string, string>): string {
  const visibleItems = items.slice(0, RESOURCE_DISPLAY_LIMIT);

  return `
    <div class="admin-resource-layout">
      <div class="admin-resource-list">
        ${renderResourceFilter('details', filters)}
        <div class="admin-table-header">
          <div>
            <h2>Thông số chi tiết</h2>
            <p>${renderResourceCount(items.length, 'bản ghi cấu hình')}</p>
          </div>
          <div class="admin-table-actions">
            <button type="button" class="btn btn-secondary btn-small" data-resource-action="reload">Tải lại</button>
            <button type="button" class="btn btn-primary btn-small" data-resource-action="new">Thêm thông số</button>
          </div>
        </div>
        ${visibleItems.length ? `
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Chi tiết</th>
                  <th>Giá</th>
                  <th>Cấu hình</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>${visibleItems.map(renderDetailRow).join('')}</tbody>
            </table>
          </div>
        ` : renderResourceEmpty('Chưa có chi tiết phù hợp.')}
      </div>
      ${renderResourceModal(renderDetailForm())}
    </div>
  `;
}

function renderVariantResourcePanel(items: ProductVariantAdminItem[], filters: Record<string, string>): string {
  const visibleItems = items.slice(0, RESOURCE_DISPLAY_LIMIT);

  return `
    <div class="admin-resource-layout">
      <div class="admin-resource-list">
        ${renderResourceFilter('variants', filters)}
        <div class="admin-table-header">
          <div>
            <h2>Phiên bản sản phẩm</h2>
            <p>${renderResourceCount(items.length, 'phiên bản')}</p>
          </div>
          <div class="admin-table-actions">
            <button type="button" class="btn btn-secondary btn-small" data-resource-action="reload">Tải lại</button>
            <button type="button" class="btn btn-primary btn-small" data-resource-action="new">Thêm phiên bản</button>
          </div>
        </div>
        ${visibleItems.length ? `
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Biến thể</th>
                  <th>Liên kết</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>${visibleItems.map(renderVariantRow).join('')}</tbody>
            </table>
          </div>
        ` : renderResourceEmpty('Chưa có biến thể phù hợp.')}
      </div>
      ${renderResourceModal(renderVariantForm())}
    </div>
  `;
}

function renderGalleryResourcePanel(items: BoxGalleryAdminItem[], filters: Record<string, string>): string {
  const visibleItems = items.slice(0, RESOURCE_DISPLAY_LIMIT);

  return `
    <div class="admin-resource-layout">
      <div class="admin-resource-list">
        ${renderResourceFilter('gallery', filters)}
        <div class="admin-table-header">
          <div>
            <h2>Thư viện ảnh sản phẩm</h2>
            <p>${renderResourceCount(items.length, 'ảnh')}</p>
          </div>
          <div class="admin-table-actions">
            <button type="button" class="btn btn-secondary btn-small" data-resource-action="reload">Tải lại</button>
            <button type="button" class="btn btn-primary btn-small" data-resource-action="new">Thêm ảnh</button>
          </div>
        </div>
        ${visibleItems.length ? `
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Liên kết</th>
                  <th>Ưu tiên</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>${visibleItems.map(renderGalleryRow).join('')}</tbody>
            </table>
          </div>
        ` : renderResourceEmpty('Chưa có ảnh phù hợp.')}
      </div>
      ${renderResourceModal(renderGalleryForm())}
    </div>
  `;
}

function renderResourceModal(form: string): string {
  return `
    <div id="admin-resource-modal" class="admin-modal" hidden>
      <div class="admin-modal-backdrop" data-resource-action="close-modal"></div>
      <section class="admin-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-resource-form-title">
        ${form}
      </section>
    </div>
  `;
}

function renderResourceFilter(key: AdminResourceKey, filters: Record<string, string>): string {
  const parentFilter = key === 'variants' || key === 'gallery'
    ? `
      <div class="form-group">
        <label class="form-label" for="resource-parent-filter">Sản phẩm liên kết</label>
        <input id="resource-parent-filter" name="parent" class="form-input" type="text" value="${escapeHtml(filters.parent || '')}" placeholder="Dán mã liên kết sản phẩm">
      </div>
    `
    : '';

  const productIdFilter = key === 'details'
    ? `
      <div class="form-group">
        <label class="form-label" for="resource-product-id-filter">Sản phẩm liên kết</label>
        <input id="resource-product-id-filter" name="productId" class="form-input" type="text" value="${escapeHtml(filters.productId || '')}" placeholder="Dán mã liên kết sản phẩm">
      </div>
    `
    : '';

  return `
    <form id="admin-resource-filter" class="admin-resource-filter">
      ${productIdFilter}
      ${parentFilter}
      <div class="form-group">
        <label class="form-label" for="resource-status-filter">Trạng thái</label>
        <select id="resource-status-filter" name="status" class="form-select">
          <option value="" ${!filters.status ? 'selected' : ''}>Tất cả</option>
          <option value="1" ${filters.status === '1' ? 'selected' : ''}>Đang dùng</option>
          <option value="0" ${filters.status === '0' ? 'selected' : ''}>Ẩn/xóa mềm</option>
        </select>
      </div>
      <div class="admin-filter-actions">
        <button type="submit" class="btn btn-primary btn-small">Lọc</button>
        <button type="button" class="btn btn-secondary btn-small" data-resource-action="clear-filter">Xóa lọc</button>
      </div>
    </form>
  `;
}

function renderCategoryForm(): string {
  return `
    <form id="admin-resource-form" class="admin-product-form">
      ${renderResourceFormHeading('Danh mục hãng', 'Thêm danh mục')}
      <div class="form-group">
        <label class="form-label" for="category-code">Mã danh mục *</label>
        <input id="category-code" name="code" class="form-input" type="text" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="category-name">Tên danh mục *</label>
        <input id="category-name" name="name" class="form-input" type="text" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="category-icon-link">Link icon/ảnh</label>
        <input id="category-icon-link" name="iconLink" class="form-input" type="url" placeholder="Dán link ảnh danh mục">
      </div>
      <div class="form-group">
        <label class="form-label" for="category-image">Chọn ảnh mới</label>
        <input id="category-image" name="image" class="form-input" type="file" accept="image/*">
      </div>
      <div class="admin-form-row">
        <div class="form-group">
          <label class="form-label" for="category-priority">Ưu tiên</label>
          <input id="category-priority" name="priority" class="form-input" type="number" min="0" value="1">
        </div>
        <div class="form-group">
          <label class="form-label" for="category-status">Trạng thái</label>
          <select id="category-status" name="status" class="form-select">
            <option value="1">Đang dùng</option>
            <option value="0">Ẩn/xóa mềm</option>
          </select>
        </div>
      </div>
      <input id="category-clone-href" name="cloneHref" type="hidden">
      ${renderResourceSubmit('Thêm danh mục')}
    </form>
  `;
}

function renderDetailForm(): string {
  return `
    <form id="admin-resource-form" class="admin-product-form">
      ${renderResourceFormHeading('Thông số kỹ thuật', 'Thêm thông số')}
      <div class="form-group">
        <label class="form-label" for="detail-product-id">Sản phẩm liên kết *</label>
        <input id="detail-product-id" name="productId" class="form-input" type="text" required placeholder="Dán mã liên kết sản phẩm">
      </div>
      <div class="form-group">
        <label class="form-label" for="detail-code">Mã thông số *</label>
        <input id="detail-code" name="code" class="form-input" type="text" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="detail-name">Tên hiển thị</label>
        <input id="detail-name" name="name" class="form-input" type="text">
      </div>
      <div class="admin-form-row">
        <div class="form-group">
          <label class="form-label" for="detail-sale-price">Giá bán</label>
          <input id="detail-sale-price" name="salePrice" class="form-input" type="number" min="0">
        </div>
        <div class="form-group">
          <label class="form-label" for="detail-base-price">Giá gốc</label>
          <input id="detail-base-price" name="basePrice" class="form-input" type="number" min="0">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="detail-technical-content">Nội dung cấu hình</label>
        <textarea id="detail-technical-content" name="technicalContent" class="form-input admin-textarea" rows="5" placeholder='RAM: 8GB, ROM: 256GB, Pin: 5000mAh'></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="detail-box-linked">Ghi chú liên kết</label>
        <input id="detail-box-linked" name="boxLinked" class="form-input" type="text">
      </div>
      <div class="form-group">
        <label class="form-label" for="detail-status">Trạng thái</label>
        <select id="detail-status" name="status" class="form-select">
          <option value="1">Đang dùng</option>
          <option value="0">Ẩn/xóa mềm</option>
        </select>
      </div>
      ${renderResourceSubmit('Thêm thông số')}
    </form>
  `;
}

function renderVariantForm(): string {
  return `
    <form id="admin-resource-form" class="admin-product-form">
      ${renderResourceFormHeading('Phiên bản mua hàng', 'Thêm phiên bản')}
      <div class="form-group">
        <label class="form-label" for="variant-parent">Sản phẩm liên kết *</label>
        <input id="variant-parent" name="parent" class="form-input" type="text" required placeholder="Dán mã liên kết sản phẩm">
      </div>
      <div class="form-group">
        <label class="form-label" for="variant-name">Tên biến thể</label>
        <input id="variant-name" name="name" class="form-input" type="text">
      </div>
      <div class="form-group">
        <label class="form-label" for="variant-href">Đường dẫn mua hàng</label>
        <input id="variant-href" name="href" class="form-input" type="text">
      </div>
      <div class="form-group">
        <label class="form-label" for="variant-src">Link ảnh hiện có</label>
        <input id="variant-src" name="src" class="form-input" type="url" placeholder="Dán link ảnh phiên bản">
      </div>
      <div class="form-group">
        <label class="form-label" for="variant-image">Chọn ảnh mới</label>
        <input id="variant-image" name="image" class="form-input" type="file" accept="image/*">
      </div>
      <div class="admin-form-row">
        <div class="form-group">
          <label class="form-label" for="variant-price">Giá</label>
          <input id="variant-price" name="price" class="form-input" type="number" min="0">
        </div>
        <div class="form-group">
          <label class="form-label" for="variant-priority">Ưu tiên</label>
          <input id="variant-priority" name="priority" class="form-input" type="number" min="0" value="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="variant-status">Trạng thái</label>
        <select id="variant-status" name="status" class="form-select">
          <option value="1">Đang dùng</option>
          <option value="0">Ẩn/xóa mềm</option>
        </select>
      </div>
      ${renderResourceSubmit('Thêm biến thể')}
    </form>
  `;
}

function renderGalleryForm(): string {
  return `
    <form id="admin-resource-form" class="admin-product-form">
      ${renderResourceFormHeading('Hình ảnh sản phẩm', 'Thêm ảnh sản phẩm')}
      <div class="form-group">
        <label class="form-label" for="gallery-parent">Sản phẩm liên kết *</label>
        <input id="gallery-parent" name="parent" class="form-input" type="text" required placeholder="Dán mã liên kết sản phẩm">
      </div>
      <div class="form-group">
        <label class="form-label" for="gallery-title">Tiêu đề</label>
        <input id="gallery-title" name="title" class="form-input" type="text">
      </div>
      <div class="form-group">
        <label class="form-label" for="gallery-alt">Mô tả ảnh</label>
        <input id="gallery-alt" name="alt" class="form-input" type="text">
      </div>
      <div class="form-group">
        <label class="form-label" for="gallery-src">Link ảnh hiện có</label>
        <input id="gallery-src" name="src" class="form-input" type="url" placeholder="Dán link ảnh sản phẩm">
      </div>
      <div class="form-group">
        <label class="form-label" for="gallery-image">Chọn ảnh mới</label>
        <input id="gallery-image" name="image" class="form-input" type="file" accept="image/*">
      </div>
      <div class="admin-form-row">
        <div class="form-group">
          <label class="form-label" for="gallery-priority">Ưu tiên</label>
          <input id="gallery-priority" name="priority" class="form-input" type="number" min="0" value="1">
        </div>
        <div class="form-group">
          <label class="form-label" for="gallery-status">Trạng thái</label>
          <select id="gallery-status" name="status" class="form-select">
            <option value="1">Đang dùng</option>
            <option value="0">Ẩn/xóa mềm</option>
          </select>
        </div>
      </div>
      ${renderResourceSubmit('Thêm ảnh sản phẩm')}
    </form>
  `;
}

function renderResourceFormHeading(schema: string, title: string): string {
  return `
    <div class="admin-form-heading">
      <div>
        <span class="admin-eyebrow">${schema}</span>
        <h2 id="admin-resource-form-title">${title}</h2>
      </div>
      <div class="admin-modal-heading-actions">
        <button type="button" class="btn btn-secondary btn-small" data-resource-action="reset" hidden>Hủy sửa</button>
        <button type="button" class="admin-modal-close" data-resource-action="close-modal" aria-label="Đóng">×</button>
      </div>
    </div>
  `;
}

function renderResourceSubmit(label: string): string {
  return `<button type="submit" class="btn btn-primary btn-block" data-resource-submit>${label}</button>`;
}

function renderCategoryRow(item: CategoryAdminItem): string {
  return `
    <tr>
      <td>
        <div class="admin-product-cell">
          <img src="${escapeHtml(item.iconLink || '')}" alt="${escapeHtml(item.name)}" onerror="this.style.display='none'">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.code)}</span>
          </div>
        </div>
      </td>
      <td>${item.priority ?? '-'}</td>
      <td>${renderStatusBadge(item.status, 'Đang dùng')}</td>
      <td>${renderResourceActions(item.code)}</td>
    </tr>
  `;
}

function renderDetailRow(item: ProductDetailAdminItem): string {
  return `
    <tr>
      <td>
        <strong>${escapeHtml(item.name || item.code)}</strong>
        <span class="admin-muted-line">${escapeHtml(shortId(item.id))} | Liên kết: ${escapeHtml(shortId(item.productId))}</span>
      </td>
      <td>
        <strong>${formatPrice(item.salePrice)}</strong>
        ${item.basePrice ? `<span class="admin-muted-price">${formatPrice(item.basePrice)}</span>` : ''}
      </td>
      <td><span class="admin-resource-preview">${escapeHtml(formatTechnicalContent(item.technicalContent))}</span></td>
      <td>${renderStatusBadge(item.status, 'Đang dùng')}</td>
      <td>${renderResourceActions(item.id)}</td>
    </tr>
  `;
}

function renderVariantRow(item: ProductVariantAdminItem): string {
  return `
    <tr>
      <td>
        <div class="admin-product-cell">
          <img src="${escapeHtml(item.src || '')}" alt="${escapeHtml(item.name || 'Biến thể')}" onerror="this.style.display='none'">
          <div>
            <strong>${escapeHtml(item.name || 'Chưa đặt tên')}</strong>
            <span>${escapeHtml(shortId(item.id))}</span>
          </div>
        </div>
      </td>
      <td><span class="admin-resource-id" title="${escapeHtml(item.parent)}">${escapeHtml(shortId(item.parent))}</span></td>
      <td>${formatPrice(item.price)}</td>
      <td>${renderStatusBadge(item.status, 'Đang dùng')}</td>
      <td>${renderResourceActions(item.id)}</td>
    </tr>
  `;
}

function renderGalleryRow(item: BoxGalleryAdminItem): string {
  return `
    <tr>
      <td>
        <div class="admin-product-cell">
          <img src="${escapeHtml(item.src || '')}" alt="${escapeHtml(item.alt || item.title || 'Ảnh sản phẩm')}" onerror="this.style.display='none'">
          <div>
            <strong>${escapeHtml(item.title || item.alt || 'Ảnh sản phẩm')}</strong>
            <span>${escapeHtml(shortId(item.id))}</span>
          </div>
        </div>
      </td>
      <td><span class="admin-resource-id" title="${escapeHtml(item.parent)}">${escapeHtml(shortId(item.parent))}</span></td>
      <td>${item.priority ?? '-'}</td>
      <td>${renderStatusBadge(item.status, 'Đang dùng')}</td>
      <td>${renderResourceActions(item.id)}</td>
    </tr>
  `;
}

function renderResourceActions(id: string): string {
  return `
    <div class="admin-row-actions">
      <button type="button" class="btn btn-secondary btn-small" data-resource-edit="${escapeHtml(id)}">Sửa</button>
      <button type="button" class="btn btn-danger btn-small" data-resource-delete="${escapeHtml(id)}">Xóa</button>
    </div>
  `;
}

function renderResourceCount(total: number, noun: string): string {
  if (total > RESOURCE_DISPLAY_LIMIT) {
    return `Hiển thị ${RESOURCE_DISPLAY_LIMIT.toLocaleString()}/${total.toLocaleString()} ${noun}, dùng bộ lọc để thu hẹp`;
  }

  return `${total.toLocaleString()} ${noun}`;
}

async function saveAdminResource(form: HTMLFormElement): Promise<void> {
  const status = document.getElementById('admin-resource-status');
  const submitButton = form.querySelector<HTMLButtonElement>('[data-resource-submit]');
  const loadingLabel = editingResourceId ? 'Đang lưu...' : 'Đang thêm...';
  const successLabel = editingResourceId ? 'Cập nhật dữ liệu thành công.' : 'Thêm dữ liệu thành công.';

  setStatus(status, '', '');
  setButtonLoading(submitButton, true, loadingLabel);

  try {
    if (activeResourceKey === 'categories') {
      const payload = getCategoryPayload(form);
      const image = getResourceImageFile(form, 'category-image');
      if (editingResourceId) {
        await adminProductService.updateCategory(editingResourceId, payload, image);
      } else {
        await adminProductService.createCategory(payload, image);
      }
    }

    if (activeResourceKey === 'details') {
      const payload = getDetailPayload(form);
      if (editingResourceId) {
        await adminProductService.updateProductDetail(editingResourceId, payload);
      } else {
        await adminProductService.createProductDetail(payload);
      }
    }

    if (activeResourceKey === 'variants') {
      const payload = getVariantPayload(form);
      const image = getResourceImageFile(form, 'variant-image');
      if (editingResourceId) {
        await adminProductService.updateProductVariant(editingResourceId, payload, image);
      } else {
        await adminProductService.createProductVariant(payload, image);
      }
    }

    if (activeResourceKey === 'gallery') {
      const payload = getGalleryPayload(form);
      const image = getResourceImageFile(form, 'gallery-image');
      if (editingResourceId) {
        await adminProductService.updateBoxGalleryItem(editingResourceId, payload, image);
      } else {
        await adminProductService.createBoxGalleryItem(payload, image);
      }
    }

    editingResourceId = '';
    closeAdminResourceModal();
    await loadAdminResource(activeResourceKey, getCurrentResourceFilters());
    setStatus(status, successLabel, 'success');
  } catch (error) {
    setStatus(status, error instanceof Error ? error.message : 'Không lưu được dữ liệu', 'error');
    setButtonLoading(submitButton, false, editingResourceId ? 'Lưu thay đổi' : getResourceSubmitLabel(activeResourceKey));
  }
}

async function deleteAdminResource(key: AdminResourceKey, id: string): Promise<void> {
  const item = findResourceItem(key, id);
  const label = item ? getResourceItemLabel(key, item) : id;
  const confirmed = window.confirm(`Xóa mềm "${label}"?`);
  if (!confirmed) return;

  const status = document.getElementById('admin-resource-status');
  setStatus(status, '', '');

  try {
    if (key === 'categories') await adminProductService.deleteCategory(id);
    if (key === 'details') await adminProductService.deleteProductDetail(id);
    if (key === 'variants') await adminProductService.deleteProductVariant(id);
    if (key === 'gallery') await adminProductService.deleteBoxGalleryItem(id);

    await loadAdminResource(key, getCurrentResourceFilters());
    setStatus(status, 'Đã xóa mềm dữ liệu.', 'success');
  } catch (error) {
    setStatus(status, error instanceof Error ? error.message : 'Không xóa được dữ liệu', 'error');
  }
}

function fillAdminResourceForm(key: AdminResourceKey, item: AdminResourceItem): void {
  editingResourceId = getResourceItemId(key, item);
  resetAdminResourceForm(false);

  if (key === 'categories') {
    const category = item as CategoryAdminItem;
    setFormValue('category-code', category.code);
    setFormValue('category-name', category.name);
    setFormValue('category-icon-link', category.iconLink || '');
    setFormValue('category-priority', String(category.priority ?? 1));
    setFormValue('category-status', String(category.status ?? 1));
    setFormValue('category-clone-href', category.cloneHref || '');
    setReadOnly('category-code', true);
  }

  if (key === 'details') {
    const detail = item as ProductDetailAdminItem;
    setFormValue('detail-product-id', detail.productId);
    setFormValue('detail-code', detail.code);
    setFormValue('detail-name', detail.name || '');
    setFormValue('detail-sale-price', String(detail.salePrice ?? ''));
    setFormValue('detail-base-price', String(detail.basePrice ?? ''));
    setFormValue('detail-technical-content', getTechnicalContentInput(detail.technicalContent));
    setFormValue('detail-box-linked', detail.boxLinked || '');
    setFormValue('detail-status', String(detail.status ?? 1));
  }

  if (key === 'variants') {
    const variant = item as ProductVariantAdminItem;
    setFormValue('variant-parent', variant.parent);
    setFormValue('variant-name', variant.name || '');
    setFormValue('variant-href', variant.href || '');
    setFormValue('variant-src', variant.src || '');
    setFormValue('variant-price', String(variant.price ?? ''));
    setFormValue('variant-priority', String(variant.priority ?? 1));
    setFormValue('variant-status', String(variant.status ?? 1));
  }

  if (key === 'gallery') {
    const gallery = item as BoxGalleryAdminItem;
    setFormValue('gallery-parent', gallery.parent);
    setFormValue('gallery-title', gallery.title || '');
    setFormValue('gallery-alt', gallery.alt || '');
    setFormValue('gallery-src', gallery.src || '');
    setFormValue('gallery-priority', String(gallery.priority ?? 1));
    setFormValue('gallery-status', String(gallery.status ?? 1));
  }

  const title = document.getElementById('admin-resource-form-title');
  const submit = document.querySelector<HTMLButtonElement>('#admin-resource-form [data-resource-submit]');
  const cancel = document.querySelector<HTMLButtonElement>('#admin-resource-form [data-resource-action="reset"]');
  if (title) title.textContent = `Sửa ${getResourceTitle(key).toLowerCase()}`;
  if (submit) submit.textContent = 'Lưu thay đổi';
  if (cancel) cancel.hidden = false;
  openAdminResourceModal();
}

function resetAdminResourceForm(clearEditing = true): void {
  const form = document.getElementById('admin-resource-form') as HTMLFormElement | null;
  const title = document.getElementById('admin-resource-form-title');
  const submit = form?.querySelector<HTMLButtonElement>('[data-resource-submit]');
  const cancel = form?.querySelector<HTMLButtonElement>('[data-resource-action="reset"]');

  if (clearEditing) editingResourceId = '';
  form?.reset();
  setReadOnly('category-code', false);
  setDefaultResourceFormValues(activeResourceKey);
  if (title) title.textContent = `Thêm ${getResourceTitle(activeResourceKey).toLowerCase()}`;
  if (submit) submit.textContent = getResourceSubmitLabel(activeResourceKey);
  if (cancel) cancel.hidden = true;
}

function openAdminResourceModal(): void {
  const modal = document.getElementById('admin-resource-modal');
  if (!modal) return;

  modal.hidden = false;
  document.body.classList.add('modal-open');
  window.setTimeout(() => {
    const firstInput = modal.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input:not([type="hidden"]), select, textarea'
    );
    firstInput?.focus();
  }, 0);
}

function closeAdminResourceModal(): void {
  const modal = document.getElementById('admin-resource-modal');
  if (!modal) return;

  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

function getCategoryPayload(form: HTMLFormElement): CategoryUpsertReq {
  const formData = new FormData(form);
  return {
    code: getFormText(formData, 'code'),
    name: getFormText(formData, 'name'),
    iconLink: getFormText(formData, 'iconLink'),
    cloneHref: getFormText(formData, 'cloneHref'),
    priority: toOptionalNumber(formData.get('priority')),
    status: toNumber(formData.get('status'), 1),
  };
}

function getDetailPayload(form: HTMLFormElement): ProductDetailUpsertReq {
  const formData = new FormData(form);
  return {
    productId: getFormText(formData, 'productId'),
    code: getFormText(formData, 'code'),
    name: getFormText(formData, 'name'),
    technicalContent: getFormText(formData, 'technicalContent'),
    boxLinked: getFormText(formData, 'boxLinked'),
    salePrice: toOptionalNumber(formData.get('salePrice')),
    basePrice: toOptionalNumber(formData.get('basePrice')),
    status: toNumber(formData.get('status'), 1),
  };
}

function getVariantPayload(form: HTMLFormElement): ProductVariantUpsertReq {
  const formData = new FormData(form);
  return {
    parent: getFormText(formData, 'parent'),
    href: getFormText(formData, 'href'),
    name: getFormText(formData, 'name'),
    src: getFormText(formData, 'src'),
    price: toOptionalNumber(formData.get('price')),
    priority: toOptionalNumber(formData.get('priority')),
    status: toNumber(formData.get('status'), 1),
  };
}

function getGalleryPayload(form: HTMLFormElement): BoxGalleryUpsertReq {
  const formData = new FormData(form);
  return {
    parent: getFormText(formData, 'parent'),
    title: getFormText(formData, 'title'),
    alt: getFormText(formData, 'alt'),
    src: getFormText(formData, 'src'),
    priority: toOptionalNumber(formData.get('priority')),
    status: toNumber(formData.get('status'), 1),
  };
}

function getResourceFilters(form: HTMLFormElement): Record<string, string> {
  const formData = new FormData(form);
  return {
    productId: getFormText(formData, 'productId'),
    parent: getFormText(formData, 'parent'),
    status: getFormText(formData, 'status'),
  };
}

function getCurrentResourceFilters(): Record<string, string> {
  const form = document.getElementById('admin-resource-filter') as HTMLFormElement | null;
  return form ? getResourceFilters(form) : {};
}

function findResourceItem(key: AdminResourceKey, id: string): AdminResourceItem | undefined {
  return getResourceItems(key).find(item => getResourceItemId(key, item) === id);
}

function getResourceItems(key: AdminResourceKey): AdminResourceItem[] {
  if (key === 'categories') return categoryAdminItems;
  if (key === 'details') return productDetailItems;
  if (key === 'variants') return productVariantItems;
  return boxGalleryItems;
}

function getResourceItemId(key: AdminResourceKey, item: AdminResourceItem): string {
  if (key === 'categories') return (item as CategoryAdminItem).code;
  return (item as ProductDetailAdminItem | ProductVariantAdminItem | BoxGalleryAdminItem).id;
}

function getResourceItemLabel(key: AdminResourceKey, item: AdminResourceItem): string {
  if (key === 'categories') return (item as CategoryAdminItem).name;
  if (key === 'details') return (item as ProductDetailAdminItem).name || (item as ProductDetailAdminItem).code;
  if (key === 'variants') return (item as ProductVariantAdminItem).name || (item as ProductVariantAdminItem).id;
  return (item as BoxGalleryAdminItem).title || (item as BoxGalleryAdminItem).alt || (item as BoxGalleryAdminItem).id;
}

function getResourceTitle(key: AdminResourceKey): string {
  if (key === 'categories') return 'Danh mục';
  if (key === 'details') return 'Thông số';
  if (key === 'variants') return 'Phiên bản';
  return 'Ảnh sản phẩm';
}

function getResourceSubmitLabel(key: AdminResourceKey): string {
  if (key === 'categories') return 'Thêm danh mục';
  if (key === 'details') return 'Thêm thông số';
  if (key === 'variants') return 'Thêm phiên bản';
  return 'Thêm ảnh sản phẩm';
}

function getResourceLoadingText(key: AdminResourceKey): string {
  return `Đang tải ${getResourceTitle(key).toLowerCase()}...`;
}

function setDefaultResourceFormValues(key: AdminResourceKey): void {
  if (key === 'categories') {
    setFormValue('category-priority', '1');
    setFormValue('category-status', '1');
  }
  if (key === 'details') setFormValue('detail-status', '1');
  if (key === 'variants') {
    setFormValue('variant-priority', '1');
    setFormValue('variant-status', '1');
  }
  if (key === 'gallery') {
    setFormValue('gallery-priority', '1');
    setFormValue('gallery-status', '1');
  }
}

function getResourceImageFile(form: HTMLFormElement, inputId: string): File | undefined {
  const input = form.querySelector<HTMLInputElement>(`#${inputId}`);
  return input?.files?.[0];
}

function isResourceKey(value: string | undefined): value is AdminResourceKey {
  return value === 'categories' || value === 'details' || value === 'variants' || value === 'gallery';
}

function isLatestResourceLoad(loadId: number, key: AdminResourceKey): boolean {
  return loadId === resourceLoadId && key === activeResourceKey;
}

function renderResourceLoading(message: string): string {
  return `
    <div class="admin-loading compact">
      <div class="loading-spinner"></div>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function renderResourceError(title: string): string {
  return `
    <div class="admin-empty-state compact">
      <h2>Không tải được ${escapeHtml(title.toLowerCase())}</h2>
      <p>Vui lòng đăng nhập lại hoặc kiểm tra quyền quản trị.</p>
    </div>
  `;
}

function renderResourceEmpty(message: string): string {
  return `
    <div class="admin-empty-state compact">
      <h2>${escapeHtml(message)}</h2>
      <p>Thử đổi bộ lọc hoặc thêm dữ liệu mới.</p>
    </div>
  `;
}

function formatTechnicalContent(value?: ProductDetailAdminItem['technicalContent']): string {
  if (Array.isArray(value)) {
    return value.map(item => `${item.key}: ${item.value}`).join(', ');
  }
  if (typeof value === 'string') return value;
  return '';
}

function getTechnicalContentInput(value?: ProductDetailAdminItem['technicalContent']): string {
  if (Array.isArray(value)) return JSON.stringify(value, null, 2);
  if (typeof value === 'string') return value;
  return '';
}

function shortId(value?: string): string {
  if (!value) return '-';
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function getFormText(formData: FormData, key: string): string {
  return String(formData.get(key) || '').trim();
}

function toOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = String(value || '').trim();
  if (!text) return undefined;

  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function setReadOnly(id: string, readonly: boolean): void {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (input) input.readOnly = readonly;
}

async function loadProducts(): Promise<void> {
  const tableContainer = document.getElementById('admin-products-table');
  const status = document.getElementById('admin-products-status');
  if (!tableContainer) return;

  tableContainer.innerHTML = renderTableLoading();
  setStatus(status, '', '');

  try {
    currentPage = await adminProductService.searchProducts(currentParams);
    currentProducts = currentPage.content || [];
    updateAdminStat('admin-stat-products', currentPage.totalElements.toLocaleString());
    tableContainer.innerHTML = renderProductsTable(currentPage);
    setupTableListeners();
  } catch (error) {
    tableContainer.innerHTML = renderEmptyTable('Không tải được danh sách sản phẩm.');
    setStatus(status, error instanceof Error ? error.message : 'Không tải được dữ liệu', 'error');
  }
}

function setupTableListeners(): void {
  document.querySelectorAll('[data-admin-edit]').forEach(button => {
    button.addEventListener('click', () => {
      const code = (button as HTMLElement).dataset.adminEdit;
      const product = currentProducts.find(item => item.code === code);
      if (product) fillProductForm(product);
    });
  });

  document.querySelectorAll('[data-admin-delete]').forEach(button => {
    button.addEventListener('click', async () => {
      const code = (button as HTMLElement).dataset.adminDelete;
      const product = currentProducts.find(item => item.code === code);
      if (!code || !product) return;

      const confirmed = window.confirm(`Xóa mềm sản phẩm "${product.name}"?`);
      if (!confirmed) return;

      await deleteProduct(code);
    });
  });

  document.querySelectorAll('[data-admin-page]').forEach(button => {
    button.addEventListener('click', async () => {
      const page = Number((button as HTMLElement).dataset.adminPage);
      if (Number.isNaN(page)) return;
      currentParams = { ...currentParams, page };
      await loadProducts();
    });
  });

  document.querySelectorAll('[data-admin-new-product]').forEach(button => {
    button.addEventListener('click', () => {
      resetProductForm();
      openProductModal();
    });
  });
}

async function saveProduct(form: HTMLFormElement): Promise<void> {
  const message = document.getElementById('admin-form-message');
  const submitButton = document.getElementById('admin-product-submit') as HTMLButtonElement | null;

  setStatus(message, '', '');
  setButtonLoading(submitButton, true, editingProductCode ? 'Đang lưu...' : 'Đang thêm...');

  try {
    const payload = getProductPayload(form);
    const image = getImageFile(form);

    if (editingProductCode) {
      await adminProductService.updateProduct(editingProductCode, payload, image);
      setStatus(message, 'Cập nhật sản phẩm thành công.', 'success');
    } else {
      await adminProductService.createProduct(payload, image);
      setStatus(message, 'Thêm sản phẩm thành công.', 'success');
    }

    resetProductForm();
    closeProductModal();
    await loadProducts();
  } catch (error) {
    setStatus(message, error instanceof Error ? error.message : 'Không lưu được sản phẩm', 'error');
  } finally {
    setButtonLoading(submitButton, false, editingProductCode ? 'Lưu thay đổi' : 'Thêm sản phẩm');
  }
}

async function deleteProduct(code: string): Promise<void> {
  const status = document.getElementById('admin-products-status');
  setStatus(status, '', '');

  try {
    await adminProductService.deleteProduct(code);
    setStatus(status, 'Đã xóa mềm sản phẩm.', 'success');
    await loadProducts();
  } catch (error) {
    setStatus(status, error instanceof Error ? error.message : 'Không xóa được sản phẩm', 'error');
  }
}

function renderProductsTable(page: ProductPage): string {
  if (!page.content?.length) {
    return renderEmptyTable('Không có sản phẩm phù hợp bộ lọc.');
  }

  return `
    <div class="admin-table-header">
      <div>
        <h2>Danh sách sản phẩm</h2>
        <p>${page.totalElements.toLocaleString()} sản phẩm, trang ${page.number + 1}/${Math.max(page.totalPages, 1)}</p>
      </div>
      <div class="admin-table-actions">
        <button type="button" class="btn btn-secondary btn-small" data-admin-page="${page.number}" ${page.empty ? 'disabled' : ''}>Tải lại</button>
        <button type="button" class="btn btn-primary btn-small" data-admin-new-product>Thêm sản phẩm</button>
      </div>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>Cấu hình</th>
            <th>Ưu tiên</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${page.content.map(renderProductRow).join('')}
        </tbody>
      </table>
    </div>

    <div class="admin-pagination">
      <button type="button" class="btn btn-secondary btn-small" data-admin-page="${page.number - 1}" ${page.first ? 'disabled' : ''}>Trang trước</button>
      <span>Trang ${page.number + 1} / ${Math.max(page.totalPages, 1)}</span>
      <button type="button" class="btn btn-secondary btn-small" data-admin-page="${page.number + 1}" ${page.last ? 'disabled' : ''}>Trang sau</button>
    </div>
  `;
}

function renderProductRow(product: ProductListItem): string {
  return `
    <tr>
      <td>
        <div class="admin-product-cell">
          <img src="${escapeHtml(product.iconLink || '')}" alt="${escapeHtml(product.name)}" onerror="this.style.display='none'">
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <span>${escapeHtml(product.code)}</span>
          </div>
        </div>
      </td>
      <td>
        <strong>${formatPrice(product.priceShow)}</strong>
        ${product.priceThrough ? `<span class="admin-muted-price">${formatPrice(product.priceThrough)}</span>` : ''}
      </td>
      <td>
        <span>${escapeHtml(product.productDisplay || 'Chưa có màn hình')}</span>
        <span class="admin-muted-line">${escapeHtml(product.productStorage || 'Chưa có RAM/ROM')}</span>
      </td>
      <td>${product.priority ?? '-'}</td>
      <td>${renderStatusBadge(product.status)}</td>
      <td>
        <div class="admin-row-actions">
          <button type="button" class="btn btn-secondary btn-small" data-admin-edit="${escapeHtml(product.code)}">Sửa</button>
          <button type="button" class="btn btn-danger btn-small" data-admin-delete="${escapeHtml(product.code)}">Xóa</button>
        </div>
      </td>
    </tr>
  `;
}

function renderStatusBadge(status?: number, activeLabel = 'Đang bán'): string {
  if (status === 0) return '<span class="admin-badge inactive">Ẩn</span>';
  return `<span class="admin-badge active">${escapeHtml(activeLabel)}</span>`;
}

function renderTableLoading(): string {
  return `
    <div class="admin-loading">
      <div class="loading-spinner"></div>
      <p>Đang tải sản phẩm...</p>
    </div>
  `;
}

function renderEmptyTable(message: string): string {
  return `
    <div class="admin-empty-state compact">
      <h2>${escapeHtml(message)}</h2>
      <p>Thử đổi bộ lọc hoặc thêm sản phẩm mới.</p>
    </div>
  `;
}

function getFilterParams(form: HTMLFormElement): ProductSearchParams {
  const formData = new FormData(form);
  return {
    keyword: String(formData.get('keyword') || ''),
    categoryCode: String(formData.get('categoryCode') || ''),
    status: String(formData.get('status') || ''),
    minPrice: String(formData.get('minPrice') || ''),
    maxPrice: String(formData.get('maxPrice') || ''),
    page: 0,
    size: Number(formData.get('size') || 10),
  };
}

function getProductPayload(form: HTMLFormElement): ProductUpsertReq {
  const formData = new FormData(form);

  return {
    code: String(formData.get('code') || '').trim(),
    name: String(formData.get('name') || '').trim(),
    iconLink: String(formData.get('iconLink') || '').trim(),
    cloneHref: String(formData.get('cloneHref') || '').trim(),
    installment: toNumber(formData.get('installment'), 0),
    priceShow: toNumber(formData.get('priceShow'), 0),
    priceThrough: toNumber(formData.get('priceThrough'), 0),
    percentDetail: String(formData.get('percentDetail') || '').trim(),
    productDisplay: String(formData.get('productDisplay') || '').trim(),
    productStorage: String(formData.get('productStorage') || '').trim(),
    couponPrice: String(formData.get('couponPrice') || '').trim(),
    priority: toNumber(formData.get('priority'), 1),
    status: toNumber(formData.get('status'), 1),
    categoryCode: String(formData.get('categoryCode') || '').trim(),
  };
}

function getImageFile(form: HTMLFormElement): File | undefined {
  const input = form.querySelector<HTMLInputElement>('#product-image');
  return input?.files?.[0];
}

function fillProductForm(product: ProductListItem): void {
  const form = document.getElementById('admin-product-form') as HTMLFormElement | null;
  if (!form) return;

  editingProductCode = product.code;
  setFormValue('product-code', product.code);
  setFormValue('product-name', product.name);
  setFormValue('product-category', product.categoryCode || findCategoryFromProduct(product));
  setFormValue('product-price-show', String(product.priceShow || 0));
  setFormValue('product-price-through', String(product.priceThrough || 0));
  setFormValue('product-display', product.productDisplay || '');
  setFormValue('product-storage', product.productStorage || '');
  setFormValue('product-percent', product.percentDetail || '');
  setFormValue('product-priority', String(product.priority ?? 1));
  setFormValue('product-coupon', product.couponPrice || '');
  setFormValue('product-icon-link', product.iconLink || '');
  setFormValue('product-status', String(product.status ?? 1));
  setFormValue('product-installment', String(product.installment ?? 0));
  setFormValue('product-clone-href', product.cloneHref || '');

  const codeInput = document.getElementById('product-code') as HTMLInputElement | null;
  const title = document.getElementById('admin-form-title');
  const submit = document.getElementById('admin-product-submit') as HTMLButtonElement | null;
  const cancel = document.getElementById('admin-form-cancel') as HTMLButtonElement | null;
  const message = document.getElementById('admin-form-message');

  if (codeInput) codeInput.readOnly = true;
  if (title) title.textContent = 'Sửa sản phẩm';
  if (submit) submit.textContent = 'Lưu thay đổi';
  if (cancel) cancel.hidden = false;
  setStatus(message, '', '');
  openProductModal();
}

function resetProductForm(): void {
  const form = document.getElementById('admin-product-form') as HTMLFormElement | null;
  const codeInput = document.getElementById('product-code') as HTMLInputElement | null;
  const title = document.getElementById('admin-form-title');
  const submit = document.getElementById('admin-product-submit') as HTMLButtonElement | null;
  const cancel = document.getElementById('admin-form-cancel') as HTMLButtonElement | null;

  editingProductCode = '';
  form?.reset();
  setFormValue('product-priority', '1');
  setFormValue('product-status', '1');
  setFormValue('product-installment', '0');
  if (codeInput) codeInput.readOnly = false;
  if (title) title.textContent = 'Thêm sản phẩm';
  if (submit) submit.textContent = 'Thêm sản phẩm';
  if (cancel) cancel.hidden = true;
}

function openProductModal(): void {
  const modal = document.getElementById('admin-product-modal');
  if (!modal) return;

  modal.hidden = false;
  document.body.classList.add('modal-open');
  window.setTimeout(() => {
    const firstInput = modal.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input:not([type="hidden"]), select, textarea'
    );
    firstInput?.focus();
  }, 0);
}

function closeProductModal(): void {
  const modal = document.getElementById('admin-product-modal');
  if (!modal) return;

  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

function findCategoryFromProduct(product: ProductListItem): string {
  const haystack = `${product.code} ${product.name}`.toLowerCase();

  const brandAliases: Record<string, string[]> = {
    apple: ['iphone', 'ipad', 'apple'],
    samsung: ['samsung', 'galaxy'],
    xiaomi: ['xiaomi', 'redmi', 'poco'],
    oppo: ['oppo'],
    vivo: ['vivo'],
    realme: ['realme'],
    nokia: ['nokia'],
    asus: ['asus', 'rog-phone'],
    tecno: ['tecno'],
    nubia: ['nubia'],
    honor: ['honor'],
    sony: ['sony', 'xperia'],
    infinix: ['infinix'],
    oneplus: ['oneplus', 'one-plus'],
    itel: ['itel'],
    tcl: ['tcl'],
    benco: ['benco'],
    masstel: ['masstel'],
    inoi: ['inoi'],
    nothingphone: ['nothing-phone', 'nothing phone'],
  };

  for (const [categoryCode, aliases] of Object.entries(brandAliases)) {
    if (aliases.some(alias => haystack.includes(alias))) {
      return categoryCode;
    }
  }

  const found = categories.find(category => {
    const code = (category.code || category.id || '').toLowerCase();
    return code && haystack.includes(code);
  });

  return found?.code || found?.id || '';
}

function setFormValue(id: string, value: string): void {
  const input = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  if (input) input.value = value;
}

function updateAdminStat(id: string, value: string): void {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setStatus(element: HTMLElement | null, text: string, type: 'success' | 'error' | ''): void {
  if (!element) return;
  element.hidden = !text;
  element.textContent = text;
  element.className = element.id === 'admin-products-status' || element.id === 'admin-resource-status'
    ? `admin-status ${type ? `admin-status-${type}` : ''}`
    : `form-message ${type ? `form-message-${type}` : ''}`;
}

function setButtonLoading(button: HTMLButtonElement | null, loading: boolean, label: string): void {
  if (!button) return;
  button.disabled = loading;
  button.textContent = label;
}

function toNumber(value: FormDataEntryValue | null, fallback: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function formatPrice(value?: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
