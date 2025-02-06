import { Footer } from "@/app/footer";
import InvitationPage from "./invitation";

export default function Invitation() {
    return (
        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <InvitationPage />
      </div>
      <Footer />
    </div>
    )
}