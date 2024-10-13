import { ProductList } from "@/components/ProductList"

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Products</h1>
      <ProductList />
    </div>
  )
}