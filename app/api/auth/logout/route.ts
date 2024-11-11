import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const response = NextResponse.json({ 
      message: 'Đăng xuất thành công' 
    });

    response.cookies.delete({
      name: 'token',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    const allCookies = cookieStore.getAll();
    allCookies.forEach(cookie => {
      response.cookies.delete({
        name: cookie.name,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    });

    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
    
    return response;
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đăng xuất' },
      { status: 500 }
    );
  }
} 