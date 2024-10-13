"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { ProductList } from '@/components/ProductList';
import { OrderHistory } from '@/components/OrderHistory';

export default function ShopperDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'shopper') {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopper Dashboard</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome, {user?.name}!</CardTitle>
          <CardDescription>Browse and purchase products from our sellers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </CardContent>
      </Card>
      <OrderHistory />
      <ProductList />
    </div>
  );
}
