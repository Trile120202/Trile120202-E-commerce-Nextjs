import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import knexConfig from '../../../../knexfile';
import knex from 'knex';
import { log } from 'console';

const db = knex(knexConfig);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên đăng nhập và mật khẩu' },
        { status: 400 }
      );
    }

    const user = await db('users')
      .select('users.*', 'roles.name as role_name')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where('users.username', username)
      .first();

    if (!user) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc mật khẩu không đúng' },
        { status: 400 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log(validPassword);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc mật khẩu không đúng' },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roleId: user.role_id,
        roleName: user.role_name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    console.log('User data:', user);
    console.log('Token payload:', { 
      userId: user.id, 
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roleId: user.role_id,
      roleName: user.role_name
    });

    const response = NextResponse.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        address: user.address,
        avatarId: user.avatar_id,
        roleId: user.role_id,
        roleName: user.role_name,
        status: user.status
      }
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return response;

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đăng nhập' },
      { status: 500 }
    );
  }
}