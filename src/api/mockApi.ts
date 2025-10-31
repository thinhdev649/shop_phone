// Mock API service to simulate backend
// Mock API service to simulate backend
import type {Brand, Phone} from '../types.ts';
import { brands, phones } from './mockData';

class MockAPI {
  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getBrands(): Promise<Brand[]> {
    await this.delay();
    return [...brands];
  }

  async getBrandById(id: string): Promise<Brand | undefined> {
    await this.delay();
    return brands.find(b => b.id === id);
  }

  async getPhones(): Promise<Phone[]> {
    await this.delay();
    return [...phones];
  }

  async getPhoneById(id: string): Promise<Phone | undefined> {
    await this.delay();
    return phones.find(p => p.id === id);
  }

  async getPhonesByBrand(brandId: string): Promise<Phone[]> {
    await this.delay();
    return phones.filter(p => p.brand === brandId);
  }

  async getFeaturedPhones(): Promise<Phone[]> {
    await this.delay();
    return phones.filter(p => p.featured);
  }

  async searchPhones(query: string): Promise<Phone[]> {
    await this.delay();
    const lowerQuery = query.toLowerCase();
    return phones.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }
}

export const mockAPI = new MockAPI();
