import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Add debug logging to middleware
export async function middleware(request) {
  console.log('Middleware - Processing request:', request.url);

  // Skip auth check for certain paths
  const publicPaths = [
    '/api/env-check',
    '/api/auth-debug',
    '/auth/test',
    '/auth/signin',
    '/auth/error',
    '/',
    '/favicon.ico',
    '/_next',
  ];

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith(path + '/') ||
    request.nextUrl.pathname.startsWith('/_next/')
  );

  if (isPublicPath) {
    console.log('Middleware - Public path, skipping auth check:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // For API routes related to auth
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    console.log('Middleware - Auth API route, skipping auth check:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Check authentication for protected routes
  try {
    console.log('Middleware - Checking auth for protected route:', request.nextUrl.pathname);
    return await auth(request);
  } catch (error) {
    console.error('Middleware - Auth error:', error);
    return NextResponse.next();
  }
}