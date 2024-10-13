"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ProductForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("price", price)
    formData.append("quantity", quantity)
    if (image) {
      formData.append("image", image)
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        router.push("/seller/products")
      } else {
        console.error(data.error)
      }
    } catch (error) {
      console.error("Product upload error:", error)
    }
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Post a new product to sell.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="image">Product Image</Label>
              <Input id="image" type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Add Product</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
