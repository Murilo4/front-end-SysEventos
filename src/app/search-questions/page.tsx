import { Footer } from "@/app/footer";
import SearchQuestionsPage from "@/app/search-questions/search-questions";

export default function searchPlaces() {
    return (
        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <SearchQuestionsPage />
      </div>
      <Footer />
    </div>
    )

}