import { Footer } from '@/app/footer'
import EventStatistics from '@/app/event-statistics/[id]/statistics'
export default function RegisterUser() {

  return (
    <>
      <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <EventStatistics />
        </div>
        <Footer />
      </div>
    </>
  )
}