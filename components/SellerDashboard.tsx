"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export default function SellerDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: null as File | null,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await fetch('/api/products?seller=' + user.id, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      router.push('/');
    } else {
      fetchProducts();
    }
  }, [user, router, fetchProducts]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('quantity', newProduct.quantity);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (response.ok) {
        fetchProducts();
        setNewProduct({
          name: '',
          description: '',
          price: '',
          quantity: '',
          image: null,
        });
      } else {
        const data = await response.json();
        alert(data.error || 'An error occurred while adding the product');
      }
    } catch (error) {
      console.error("Product upload error:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct),
      });
      if (response.ok) {
        fetchProducts();
        setEditingProduct(null);
      } else {
        const data = await response.json();
        alert(data.error || 'An error occurred while updating the product');
      }
    } catch (error) {
      console.error("Product update error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>Post a new product to sell</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files?.[0] || null })}
                accept="image/*"
              />
            </div>
            <Button type="submit">Add Product</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>Manage your product listings</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <ul>
              {products.map((product) => (
                <li key={product.id} className="flex justify-between items-center mb-2">
                  <span>{product.name} - ${product.price} (Quantity: {product.quantity})</span>
                  <Button onClick={() => handleEditProduct(product)}>Edit</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No products available. Add your first product above!</p>
          )}
        </CardContent>
      </Card>
      {editingProduct && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>Update your product details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit">Update Product</Button>
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
