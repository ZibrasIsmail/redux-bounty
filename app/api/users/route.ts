import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export async function GET() {
  const db = await open({
    filename: './ecommerce.db',
    driver: sqlite3.Database
  });

  try {
    const users = await db.all('SELECT id, name, email, role FROM users');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'An error occurred while fetching users' }, { status: 500 });
  } finally {
    await db.close();
  }
}

export async function POST(request: Request) {
  const db = await open({
    filename: './ecommerce.db',
    driver: sqlite3.Database
  });

  try {
    const { name, email, password, role } = await request.json();

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    return NextResponse.json({ message: 'User added successfully', userId: result.lastID }, { status: 201 });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'An error occurred while adding the user' }, { status: 500 });
  } finally {
    await db.close();
  }
}
