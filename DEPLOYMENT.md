# CHOCO-CELIA Deployment Guide 🍫

## 📋 Prerequisites

Before deploying, you need:
1. **Supabase Account** (for PostgreSQL database)
2. **Vercel Account** (for hosting)

---

## 🗄️ Step 1: Setup Supabase Database

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Project Name**: `choco-celia`
   - **Database Password**: (Choose a strong password and SAVE IT!)
   - **Region**: `Central EU` (closest to Egypt)
   - **Pricing Plan**: **Free**
6. Click "Create new project"
7. Wait 2-3 minutes for setup

### 1.2 Get Database Connection String
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string (looks like this):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you chose
6. **SAVE THIS STRING** - you'll need it!

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Recommended)

#### 1. Create GitHub Repository (First Time)
Since Git is not installed locally, we'll create the repo directly on GitHub:

1. Go to https://github.com/new
2. Repository name: `choco-celia`
3. Make it **Private** (recommended)
4. Click "Create repository"

#### 2. Upload Code to GitHub
1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in
3. Click "File" → "Add Local Repository"
4. Select your project folder: `C:\Users\Abdo\OneDrive - Notley Green Primary School\Desktop\ChocoCelia`
5. Click "Create Repository"
6. Click "Publish repository"
7. Make sure "Keep this code private" is checked
8. Click "Publish repository"

#### 3. Deploy on Vercel
1. Go to https://vercel.com
2. Click "Sign Up" and choose "Continue with GitHub"
3. Click "Import Project"
4. Select `choco-celia` repository
5. Click "Import"

#### 4. Configure Environment Variables
Before deploying, add these environment variables:

Click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | (Paste your Supabase connection string) |
| `JWT_SECRET` | `your-random-secret-key-min-32-characters-long` |
| `NEXT_PUBLIC_APP_URL` | (Leave empty, will be set after deploy) |

#### 5. Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes
3. **Your site is live!** 🎉

---

### Option B: Deploy via Vercel CLI

If you want to use the command line:

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (choose your account)
# - Link to existing project? N
# - Project name? choco-celia
# - Directory? ./
# - Override settings? N

# Add environment variables
vercel env add DATABASE_URL
# Paste your Supabase connection string

vercel env add JWT_SECRET
# Enter a random secret key

# Deploy to production
vercel --prod
```

---

## 🔧 Step 3: Initialize Database

After deploying to Vercel:

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Click on `NEXT_PUBLIC_APP_URL` and edit it to your Vercel URL (e.g., `https://choco-celia.vercel.app`)

Now, run migrations on Supabase:

### Option 1: Using Vercel Console
1. Go to your project on Vercel
2. Click "Settings" → "Functions"
3. Create a new Serverless Function to run migrations

### Option 2: Using Local Prisma (Recommended)
```powershell
# Update your local .env file with Supabase URL
# Then run:

npx prisma migrate deploy
npx prisma db seed
```

---

## 📝 Step 4: Access Your Site

### Your Live URLs:
- **Main Site**: `https://choco-celia.vercel.app` (or your custom domain)
- **Admin Panel**: `https://choco-celia.vercel.app/admin/login`

### Default Admin Credentials:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

---

## 🎨 Step 5: Customize Your Site

1. Go to `/admin/dashboard/settings`
2. Upload your logo
3. Add your contact information
4. Set hero images (use Unsplash URLs)
5. Add products in `/admin/dashboard/products`

---

## 🐛 Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Make sure `DATABASE_URL` has no typos
- Verify Prisma schema is correct

### Database Connection Error
- Check Supabase project is running
- Verify connection string has correct password
- Check Supabase allows connections from Vercel IPs (should be default)

### Images Not Loading
- Use external image URLs (Unsplash, Imgur, etc.)
- Base64 images can cause issues in production
- Keep image sizes under 2MB

### Admin Login Not Working
- Check JWT_SECRET is set in Vercel
- Make sure you ran `npx prisma db seed` to create admin user
- Try resetting password in database

---

## 📊 Free Tier Limits

### Vercel Free Tier:
- ✅ 100 GB Bandwidth/month
- ✅ Unlimited websites
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ 100 GB-hours serverless function execution

### Supabase Free Tier:
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth/month
- ✅ 50 MB file storage
- ✅ 50,000 monthly active users
- ⚠️ Project pauses after 7 days of inactivity (free to resume)

---

## 🔄 Updating Your Site

After making changes locally:

### With GitHub Desktop:
1. Open GitHub Desktop
2. Write a commit message (e.g., "Updated hero images")
3. Click "Commit to main"
4. Click "Push origin"
5. Vercel will automatically redeploy! 🚀

### With Vercel CLI:
```powershell
vercel --prod
```

---

## 🎯 Next Steps

1. ✅ Buy a custom domain (optional, ~$10/year)
2. ✅ Set up Google Analytics
3. ✅ Add payment integration (Paymob, Fawry, etc.)
4. ✅ Configure email notifications
5. ✅ Add more products and categories

---

## 📞 Support

Need help? Check these resources:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Made with ❤️ and lots of chocolate** 🍫
