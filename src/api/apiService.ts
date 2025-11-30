// Real API service to connect to backend
import type { Category, Phone, ApiResponse, ProductDetail } from '../types';

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
   * API 2: Get list of products by category ID
   * Endpoint: GET /api/list-product-by-category/{categoryId}
   */
  async getProductsByCategory(categoryId: string): Promise<Phone[]> {
    try {
      const response = await this.fetchApi<ApiResponse<any[]>>(
        `/api/list-product-by-category/${categoryId}`
      );
      const items = Array.isArray(response?.data) ? response.data : [];
      return items.map((item: any) => ({
        id: item.code,
        name: item.name,
        brand: categoryId,
        price: Number(item.priceShow) || 0,
        image: item.iconLink,
        description: `${item.productDisplay || ''} ${item.productStorage || ''}`.trim(),
        specs: {
          screen: item.productDisplay || '',
          cpu: '',
          ram: item.productStorage || '',
          storage: item.productStorage || '',
          camera: '',
          battery: '',
        },
        inStock: true,
        featured: false,
      }));
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
}

export const apiService = new ApiService();
