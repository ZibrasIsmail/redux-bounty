"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { addToCart } from '@/lib/slices/cartSlice'
import { RootState } from '@/lib/store'

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const cartItems = useSelector((state: RootState) => state.cart.items)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        setError("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("An error occurred while fetching products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      router.push('/login')
    } else if (user.role !== 'shopper') {
      alert("Only shoppers can buy products.")
    } else {
      const cartItem = cartItems.find(item => item.id === product.id)
      const currentQuantityInCart = cartItem ? cartItem.quantity : 0
      
      if (currentQuantityInCart >= product.quantity || product.quantity <= 0) {
        alert("This product is out of stock.")
        return
      }

      try {
        const response = await fetch(`/api/products/${product.id}/buy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: 1 })
        })

        if (response.ok) {
          dispatch(addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1 }))
          alert("Product added to cart successfully!")
          fetchProducts() // Refresh the product list to update quantities
        } else {
          const data = await response.json()
          alert(data.error || "Failed to add product to cart")
        }
      } catch (error) {
        console.error("Error adding product to cart:", error)
        alert("An error occurred while adding the product to cart")
      }
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No products available at the moment. Check back later!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription className="text-sm font-semibold">${product.price.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="relative w-full h-48 mb-4">
              {product.image_url ? (
                <Image 
                  src={product.image_url} 
                  alt={product.name} 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            <p className="text-sm mb-2">{product.description}</p>
            <p className="text-sm font-semibold">
              {product.quantity > 0 ? `Available: ${product.quantity}` : "Out of Stock"}
            </p>
          </CardContent>
          <CardFooter>
            {product.quantity > 0 ? (
              user && user.role === 'shopper' ? (
                <Button onClick={() => handleAddToCart(product)} className="w-full">
                  Add to Cart
                </Button>
              ) : (
                <p className="text-sm text-gray-500">Login as a shopper to buy</p>
              )
            ) : (
              <Button variant="destructive" disabled className="w-full">
                Out of Stock
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
