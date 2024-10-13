import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { removeFromCart, updateQuantity, clearCart } from '@/lib/slices/cartSlice';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from 'react';

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    } else if (newQuantity === 0) {
      dispatch(removeFromCart(id));
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: totalPrice
        }),
      });

      if (response.ok) {
        dispatch(clearCart());
        alert('Order placed successfully!');
        router.push('/shopper'); // Redirect to shopper dashboard
      } else {
        const data = await response.json();
        alert(data.error || 'An error occurred while placing the order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred while placing the order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            You have {cartItems.length} item(s) in your cart
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <span>{item.name} - ${item.price}</span>
              <div>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                  className="w-16 mr-2"
                />
                <Button onClick={() => dispatch(removeFromCart(item.id))} variant="destructive" size="sm">
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="font-bold">Total: ${totalPrice.toFixed(2)}</p>
          <Button onClick={() => dispatch(clearCart())} className="mt-2" variant="outline">
            Clear Cart
          </Button>
          <Button 
            className="mt-2 ml-2" 
            onClick={handleCheckout} 
            disabled={cartItems.length === 0 || isCheckingOut}
          >
            {isCheckingOut ? 'Processing...' : 'Checkout'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
