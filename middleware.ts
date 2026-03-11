import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the session token from cookies
  // NextAuth v5 uses 'authjs.session-token' or 'next-auth.session-token'
  const sessionToken = 
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  const isLoggedIn = !!sessionToken
  const isAuthPage = pathname.startsWith('/login')
  const isApiAuthRoute = pathname.startsWith('/api/auth')
  const isApiRegisterRoute = pathname === '/api/register'

  // Allow auth API routes and registration
  if (isApiAuthRoute || isApiRegisterRoute) {
    return NextResponse.next()
  }

  // If on login page and already logged in, redirect to dashboard
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If on login page and not logged in, allow
  if (isAuthPage) {
    return NextResponse.next()
  }

  // Protected routes
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/queue') ||
    pathname.startsWith('/editor') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/schedules')

  // Admin routes (requires authentication)
  const isAdminRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin')

  // If accessing protected route without being logged in, redirect to login
  if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Note: Admin role verification is handled in the API routes and page components
  // due to Edge Runtime limitations for database access

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login/:path*',
    '/dashboard/:path*',
    '/queue/:path*',
    '/editor/:path*',
    '/profile/:path*',
    '/projects/:path*',
    '/analytics/:path*',
    '/schedules/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
