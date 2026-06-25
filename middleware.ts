import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - api routes
  // - admin dashboard
  // - Next.js internals (_next)
  // - Vercel internals (_vercel)
  // - static files containing dot (e.g. favicon.ico, image.png, etc.)
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
