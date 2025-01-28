import { Footer } from "../../footer";
import QuestionsPage from "@/app/questions/[id]/questions";

export default function searchPlaces() {
    return (
        <div className="min-h-screen bg-white-background mt-32">
            <QuestionsPage />
            <Footer />
        </div>
    )

}