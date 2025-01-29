import { Footer } from '@/app/footer'
import { EditEvent } from '@/app/editar-evento/editar-evento'
export default function RegisterUser() {

    return (
        <>
            <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <EditEvent />
      </div>
      <Footer />
    </div>
        </>
    )
}