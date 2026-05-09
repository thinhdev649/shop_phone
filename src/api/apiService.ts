// Real API service to connect to backend
import type {
  ApiResponse,
  Category,
  Phone,
  ProductDetail,
  ProductListItem,
  ProductPage,
  ProductSearchParams,
} from '../types';

const API_BASE_URL = ''; // Use relative path to leverage Vite proxy

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * API 1: Get list of all product categories
   * Endpoint: GET /api/category
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.fetchApi<ApiResponse<Category[]>>('/api/category');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Public product search endpoint.
   * Endpoint: GET /api/products
   */
  async getProductPage(params: ProductSearchParams = {}): Promise<ProductPage> {
    const query = new URLSearchParams();

    this.appendQuery(query, 'keyword', params.keyword);
    this.appendQuery(query, 'categoryCode', params.categoryCode);
    this.appendQuery(query, 'status', params.status);
    this.appendQuery(query, 'minPrice', params.minPrice);
    this.appendQuery(query, 'maxPrice', params.maxPrice);
    this.appendQuery(query, 'sortBy', params.sortBy);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 500));

    const response = await this.fetchApi<ApiResponse<ProductPage>>(`/api/products?${query.toString()}`);
    return response.data;
  }

  async getProducts(params: ProductSearchParams = {}): Promise<Phone[]> {
    const page = await this.getProductPage(params);
    const items = Array.isArray(page?.content) ? page.content : [];
    return items.map(item => this.mapProductItem(item, params.categoryCode || ''));
  }

  /**
   * API 2: Get list of products by category ID
   * Endpoint: GET /api/list-product-by-category/{categoryId}
   */
  async getProductsByCategory(categoryId: string): Promise<Phone[]> {
    try {
      return await this.getProducts({ categoryCode: categoryId, page: 0, size: 500 });
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Additional helper: Get single category by ID
   */
  async getCategoryById(categoryId: string): Promise<Category> {
    try {
      const response = await this.fetchApi<ApiResponse<Category>>(`/api/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * API 3: Get product detail by product code
   * Endpoint: GET /api/product-detail/{code}
   */
  async getProductDetail(productCode: string): Promise<ProductDetail | null> {
    try {
      const response = await this.fetchApi<ApiResponse<ProductDetail>>(
        `/api/product-detail/${productCode}`
      );
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching product detail for ${productCode}:`, error);
      return null;
    }
  }

  private mapProductItem(item: ProductListItem, brand = ''): Phone {
    const description = `${item.productDisplay || ''} ${item.productStorage || ''}`.trim();

    return {
      id: item.code,
      name: item.name,
      brand,
      price: Number(item.priceShow) || 0,
      image: item.iconLink || '',
      description,
      specs: {
        screen: item.productDisplay || '',
        cpu: '',
        ram: item.productStorage || '',
        storage: item.productStorage || '',
        camera: '',
        battery: '',
      },
      inStock: item.status !== 0,
      featured: false,
    };
  }

  private appendQuery(query: URLSearchParams, key: string, value?: string): void {
    const normalized = value?.trim();
    if (normalized) query.set(key, normalized);
  }
}

export const apiService = new ApiService();
