import { Footer } from "../footer";
import PlanosPage from "./planos";

export default function searchPlaces() {
    return (

        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <PlanosPage />
      </div>
      <Footer />
    </div>
    )
}