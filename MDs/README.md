# 🍫 ChocoCelia - Premium Chocolate E-Commerce

A modern, full-featured e-commerce platform for luxury chocolate products built with Next.js 16, React 19, and Prisma.

## ✨ Features

### Customer Features
- 🛍️ **Modern Shopping Experience**: Browse and purchase premium chocolates
- 🌐 **Bilingual Support**: Full English and Arabic language support with RTL
- 🛒 **Shopping Cart**: Dynamic cart with real-time updates and slide-out drawer
- 📱 **Responsive Design**: Beautiful gradient UI on all devices
- 🎨 **Modern Gradients**: Orange-amber gradient theme throughout
- 💳 **Easy Checkout**: Streamlined order process with delivery information
- 🎬 **Hero Slider**: Engaging homepage with smooth animations
- 📖 **About & Contact Pages**: Learn about the brand and get in touch

### Admin Dashboard
- 📊 **Dashboard**: Overview of orders and products
- 📦 **Product Management**: Create, edit, and delete products with Arabic/English names
- 🏷️ **Category Management**: Organize products by categories (bilingual support)
- 📋 **Order Management**: View and manage customer orders with full details
- ⚙️ **Settings**: Configure site settings (phone, social media, logo)

## 🚀 Tech Stack

- **Framework**: Next.js 16.0.5 (App Router + Turbopack)
- **UI Library**: React 19.2.0
- **Database**: SQLite with Prisma ORM 5.22.0
- **Styling**: Tailwind CSS with custom orange-amber gradients
- **Animations**: Framer Motion
- **Authentication**: Session-based auth with bcryptjs
- **Language**: TypeScript

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ChocoCelia
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-secret-key-here"
```

4. **Initialize the database**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Seed initial data**
Visit `http://localhost:3000/api/setup-admin` after starting the server to create:
- Admin user (username: `admin`, password: `admin123`)
- Initial categories with Arabic names
- Sample products

6. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## 🔑 Admin Access

- **URL**: `http://localhost:3000/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## 🏗️ Project Structure

```
ChocoCelia/
├── app/
│   ├── admin/              # Admin dashboard pages
│   │   ├── dashboard/      # Main admin area
│   │   │   ├── products/   # Product management
│   │   │   ├── categories/ # Category management
│   │   │   ├── orders/     # Order management
│   │   │   └── settings/   # Site settings
│   │   └── login/          # Admin authentication
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── products/       # Product CRUD
│   │   ├── orders/         # Order management
│   │   ├── settings/       # Settings API
│   │   └── setup-admin/    # Initial setup
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.tsx      # Main navigation (gradient design)
│   │   ├── CartDrawer.tsx  # Shopping cart
│   │   ├── ProductCard.tsx # Product display
│   │   └── Footer.tsx      # Site footer
│   ├── context/            # React contexts
│   │   ├── CartContext.tsx # Shopping cart state
│   │   └── LanguageContext.tsx # Language switching
│   ├── lib/                # Utilities and database
│   │   ├── db.ts           # Database connection
│   │   ├── auth.ts         # Authentication helpers
│   │   └── translations.ts # Language translations
│   ├── menu/               # Product listing pages
│   ├── checkout/           # Checkout flow
│   ├── about/              # About page
│   └── contact/            # Contact page
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## 🎨 Key Features Details

### Shopping Features
- Product browsing with category filters
- Dynamic cart with quantity management and animations
- Product detail pages with full descriptions
- Bilingual product names and descriptions
- Delivery charges information:
  - داخل بني سويف: 20 جنيه
  - شرق النيل: 35 جنيه

### Order Management System
- Orders saved to database with complete details
- Customer information capture:
  - Name and phone number (required)
  - Email address (optional)
  - Delivery address
  - Preferred contact method (WhatsApp/Phone)
  - Special requests
- Order status workflow: PENDING → COMPLETED/CANCELLED
- Admin can view full order details including:
  - All customer information
  - Complete list of ordered items with quantities
  - Order total with itemized breakdown
  - Status management buttons
- Order deletion for admins

### Multi-language Support
- English and Arabic interface
- RTL (Right-to-Left) support for Arabic
- Bilingual product names and descriptions
- Language toggle in navbar
- Translated admin panel

### Modern UI Design
- No dark mode (removed for simplified design)
- Orange-amber gradient theme throughout
- Gradient backgrounds: `from-amber-50 via-orange-50 to-amber-50`
- Gradient borders: `from-amber-400 via-orange-500 to-amber-400`
- Gradient buttons: `from-orange-500 via-amber-500 to-orange-500`
- Smooth animations with Framer Motion
- Mobile-responsive gradient design

## 📱 Responsive Design

The application is fully responsive and works perfectly on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1280px+)

## 🚀 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import project in Vercel**
   - Go to vercel.com
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure environment variables**
   ```env
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET="your-secure-random-secret-key"
   ```
   
4. **Deploy**
   - Vercel will automatically build and deploy
   - First deployment creates a production URL

5. **Initialize database**
   - Visit `https://your-app.vercel.app/api/setup-admin`
   - This creates the admin user and initial data

### Environment Variables for Production

⚠️ **Critical for Production:**

```env
# Database connection
DATABASE_URL="file:./dev.db"

# Session security (CHANGE THIS!)
SESSION_SECRET="generate-a-secure-random-string-here"
```

**Generate a secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Production Checklist

- [ ] Change admin password from `admin123` to a secure value
- [ ] Update `SESSION_SECRET` to a cryptographically random string
- [ ] Configure production database (upgrade to PostgreSQL for production)
- [ ] Test `/api/setup-admin` endpoint after deployment
- [ ] Verify all environment variables are set
- [ ] Test order creation and admin functionality
- [ ] Update contact information in settings

## 📄 Database Schema

### Models

- **User**: Admin users with hashed passwords
- **Product**: Product catalog with bilingual names
- **Category**: Product categories with Arabic/English names
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual items within orders
- **SiteSettings**: Site-wide configuration

### Order Schema
```prisma
model Order {
  id                String      @id @default(cuid())
  customerName      String
  customerPhone     String
  customerEmail     String?
  customerAddress   String
  preferredContact  String      @default("whatsapp")
  specialRequests   String?
  items             OrderItem[]
  total             Float
  status            String      @default("PENDING")
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

## 🛠️ Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev # Create new migration
```

## 🎯 Shipping Information

Configure these in your checkout display:
- داخل بني سويف: 20 جنيه
- شرق النيل: 35 جنيه

## 🔧 Troubleshooting

### Database Issues
If you encounter foreign key constraint errors:
1. Visit `/api/setup-admin` to reinitialize
2. Or run: `npx prisma migrate reset --force`

### Port Conflicts
If port 3000 is in use:
```bash
# Windows PowerShell
taskkill /F /IM node.exe
Remove-Item -Recurse -Force .next
npm run dev
```

### Build Errors
Clear cache and rebuild:
```bash
Remove-Item -Recurse -Force .next
npm run build
```

## 📞 Support

For support or inquiries:
- Configure your contact information in the Admin Settings panel
- Visit the `/contact` page
- Check the admin dashboard for order management

## 📝 License

This project is private and proprietary.

---

**Built with ❤️ for ChocoCelia Premium Chocolates**
