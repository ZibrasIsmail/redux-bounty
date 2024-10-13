import { Providers } from '../../providers'
import { ProductForm } from "@/components/ProductForm"

export default function AddProductPage() {
  return (
    <Providers>
      <div className="flex justify-center items-center min-h-screen">
        <ProductForm />
      </div>
    </Providers>
  )
}
