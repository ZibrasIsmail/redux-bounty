"use client";

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/slices/authSlice";
import { clearAuthData } from "@/lib/auth";
import { CartDrawer } from './CartDrawer';
import { saveCurrentRoute } from '@/lib/routePersistence';

export function Navbar() {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      saveCurrentRoute(pathname);
    }
  }, [pathname]);

  const handleLogout = () => {
    clearAuthData();
    dispatch(logout());
    router.push('/');
  };

  if (isLoading) {
    return null; // or return a loading spinner
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">eCommerce Store</Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Button variant="ghost" asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
              {user.role === 'seller' && (
                <Button variant="ghost" asChild>
                  <Link href="/seller">Seller Dashboard</Link>
                </Button>
              )}
              {user.role === 'shopper' && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/shopper">Shopper Dashboard</Link>
                  </Button>
                  <CartDrawer>
                    <Button variant="secondary" className="flex items-center">
                      Cart ({cartItems.length})
                    </Button>
                  </CartDrawer>
                </>
              )}
              <Button variant="ghost" asChild>
                <Link href="/products">Products</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
