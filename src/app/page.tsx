'use client'

import { Footer } from '@/app/footer'
import LoginUser from '@/app/Login'
import { RecoilRoot } from 'recoil';

export default function Login() {
  return (
    <>
      <div className="bg-white min-h-screen">
      <RecoilRoot>
        <LoginUser />
      </RecoilRoot>
        <Footer/>
      </div>
    </>
  )
}