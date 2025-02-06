'use client'

// import Header from '@/app/header'
import { Footer } from '@/app/footer'
import ConfirmEmail  from '@/app/confirmacao-email/ConfirmEmail'
import { Suspense } from 'react'

export default function Page() {
  return (
      <div className="bg-white min-h-screen">
        <Suspense fallback={<div>Carregando...</div>}>
        <ConfirmEmail />
        </Suspense>
        <Footer />
      </div>
  )
}