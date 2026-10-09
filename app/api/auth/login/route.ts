import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken, getCookieName } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'نام کاربری و رمز عبور الزامی است' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ error: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 });
    }

    const token = await createToken({ id: admin.id, username: admin.username });

    const response = NextResponse.json({ success: true, username: admin.username });
    response.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
