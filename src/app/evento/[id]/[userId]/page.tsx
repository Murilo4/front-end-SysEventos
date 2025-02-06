import { Footer } from "@/app/footer";
import EventoPage from "./evento";

export default function Invitation() {
    return (
        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <EventoPage />
      </div>
      <Footer />
    </div>
    )
}