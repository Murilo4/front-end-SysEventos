import { Footer } from '@/app/footer'
import { CreateNewEvent } from '@/app/criar-evento/criar-evento'
export default function RegisterUser() {

  return (
    <>
      <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <CreateNewEvent />
      </div>
      <Footer />
    </div>
    </>
  )
}