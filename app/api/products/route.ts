import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
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

    // Create products table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        image_url TEXT,
        seller_id INTEGER NOT NULL,
        FOREIGN KEY (seller_id) REFERENCES users (id)
      )
    `);

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    const image = formData.get('image') as File;

    let imagePath = '';
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${image.name}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Create the uploads directory if it doesn't exist
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err && err.code !== 'EEXIST') {
          console.error('Error creating uploads directory:', err);
          throw err;
        }
      }

      imagePath = `/uploads/${fileName}`;
      await writeFile(path.join(uploadsDir, fileName), buffer);
    }

    await db.run(
      'INSERT INTO products (name, description, price, quantity, image_url, seller_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, quantity, imagePath, user.id]
    );

    await db.close();

    return NextResponse.json({ message: 'Product added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the product' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('seller');

  const db = await open({
    filename: './ecommerce.db',
    driver: sqlite3.Database
  });

  try {
    // Create products table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        image_url TEXT,
        seller_id INTEGER NOT NULL,
        FOREIGN KEY (seller_id) REFERENCES users (id)
      )
    `);

    let products;
    if (sellerId) {
      products = await db.all('SELECT * FROM products WHERE seller_id = ?', sellerId);
    } else {
      products = await db.all('SELECT * FROM products');
    }
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'An error occurred while fetching products' }, { status: 500 });
  } finally {
    await db.close();
  }
}
