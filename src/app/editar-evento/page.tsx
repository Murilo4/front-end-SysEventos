import { Footer } from '@/app/footer'
import { EditEvent } from '@/app/editar-evento/editar-evento'
import React, { Suspense } from 'react';
export default function RegisterUser() {

    return (
        <>
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
      <Suspense fallback={<div>Carregando...</div>}>
        <EditEvent />
        </Suspense>
      </div>
      <Footer />
    </div>
        </>
    )
}