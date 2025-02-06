import { Footer } from '@/app/footer'
import {RegisterFormSection} from '@/app/registro-consumidor/registerForm'
export default function Home() {
  return (
    <>
      <div className="bg-background min-h-screen">
        <RegisterFormSection />
        <Footer/>
      </div>
    </>
  )
}