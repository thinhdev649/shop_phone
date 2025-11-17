// Real API service to connect to backend
import type { Category, Phone, ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = 'https://test.nicehairvietnam.com';

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
   * Endpoint: GET /api/categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.fetchApi<ApiResponse<Category[]>>('/api/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * API 2: Get list of products by category ID
   * Endpoint: GET /api/categories/{categoryId}/products
   */
  async getProductsByCategory(categoryId: string, page: number = 1, pageSize: number = 20): Promise<Phone[]> {
    try {
      const response = await this.fetchApi<PaginatedResponse<Phone>>(
        `/api/categories/${categoryId}/products?page=${page}&pageSize=${pageSize}`
      );
      return response.data.items;
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
}

export const apiService = new ApiService();
