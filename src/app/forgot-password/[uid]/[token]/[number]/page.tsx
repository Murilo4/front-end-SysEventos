'use client'

import { Footer } from '@/app/footer';
import ResetPassword from '@/app/forgot-password/[uid]/[token]/[number]/ForgotPassword'

export default function Page() {
  return (
    <div className="bg-white min-h-screen">
      <ResetPassword />
      <Footer />
    </div>
  );
}