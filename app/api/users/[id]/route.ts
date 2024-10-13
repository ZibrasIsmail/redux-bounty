import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Get the authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and get the user
    const user = await verifyToken(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.id === parseInt(params.id)) {
      return NextResponse.json({ error: 'Cannot delete your own account while logged in' }, { status: 400 });
    }

    const db = await open({
      filename: './ecommerce.db',
      driver: sqlite3.Database
    });

    try {
      await db.run('DELETE FROM users WHERE id = ?', params.id);
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'An error occurred while deleting the user' }, { status: 500 });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await verifyToken(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Can only update to admin role' }, { status: 400 });
    }

    const db = await open({
      filename: './ecommerce.db',
      driver: sqlite3.Database
    });

    try {
      await db.run('UPDATE users SET role = ? WHERE id = ?', [role, params.id]);
      return NextResponse.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'An error occurred while updating the user role' }, { status: 500 });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
