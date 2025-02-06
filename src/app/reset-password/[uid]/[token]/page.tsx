'use client'

import { Footer } from '@/app/footer';
import ResetPassword from '@/app/reset-password/[uid]/[token]/reset';

export default function Page() {


  return (
    <div className="bg-white min-h-screen">
      <ResetPassword />
      <Footer />
    </div>
  );
}