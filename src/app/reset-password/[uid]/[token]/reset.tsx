'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import { useParams } from 'next/navigation' // Correção para capturar parâmetros da rota

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const router = useRouter()

  // Usando useParams para capturar os parâmetros 'uid' e 'token' da URL
  const { uid, token } = useParams()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    try {
      const cookies = new Cookies()
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

      // Construindo o payload com os dados do formulário
      const payload = {
        oldPassword,
        newPassword,
        token,
        uid
      }

      const response = await fetch(`${apiUrl}/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.get('access')}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro no servidor:', errorData)
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        toast.success('Senha redefinida com sucesso.')
        router.push('/login')
      } else {
        toast.error(data.message || 'Erro ao redefinir senha.')
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      toast.error('Erro ao redefinir senha.')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Redefinir Senha</h2>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Senha Atual</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-500 focus:scale-100 hover:scale-95 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-thirth"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-500 focus:scale-100 hover:scale-95  rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-thirth"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-500 focus:scale-100 hover:scale-95 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-thirth"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-principal-blue hover:scale-100 scale-95 text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition"
          >
            Redefinir Senha
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword