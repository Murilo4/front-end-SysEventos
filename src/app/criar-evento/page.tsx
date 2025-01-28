import { Footer } from '@/app/footer'
import { CreateNewEvent } from '@/app/criar-evento/criar-evento'
export default function RegisterUser() {

  return (
    <>
      <div className="bg-white min-h-screen">
        <CreateNewEvent />
        <Footer />
      </div>
    </>
  )
}