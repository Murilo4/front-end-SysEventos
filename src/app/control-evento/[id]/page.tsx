import { Footer } from '@/app/footer'
import ControlEvento from '@/app/control-evento/[id]/control'
export default function RegisterUser() {

  return (
    <>
      <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <ControlEvento />
      </div>
      <Footer />
    </div>
    </>
  )
}