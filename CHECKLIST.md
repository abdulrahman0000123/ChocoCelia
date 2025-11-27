# ✅ Deployment Checklist

## Pre-Deployment (Done ✓)
- [x] Updated package.json with build scripts
- [x] Created vercel.json configuration
- [x] Updated Prisma schema to PostgreSQL
- [x] Added Arabic fields to Product and Category models
- [x] Created .env.example file
- [x] Added .gitignore file

## Setup Supabase
- [ ] Create Supabase account
- [ ] Create new project "choco-celia"
- [ ] Copy database connection string
- [ ] Save password securely

## Setup GitHub (if using GitHub Desktop)
- [ ] Download and install GitHub Desktop
- [ ] Create repository "choco-celia"
- [ ] Push code to GitHub
- [ ] Set repository to private

## Setup Vercel
- [ ] Create Vercel account
- [ ] Import project from GitHub
- [ ] Add environment variables:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
  - [ ] NEXT_PUBLIC_APP_URL (after first deploy)
- [ ] Deploy project
- [ ] Wait for build to complete

## Initialize Database
- [ ] Update local .env with Supabase URL
- [ ] Run: `npx prisma migrate deploy`
- [ ] Run: `npx prisma db seed`
- [ ] Verify admin user created

## Post-Deployment
- [ ] Test website is accessible
- [ ] Login to admin panel (/admin/login)
- [ ] Change admin password
- [ ] Upload logo
- [ ] Add contact information
- [ ] Add hero images
- [ ] Add first product
- [ ] Test dark mode
- [ ] Test language switching (EN/AR)
- [ ] Test on mobile

## Optional Enhancements
- [ ] Purchase custom domain
- [ ] Configure custom domain on Vercel
- [ ] Set up Google Analytics
- [ ] Add payment gateway (Paymob/Fawry)
- [ ] Configure email notifications
- [ ] Add WhatsApp integration
- [ ] Set up Facebook Pixel

## Maintenance
- [ ] Regular backups (Supabase automatic)
- [ ] Monitor Vercel analytics
- [ ] Check error logs
- [ ] Update products regularly
- [ ] Respond to orders

---

## Quick Commands

```powershell
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Database migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Generate Prisma client
npx prisma generate
```

---

## Important URLs

- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com/YOUR_USERNAME/choco-celia
- **Live Site**: https://choco-celia.vercel.app
- **Admin Panel**: https://choco-celia.vercel.app/admin/login

---

## Default Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN!**

---

Good luck with your deployment! 🚀🍫
