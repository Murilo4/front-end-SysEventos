'use client'

import { useSearchParams } from 'next/navigation';
import { Footer } from '@/app/footer';
import ResetPassword from '@/app/reset-password/[uid]/[token]/reset';

export default function Page() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  return (
    <div className="bg-white min-h-screen">
      <ResetPassword uid={uid} token={token} />
      <Footer />
    </div>
  );
}