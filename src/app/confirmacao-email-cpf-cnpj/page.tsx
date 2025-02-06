'use client'

// import Header from '@/app/header'
import { Footer } from '@/app/footer'
import ConfirmEmailCpfCnpj  from '@/app/confirmacao-email-cpf-cnpj/ConfirmEmailCpfCnpj'
import { Suspense } from 'react'

export default function Page() {
  return (
      <div className="bg-white min-h-screen">
        <Suspense fallback={<div>Carregando...</div>}>
        <ConfirmEmailCpfCnpj />
        </Suspense>
        <Footer />
      </div>
  )
}