import { Providers } from '../providers'
import { LoginForm } from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <Providers>
      <div className="flex justify-center items-center min-h-screen">
        <LoginForm />
      </div>
    </Providers>
  )
}
