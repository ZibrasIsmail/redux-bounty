import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  try {
    const user = await verifyToken(token);
    if (!user || user.role !== 'shopper') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quantity } = await request.json();
    const productId = params.id;

    const db = await open({
      filename: './ecommerce.db',
      driver: sqlite3.Database
    });

    // Check if the product exists and has enough quantity
    const product = await db.get('SELECT * FROM products WHERE id = ?', productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (product.quantity < quantity) {
      return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
    }

    // We're not updating the product quantity here anymore
    // The quantity will be updated when the order is placed

    await db.close();

    return NextResponse.json({ message: 'Product added to cart successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    return NextResponse.json({ error: 'An error occurred while adding the product to cart' }, { status: 500 });
  }
}
