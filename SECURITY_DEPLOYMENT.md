# Security and deployment notes

## Required after deploy

The former public admin setup route has been removed. A public request to it could reset the administrator password, so rotate the admin password after this version is live:

1. Sign in through `/admin/login` with the administrator's current credentials.
2. Open **Security** in the dashboard sidebar and set a unique password with at least 12 characters, uppercase and lowercase letters, and a number.

The security page changes the password only after checking the current password. Do not put passwords or secret values in the repository.

## Vercel environment

- Set `NEXT_PUBLIC_SITE_URL` to the one canonical public origin. Use `https://choco-celia2.vercel.app` until a custom domain is confirmed and configured.
- Set `JWT_SECRET` to a dedicated random value. Generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"` and add it to Vercel's environment variables. If this variable is absent, the app derives a session key from the private `DATABASE_URL`. Changing the configured key source or value invalidates existing sessions, so admins will need to sign in again.
- The deployment build synchronizes the additive `LoginAttempt` table from `prisma/schema.prisma`; the database-backed login limiter needs that table before login requests run.

Canonical URLs and sitemap entries use `NEXT_PUBLIC_SITE_URL`. Search engines can discover the sitemap automatically from `robots.txt`; submit it in Google Search Console and Bing Webmaster Tools after deployment to request faster discovery. Search engines decide when and whether to index pages.
