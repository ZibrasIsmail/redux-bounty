import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  try {
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await open({
      filename: './ecommerce.db',
      driver: sqlite3.Database
    });

    // Create orders table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create order_items table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    const { items, totalAmount } = await request.json();

    // Start a transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create the order
      const orderResult = await db.run(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [user.id, totalAmount, 'pending']
      );

      const orderId = orderResult.lastID;

      // Insert order items and update product quantities
      for (const item of items) {
        await db.run(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.id, item.quantity, item.price]
        );

        // Update product quantity
        await db.run(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.id]
        );
      }

      // Commit the transaction
      await db.run('COMMIT');

      return NextResponse.json({ message: 'Order created successfully', orderId }, { status: 201 });
    } catch (error) {
      // If there's an error, rollback the transaction
      await db.run('ROLLBACK');
      throw error;
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  try {
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await open({
      filename: './ecommerce.db',
      driver: sqlite3.Database
    });

    const orders = await db.all(`
      SELECT o.id, o.total_amount, o.status, o.created_at,
             oi.product_id, oi.quantity, oi.price,
             p.name as product_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, user.id);

    // Group order items by order
    const groupedOrders = orders.reduce((acc: GroupedOrder[], curr: OrderItem) => {
      const order = acc.find((o) => o.id === curr.id);
      if (order) {
        order.items.push({
          product_id: curr.product_id,
          product_name: curr.product_name,
          quantity: curr.quantity,
          price: curr.price
        });
      } else {
        acc.push({
          id: curr.id,
          total_amount: curr.total_amount,
          status: curr.status,
          created_at: curr.created_at,
          items: [{
            product_id: curr.product_id,
            product_name: curr.product_name,
            quantity: curr.quantity,
            price: curr.price
          }]
        });
      }
      return acc;
    }, []);

    return NextResponse.json(groupedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'An error occurred while fetching orders' }, { status: 500 });
  }
}

interface OrderItem {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface GroupedOrder {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
  }[];
}
