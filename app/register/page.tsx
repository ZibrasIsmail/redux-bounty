import { Providers } from '../providers'
import { RegisterForm } from "@/components/RegisterForm"

export default function RegisterPage() {
  return (
    <Providers>
      <div className="flex justify-center items-center min-h-screen">
        <RegisterForm />
      </div>
    </Providers>
  )
}
