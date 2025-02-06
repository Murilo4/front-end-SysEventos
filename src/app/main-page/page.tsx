import { Footer } from "../footer";
import Dashboard from "./main-item";

export default function searchPlaces() {
    return (
        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <Dashboard />
      </div>
      <Footer />
    </div>
    )

}