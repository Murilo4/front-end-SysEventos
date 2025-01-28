import { Footer } from '@/app/footer'
import ControlEvento from '@/app/control-evento/[id]/control'
export default function RegisterUser() {

  return (
    <>
      <div className="bg-white min-h-screen">
        <ControlEvento />
        <Footer />
      </div>
    </>
  )
}