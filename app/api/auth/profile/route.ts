import { NextResponse } from 'next/server';
import knexConfig from '../../../../knexfile';
import knex from 'knex';
import { jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const db = knex(knexConfig);

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as jwt.JwtPayload;

    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin người dùng' },
        { status: 400 }
      );
    }

    const user = await db('users')
      .select('users.*', 'roles.name as role_name')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where('users.id', userId)
      .first();

    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        phone: user.phone,
        address: user.address,
        avatarId: user.avatar_id,
        roleId: user.role_id,
        roleName: user.role_name,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thông tin hồ sơ:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy thông tin hồ sơ' },
      { status: 500 }
    );
  }
}
