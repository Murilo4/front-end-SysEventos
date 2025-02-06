import { Footer } from "@/app/footer";
import { RegisterFormSection } from "@/app/validate-user-info/[id]/validate-user";

export default function Invitation() {
    return (
        <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <RegisterFormSection />
      </div>
      <Footer />
    </div>
    )
}