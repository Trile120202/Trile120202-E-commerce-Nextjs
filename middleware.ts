import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/quan-tri')) {
    try {
      const cookieStore = request.cookies;
      const token = cookieStore.get('token')?.value;

      if (!token) {
        console.log('No token found');
        return NextResponse.redirect(new URL('/', request.url));
      }

      const verified = await jwtVerify(
          token,
          new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
      );

      console.log('Token payload:', verified.payload);

      const payload = verified.payload as any;
      if (!payload.roleId || payload.roleId !== 1) {
        console.log('Not admin role:', payload.roleId);
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
  matcher: '/quan-tri/:path*',
};
