import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const protectedRoutes = [
  '/account',
  '/orders',
  '/checkout',
  '/wishlist',
];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visits login or register, redirect away
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    const callbackUrlParam = req.nextUrl.searchParams.get('callbackUrl');
    const destination = callbackUrlParam ? decodeURIComponent(callbackUrlParam) : '/account';
    return NextResponse.redirect(new URL(destination, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/account',
    '/account/:path*',
    '/orders',
    '/orders/:path*',
    '/checkout',
    '/checkout/:path*',
    '/wishlist',
    '/wishlist/:path*',
    '/login',
    '/register',
  ],
};

