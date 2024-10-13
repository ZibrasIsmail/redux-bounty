import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: Request) {
  
  const db = await open({
    filename: './ecommerce.db',
    driver: sqlite3.Database
  });

  try {
    const { email, password } = await request.json();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    const { ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  } finally {
    await db.close();
  }
}
