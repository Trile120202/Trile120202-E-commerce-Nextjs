import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const protectedRoutes = ['/don-hang', '/gio-hang', '/thanh-toan'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  const cookieStore = request.cookies;
  const token = cookieStore.get('token')?.value;

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/quan-tri')) {
    try {
      if (!token) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      const verified = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
      );

      const payload = verified.payload as any;
      if (!payload.roleId || payload.roleName !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Token verification error:', error);
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/quan-tri/:path*', '/don-hang/:path*', '/gio-hang/:path*', '/thanh-toan/:path*']
};
