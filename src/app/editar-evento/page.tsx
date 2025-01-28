import { Footer } from '@/app/footer'
import { EditEvent } from '@/app/editar-evento/editar-evento'
export default function RegisterUser() {

    return (
        <>
            <div className="bg-white min-h-screen">
                <EditEvent />
                <Footer />
            </div>
        </>
    )
}