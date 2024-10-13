import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [token]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      {orders.map((order) => (
        <Card key={order.id} className="mb-4">
          <CardHeader>
            <CardTitle>Order #{order.id}</CardTitle>
            <CardDescription>
              Date: {new Date(order.created_at).toLocaleString()} | Status: {order.status}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <span>{item.product_name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="font-bold mt-2">Total: ${order.total_amount.toFixed(2)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
