import { Footer } from "@/app/footer";
import PaymentPage from "./payment";

export default function searchPlaces() {
    return (

        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <PaymentPage />
      </div>
      <Footer />
    </div>
    )
}