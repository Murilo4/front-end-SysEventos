'use client'

// import Header from '@/app/header'
import { Footer } from '@/app/footer'
import ResetPassword from '@/app/reset-password/[uid]/[token]'

export default function Page() {
  return (
    <div className="bg-white min-h-screen">
        <ResetPassword /> {/* Ensure this component is correctly used */}
      <Footer />
    </div>
  )
}