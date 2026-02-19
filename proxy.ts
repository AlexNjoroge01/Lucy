import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
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

  // Allow auth API routes
  if (isApiAuthRoute) {
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
    pathname.startsWith('/analytics')

  // If accessing protected route without being logged in, redirect to login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

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
  ],
}
