import { Footer } from "@/app/footer";
import AgradecimentoPage from "./finalizado-evento";

export default function Invitation() {
    return (
        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <AgradecimentoPage />
      </div>
      <Footer />
    </div>
    )
}