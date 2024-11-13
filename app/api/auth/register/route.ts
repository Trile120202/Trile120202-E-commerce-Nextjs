import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import knexConfig from '../../../../knexfile';
import knex from 'knex';

const db = knex(knexConfig);

export async function POST(request: Request) {
  try {
    const { email, password, username,full_name } = await request.json();

    if (!email || !password || !username || !full_name) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin bắt buộc (email, mật khẩu, tên đăng nhập)' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    const existingEmail = await db('users').where({ email }).first();
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 400 }
      );
    }

    const existingUsername = await db('users').where({ username }).first();
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Tên đăng nhập đã được sử dụng' },
        { status: 400 }
      );
    }

    // const role = await db('roles').where({ id: 2 }).first();
    // if (!role) {
    //   return NextResponse.json(
    //     { error: 'Vai trò người dùng không tồn tại' },
    //     { status: 500 }
    //   );
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        status: 1,
        full_name,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning(['id', 'username', 'email']);

    return NextResponse.json({
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        username: newUser.username,
        full_name: newUser.full_name,
        email: newUser.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đăng ký' },
      { status: 500 }
    );
  }
}