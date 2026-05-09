import { authService } from './authService';
import type {
  ApiResponse,
  BoxGalleryAdminItem,
  BoxGalleryUpsertReq,
  CategoryAdminItem,
  CategoryUpsertReq,
  ProductDetailAdminItem,
  ProductDetailUpsertReq,
  ProductPage,
  ProductSearchParams,
  ProductUpsertReq,
  ProductVariantAdminItem,
  ProductVariantUpsertReq,
} from '../types';

interface ProductDetailAdminParams {
  productId?: string;
  status?: string;
}

interface ProductChildAdminParams {
  parent?: string;
  status?: string;
}

class AdminProductService {
  async searchProducts(params: ProductSearchParams = {}): Promise<ProductPage> {
    const query = new URLSearchParams();

    this.appendQuery(query, 'keyword', params.keyword);
    this.appendQuery(query, 'categoryCode', params.categoryCode);
    this.appendQuery(query, 'status', params.status);
    this.appendQuery(query, 'minPrice', params.minPrice);
    this.appendQuery(query, 'maxPrice', params.maxPrice);
    this.appendQuery(query, 'sortBy', params.sortBy);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 10));

    const response = await this.request<ApiResponse<ProductPage>>(`/api/products?${query.toString()}`);
    return response.data;
  }

  async createProduct(payload: ProductUpsertReq, image?: File): Promise<unknown> {
    const formData = this.createMultipartFormData(payload, image);
    return this.request('/api/admin/products', {
      method: 'POST',
      body: formData,
      auth: true,
    });
  }

  async updateProduct(productCode: string, payload: ProductUpsertReq, image?: File): Promise<unknown> {
    const formData = this.createMultipartFormData(payload, image);
    return this.request(`/api/admin/products/${encodeURIComponent(productCode)}`, {
      method: 'PUT',
      body: formData,
      auth: true,
    });
  }

  async deleteProduct(productCode: string): Promise<unknown> {
    return this.request(`/api/admin/products/${encodeURIComponent(productCode)}`, {
      method: 'DELETE',
      auth: true,
    });
  }

  async listAdminCategories(status?: string): Promise<CategoryAdminItem[]> {
    const query = new URLSearchParams();
    this.appendQuery(query, 'status', status);

    const response = await this.request<ApiResponse<CategoryAdminItem[]>>(
      `/api/admin/categories${this.withQuery(query)}`,
      { auth: true }
    );
    return response.data || [];
  }

  async getAdminCategory(code: string): Promise<CategoryAdminItem> {
    const response = await this.request<ApiResponse<CategoryAdminItem>>(
      `/api/admin/categories/${encodeURIComponent(code)}`,
      { auth: true }
    );
    return response.data;
  }

  async createCategory(payload: CategoryUpsertReq, image?: File): Promise<unknown> {
    const formData = this.createMultipartFormData(payload, image);
    return this.request('/api/admin/categories', {
      method: 'POST',
      body: formData,
      auth: true,
    });
  }

  async updateCategory(categoryCode: string, payload: CategoryUpsertReq, image?: File): Promise<unknown> {
    const formData = this.createMultipartFormData(payload, image);
    return this.request(`/api/admin/categories/${encodeURIComponent(categoryCode)}`, {
      method: 'PUT',
      body: formData,
      auth: true,
    });
  }

  async deleteCategory(categoryCode: string): Promise<unknown> {
    return this.request(`/api/admin/categories/${encodeURIComponent(categoryCode)}`, {
      method: 'DELETE',
      auth: true,
    });
  }

  async listProductDetails(params: ProductDetailAdminParams = {}): Promise<ProductDetailAdminItem[]> {
    const query = new URLSearchParams();
    this.appendQuery(query, 'productId', params.productId);
    this.appendQuery(query, 'status', params.status);

    const response = await this.request<ApiResponse<ProductDetailAdminItem[]>>(
      `/api/admin/product-details${this.withQuery(query)}`,
      { auth: true }
    );
    return response.data || [];
  }

  async getProductDetail(id: string): Promise<ProductDetailAdminItem> {
    const response = await this.request<ApiResponse<ProductDetailAdminItem>>(
      `/api/admin/product-details/${encodeURIComponent(id)}`,
      { auth: true }
    );
    return response.data;
  }

  async createProductDetail(payload: ProductDetailUpsertReq): Promise<unknown> {
    return this.request('/api/admin/product-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      auth: true,
    });
  }

  async updateProductDetail(id: string, payload: ProductDetailUpsertReq): Promise<unknown> {
    return this.request(`/api/admin/product-details/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      auth: true,
    });
  }

  async deleteProductDetail(id: string): Promise<unknown> {
    return this.request(`/api/admin/product-details/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    });
  }

  async listProductVariants(params: ProductChildAdminParams = {}): Promise<ProductVariantAdminItem[]> {
    const query = new URLSearchParams();
    this.appendQuery(query, 'parent', params.parent);
    this.appendQuery(query, 'status', params.status);

    const response = await this.request<ApiResponse<ProductVariantAdminItem[]>>(
      `/api/admin/product-variants${this.withQuery(query)}`,
      { auth: true }
    );
    return response.data || [];
  }

  async getProductVariant(id: string): Promise<ProductVariantAdminItem> {
    const response = await this.request<ApiResponse<ProductVariantAdminItem>>(
      `/api/admin/product-variants/${encodeURIComponent(id)}`,
      { auth: true }
    );
    return response.data;
  }

  async createProductVariant(payload: ProductVariantUpsertReq, image?: File): Promise<unknown> {
    const formData = this.createMultipartFormData(payload, image);
    return this.request('/api/admin/product-variants', {
      method: 'POST',
      body: formData,
      auth: true,
    });
  }

  async updateProductVariant(id: string, payload: ProductVariantUpsertReq, image?: File): Promise<unknown> {
    const formData = this.createMultipartFormData(payload, image);
    return this.request(`/api/admin/product-variants/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: formData,
      auth: true,
    });
  }

  async deleteProductVariant(id: string): Promise<unknown> {
    return this.request(`/api/admin/product-variants/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    });
  }

  async listBoxGallery(params: ProductChildAdminParams = {}): Promise<BoxGalleryAdminItem[]> {
    const query = new URLSearchParams();
    this.appendQuery(query, 'parent', params.parent);
    this.appendQuery(query, 'status', params.status);

    const response = await this.request<ApiResponse<BoxGalleryAdminItem[]>>(
      `/api/admin/box-gallery${this.withQuery(query)}`,
      { auth: true }
    );
    return response.data || [];
  }

  async getBoxGalleryItem(id: string): Promise<BoxGalleryAdminItem> {
    const response = await this.request<ApiResponse<BoxGalleryAdminItem>>(
      `/api/admin/box-gallery/${encodeURIComponent(id)}`,
      { auth: true }
    );
    return response.data;
  }

  async createBoxGalleryItem(payload: BoxGalleryUpsertReq, image?: File): Promise<unknown> {
    const formData = this.createMultipartFormData(payload, image);
    return this.request('/api/admin/box-gallery', {
      method: 'POST',
      body: formData,
      auth: true,
    });
  }

  async updateBoxGalleryItem(id: string, payload: BoxGalleryUpsertReq, image?: File): Promise<unknown> {
    const formData = this.createMultipartFormData(payload, image);
    return this.request(`/api/admin/box-gallery/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: formData,
      auth: true,
    });
  }

  async deleteBoxGalleryItem(id: string): Promise<unknown> {
    return this.request(`/api/admin/box-gallery/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    });
  }

  private createMultipartFormData(payload: object, image?: File): FormData {
    const formData = new FormData();
    formData.append('req', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    if (image && image.size > 0) {
      formData.append('image', image);
    }

    return formData;
  }

  private async request<T>(endpoint: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.auth) {
      Object.entries(authService.getAuthHeader()).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const payload = await this.parseResponse(response);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(this.getForbiddenMessage(endpoint));
      }

      throw new Error(this.getErrorMessage(payload) || `API request failed: ${response.status}`);
    }

    return payload as T;
  }

  private appendQuery(query: URLSearchParams, key: string, value?: string): void {
    const normalized = value?.trim();
    if (normalized) query.set(key, normalized);
  }

  private withQuery(query: URLSearchParams): string {
    const serialized = query.toString();
    return serialized ? `?${serialized}` : '';
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  private getErrorMessage(payload: unknown): string {
    if (!payload || typeof payload !== 'object') return '';

    const record = payload as Record<string, unknown>;
    const data = record.data;

    return String(
      record.message ||
      record.error ||
      (data && typeof data === 'object' ? (data as Record<string, unknown>).message : '') ||
      ''
    );
  }

  private getForbiddenMessage(endpoint: string): string {
    if (endpoint.startsWith('/api/admin/products')) {
      return 'Backend đang trả 403 khi lưu sản phẩm. Frontend đã gửi token ADMIN, cần backend mở quyền cho API /api/admin/products.';
    }

    return 'Backend từ chối quyền thao tác (403). Vui lòng đăng nhập lại bằng tài khoản ADMIN hoặc kiểm tra phân quyền API.';
  }
}

export const adminProductService = new AdminProductService();
