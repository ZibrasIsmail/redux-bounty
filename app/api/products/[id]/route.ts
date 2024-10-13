import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  try {
    const user = await verifyToken(token);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await open({
      filename: './ecommerce.db',
      driver: sqlite3.Database
    });

    const { name, description, price, quantity } = await request.json();

    // Check if the product belongs to the seller
    const product = await db.get('SELECT * FROM products WHERE id = ? AND seller_id = ?', [params.id, user.id]);
    if (!product) {
      return NextResponse.json({ error: 'Product not found or does not belong to the seller' }, { status: 404 });
    }

    await db.run(
      'UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?',
      [name, description, price, quantity, params.id]
    );

    await db.close();

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the product' }, { status: 500 });
  }
}
