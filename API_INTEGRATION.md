# Product Category API Integration

## Overview

This project integrates two APIs from the backend "Danh mục sản phẩm" (Product Category) section:

1. **Get Categories List** - Retrieves all product categories
2. **Get Products by Category** - Retrieves products filtered by category ID

## API Endpoints

### Base URL
```
https://test.nicehairvietnam.com
```

### API 1: Get Categories List

**Endpoint:** `GET /api/categories`

**Description:** Retrieves a list of all product categories.

**Response Format:**
```typescript
{
  "success": boolean,
  "data": Category[],
  "message"?: string
}
```

**Category Interface:**
```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "smartphones",
      "name": "Smartphones",
      "description": "Latest smartphones from top brands",
      "image": "https://example.com/smartphones.jpg"
    },
    {
      "id": "tablets",
      "name": "Tablets",
      "description": "Tablets for work and entertainment"
    }
  ]
}
```

### API 2: Get Products by Category

**Endpoint:** `GET /api/categories/{categoryId}/products`

**Description:** Retrieves a paginated list of products for a specific category.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Number of items per page (default: 20)

**Response Format:**
```typescript
{
  "success": boolean,
  "data": {
    "items": Phone[],
    "total": number,
    "page": number,
    "pageSize": number
  },
  "message"?: string
}
```

**Example Request:**
```
GET /api/categories/smartphones/products?page=1&pageSize=20
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "iphone-15-pro",
        "name": "iPhone 15 Pro",
        "brand": "apple",
        "price": 999,
        "image": "https://example.com/iphone.jpg",
        "description": "Latest iPhone with A17 Pro chip",
        "specs": {
          "screen": "6.1\" Super Retina XDR",
          "cpu": "A17 Pro",
          "ram": "8GB",
          "storage": "256GB",
          "camera": "48MP + 12MP + 12MP",
          "battery": "3274mAh"
        },
        "inStock": true,
        "featured": true
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

## Implementation

### API Service

The API service is implemented in `src/api/apiService.ts`:

```typescript
class ApiService {
  // API 1: Get all categories
  async getCategories(): Promise<Category[]>
  
  // API 2: Get products by category with pagination
  async getProductsByCategory(
    categoryId: string, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<Phone[]>
  
  // Helper: Get single category
  async getCategoryById(categoryId: string): Promise<Category>
}
```

### Pages

#### Categories Page (`/categories`)
- Uses **API 1** to fetch and display all categories
- Implemented in `src/pages/categories.ts`
- Displays category cards with name, description, and image
- Each category has a "View Products" button

#### Category Products Page (`/category/:categoryId`)
- Uses **API 2** to fetch products for a specific category
- Implemented in `src/pages/categoryProducts.ts`
- Displays products in a grid layout
- Each product has an "Add to Cart" button
- Shows error state if category has no products

## Usage

### Navigation

1. Click "Categories" in the main navigation
2. Browse available categories
3. Click "View Products" on any category to see products
4. Products are displayed with full details and can be added to cart

### Routes

- `/categories` - Lists all categories (API 1)
- `/category/:categoryId` - Lists products for a specific category (API 2)

## Error Handling

The implementation includes comprehensive error handling:

- Network errors are caught and displayed to users
- API errors show user-friendly messages
- Error details are logged to console for debugging
- Failed API calls show error state with retry options

## Types

All TypeScript interfaces are defined in `src/types.ts`:

```typescript
// Category type
interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Paginated response
interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
  message?: string;
}
```

## Testing

To test the integration:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:5173/categories

3. The page will attempt to fetch categories from the backend

4. Click on any category to view its products

## Notes

- The backend API must be accessible and CORS-enabled for the frontend to connect
- API endpoints follow RESTful conventions
- All API calls use standard HTTP GET requests with JSON responses
- Authentication/authorization can be added by extending the `fetchApi` method with appropriate headers

## Screenshots

### Categories Page
![Categories Page](https://github.com/user-attachments/assets/7b9c44c6-f86c-436b-8123-207d09329c29)

The screenshot shows the Categories page with the "Categories" link in the navigation. When the backend is accessible, this page will display all product categories.
