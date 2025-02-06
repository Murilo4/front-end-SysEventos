import { Footer } from '@/app/footer'
import UserAccount from "./perfil"
export default function Login() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <UserAccount />
      </div>
      <Footer />
    </div>
  )
}