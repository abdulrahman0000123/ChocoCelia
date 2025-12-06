# 🍫 ChocoCelia - Premium Chocolate E-Commerce Platform

A modern, bilingual (English/Arabic) e-commerce platform for artisan chocolate products, built with Next.js 15 and featuring a complete admin dashboard.

## 🌟 Features

### Customer-Facing Features
- 🌍 **Bilingual Support**: Full English and Arabic translations with RTL support
- 🛒 **Shopping Cart**: Modern cart drawer with smooth animations
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop
- 🎨 **Modern UI**: Glass morphism, gradient designs, and smooth transitions
- 🔍 **Product Catalog**: Browse products by categories with detailed views
- ✉️ **Checkout System**: Simple order placement with WhatsApp/Call options
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 🎭 **Animations**: Framer Motion powered animations throughout
- 🖼️ **Image Gallery**: Product image carousel with zoom functionality

### Admin Dashboard Features
- 🔐 **Secure Authentication**: Protected admin panel with session management
- 📊 **Dashboard Statistics**: Real-time overview of orders, products, and revenue
- 📦 **Product Management**: Full CRUD operations for products
- 🏷️ **Category Management**: Organize products into categories
- 📋 **Order Management**: View, update, and track customer orders
- 📤 **Export Orders**: Download orders as CSV for external processing
- ⚙️ **Site Settings**: Customize site information, hero slides, and feature cards
- 📱 **Mobile Optimized**: Responsive admin interface for on-the-go management

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.0.7 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Cairo (Arabic), Geist (English)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### Backend
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Custom session-based auth
- **API**: Next.js API Routes
- **Password Hashing**: bcryptjs

### Deployment
- **Platform**: Vercel
- **Database**: Neon PostgreSQL
- **Domain**: choco-celia2.vercel.app

## 📂 Project Structure

```
ChocoCelia/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin Dashboard
│   │   ├── dashboard/
│   │   │   ├── categories/       # Category management
│   │   │   ├── orders/           # Order management
│   │   │   ├── products/         # Product management
│   │   │   └── settings/         # Site settings
│   │   └── login/                # Admin login
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── categories/           # Category CRUD
│   │   ├── orders/               # Order management
│   │   ├── products/             # Product CRUD
│   │   └── settings/             # Settings management
│   ├── components/               # Reusable components
│   │   ├── CartDrawer.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   └── ProductCard.tsx
│   ├── context/                  # React Context
│   │   ├── CartContext.tsx       # Shopping cart state
│   │   └── LanguageContext.tsx   # i18n state
│   ├── lib/                      # Utilities
│   │   ├── auth.ts               # Authentication helpers
│   │   ├── db.ts                 # Database connection
│   │   ├── imageUtils.ts         # Image upload helpers
│   │   └── translations.ts       # Translation strings
│   ├── menu/                     # Product catalog pages
│   ├── checkout/                 # Checkout page
│   ├── about/                    # About page
│   └── contact/                  # Contact page
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── public/                       # Static assets
├── __tests__/                    # Test files
└── scripts/                      # Utility scripts

```

## 🗄️ Database Schema

### Models
- **Admin**: Admin users with secure credentials
- **Category**: Product categories (e.g., Dark, Milk, White)
- **Product**: Chocolate products with images and details
- **Order**: Customer orders with items and status tracking
- **OrderItem**: Individual items within orders
- **SiteSettings**: Configurable site content

## 🚀 Getting Started


## 📱 Usage Guide

### Customer Flow
1. Browse products on home page or menu
2. Switch language (EN/AR) using language toggle
3. Add products to cart
4. View cart and proceed to checkout
5. Fill order form with delivery details
6. Submit order (admin receives notification)

### Admin Flow
1. Login at `/admin/login`
2. View dashboard statistics
3. Manage products:
   - Add new products with images
   - Edit existing products
   - Delete products
   - Organize by categories
4. Manage orders:
   - View order details
   - Update order status (Pending/Completed/Cancelled)
   - Export orders to CSV
5. Customize site:
   - Update hero slides
   - Edit feature cards
   - Modify site information



Test coverage includes:
- ✅ API Routes (auth, products, categories, orders, settings)
- ✅ Components (Cart, Navbar, Footer, ProductCard)
- ✅ Context (CartContext, LanguageContext)
- ✅ Utilities (auth, translations, imageUtils)

## 🔒 Security Features

- ✅ Session-based authentication
- ✅ Password hashing with bcrypt
- ✅ HTTP-only cookies
- ✅ CSRF protection
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React escaping)
- ✅ Environment variable security

## 📊 Performance Optimizations

- ⚡ Server-side rendering (SSR)
- ⚡ Image optimization (next/image)
- ⚡ Code splitting and lazy loading
- ⚡ Turbopack dev server
- ⚡ Database connection pooling
- ⚡ API response caching

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy automatically on push


**Abdulrahman**
- GitHub: [@abdulrahman0000123](https://github.com/abdulrahman0000123)
- Project: [ChocoCelia](https://github.com/abdulrahman0000123/ChocoCelia)

## 🙏 Acknowledgments

- Cairo font by Google Fonts
- Lucide icons library
- Framer Motion animation library
- Neon PostgreSQL hosting
- Vercel deployment platform

## 📞 Support

For issues or questions:
1. Check existing issues on GitHub
2. Create new issue with detailed description
3. Include error messages and screenshots

---

**Live Demo**: [https://choco-celia2.vercel.app](https://choco-celia2.vercel.app)

**Admin Panel**: [https://choco-celia2.vercel.app/admin/login](https://choco-celia2.vercel.app/admin/login)

Made with ❤️ and 🍫
