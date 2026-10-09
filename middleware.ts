import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCookieName } from '@/lib/auth';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/logout', '/api/checkout/create-session'];
const PUBLIC_GET_API_PATHS = ['/api/products', '/api/categories', '/api/blog', '/api/testimonials', '/api/features', '/api/content'];
const PUBLIC_POST_API_PATHS = ['/api/orders']; // success page confirms payment

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(getCookieName())?.value;
  const isAuthenticated = token ? await verifyToken(token) : null;

  // Protect /admin routes (except login page)
  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect API routes
  if (pathname.startsWith('/api/') && !PUBLIC_API_PATHS.includes(pathname)) {
    // Allow public GET requests to read-only endpoints
    if (request.method === 'GET' && PUBLIC_GET_API_PATHS.some(p => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    // Allow public POST to order confirmation endpoint
    if (request.method === 'POST' && PUBLIC_POST_API_PATHS.some(p => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    // All other API routes require auth
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'احراز هویت لازم است' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
