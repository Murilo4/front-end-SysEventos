import { Footer } from "../../footer";
import QuestionsPage from "@/app/questions/[id]/questions";

export default function searchPlaces() {
    return (
        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <QuestionsPage />
      </div>
      <Footer />
    </div>
    )

}