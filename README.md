# PhoneShop - Modern Phone E-commerce Website

A fully functional phone e-commerce website built with TypeScript, Vite, and vanilla JavaScript. Features a clean, modern UI with shopping cart functionality and brand-based navigation.

## Features

✨ **Modern Single Page Application (SPA)**
- Client-side routing with no page reloads
- Smooth navigation between pages
- Clean URL structure

📱 **Phone Catalog**
- Browse phones by brand (Apple, Samsung, Xiaomi, OPPO, Vivo, Google)
- Featured phones showcase
- Detailed product pages with specifications
- High-quality product images

🛒 **Shopping Cart**
- Add/remove items
- Adjust quantities
- Persistent cart (saved in localStorage)
- Real-time cart badge updates
- Order summary with shipping and tax calculation

🎨 **Modern UI/UX**
- Responsive design (mobile, tablet, desktop)
- Clean and professional styling
- Smooth transitions and hover effects
- Intuitive navigation

## Project Structure

```
shop/
├── src/
│   ├── api/
│   │   ├── mockData.ts      # Mock phone and brand data
│   │   └── mockApi.ts       # Mock API service (simulates backend)
│   ├── components/
│   │   └── header.ts        # Header component with navigation
│   ├── pages/
│   │   ├── home.ts          # Homepage with hero, brands, and featured phones
│   │   ├── brands.ts        # All brands listing page
│   │   ├── brand.ts         # Single brand page with phones
│   │   ├── phones.ts        # All phones listing page
│   │   ├── phoneDetail.ts   # Product detail page
│   │   └── cart.ts          # Shopping cart page
│   ├── utils/
│   │   ├── router.ts        # SPA router
│   │   └── cart.ts          # Shopping cart manager
│   ├── types.ts             # TypeScript interfaces
│   ├── style.css            # Global styles
│   └── main.ts              # App entry point
├── index.html
├── package.json
└── tsconfig.json
```

## Pages

1. **Homepage (`/`)**
   - Hero section
   - Shop by brand section (6 brands)
   - Featured phones
   - Why choose us section

2. **Brands Page (`/brands`)**
   - All available phone brands

3. **Brand Page (`/brand/:brandId`)**
   - Brand header with logo
   - All phones from specific brand

4. **All Phones (`/phones`)**
   - Complete phone catalog

5. **Phone Detail (`/phone/:phoneId`)**
   - Product images
   - Detailed specifications
   - Price and stock status
   - Quantity selector
   - Add to cart
   - Related phones from same brand

6. **Shopping Cart (`/cart`)**
   - Cart items with images
   - Quantity adjustment
   - Remove items
   - Order summary
   - Checkout button

## Mock Data

The app includes 16 phones across 6 brands:

- **Apple**: iPhone 15 Pro Max, iPhone 15, iPhone 14
- **Samsung**: Galaxy S24 Ultra, Galaxy S24, Galaxy Z Fold5
- **Xiaomi**: Xiaomi 14 Pro, Xiaomi 13
- **OPPO**: OPPO Find X6 Pro, OPPO Reno 11
- **Vivo**: Vivo X100 Pro, Vivo V29
- **Google**: Pixel 8 Pro, Pixel 8

Each phone includes:
- Name, brand, price
- High-quality image (from Unsplash)
- Description
- Full specifications (screen, CPU, RAM, storage, camera, battery)
- Stock status
- Featured flag

## Technologies

- **TypeScript** - Type-safe code
- **Vite** - Fast development server and build tool
- **Vanilla JavaScript** - No frameworks, pure JS
- **CSS3** - Modern styling with CSS variables
- **LocalStorage** - Persistent shopping cart

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## Key Features Explained

### Mock API
The `mockApi.ts` simulates a real backend with:
- Async/await patterns
- Simulated network delay (300ms)
- CRUD-like operations
- Data filtering and search

### Router
Custom SPA router with:
- Dynamic route parameters (`:brandId`, `:phoneId`)
- Browser history API integration
- Link interception
- 404 handling

### Cart Manager
Shopping cart with:
- Singleton pattern
- Observer pattern for updates
- LocalStorage persistence
- Automatic total calculation

### Responsive Design
- Mobile-first approach
- Breakpoint at 768px
- Flexible grid layouts
- Touch-friendly interfaces

## Future Enhancements

Potential improvements:
- User authentication
- Real backend integration
- Product search functionality
- Filters (price range, specs)
- Product reviews and ratings
- Wishlist functionality
- Multiple product images
- Payment integration
- Order history
- Admin panel

## Browser Support

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Built with ❤️ using TypeScript and Vite**
