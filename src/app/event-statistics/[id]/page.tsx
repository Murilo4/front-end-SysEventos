import { Footer } from '@/app/footer'
import EventStatistics from '@/app/event-statistics/[id]/statistics'
export default function RegisterUser() {

  return (
    <>
      <div className="bg-white min-h-screen">
        <EventStatistics />
        <Footer />
      </div>
    </>
  )
}