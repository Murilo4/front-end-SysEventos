'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
interface userData {
  fullName: string,  // O nome completo sempre será enviado
  email: string,  // Valor inicial, será preenchido se emailOrPhone for email
  phone: string,  // Valor inicial, será preenchido se emailOrPhone for telefone
  cpf: string,  // Valor inicial, será preenchido se cpfOrCnpj for CPF
  cnpj: string,  // Va
}
export const RegisterFormSection = () => {
  const router = useRouter()
  const cookies = new Cookies()
  const { id: eventId } = useParams()
  
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [cpfOrCnpj, setCpfOrCnpj] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoginClick = () => {
    cookies.set('eventId', eventId, { path: '/' })
    router.push('/login-email')  // Redireciona para a tela de login
  }

  const handleCreateAccountClick = () => {
    cookies.set('eventId', eventId, { path: '/' })
    router.push('/registro-consumidor')  // Redireciona para a tela de criação de conta
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    // Verificação dos campos obrigatórios
    if (!emailOrPhone || !cpfOrCnpj || !fullName) {
      toast.error('Por favor, preencha todos os campos obrigatórios!')
      return
    }
  
    // Definir os dados a serem enviados de acordo com os campos preenchidos
    const dataToSend: userData = {
      fullName: '', 
      email: '',
      phone: '', 
      cpf: '', 
      cnpj: '',  
    }

    // Validando qual campo de email ou telefone foi preenchido
    if (emailOrPhone.includes('@')) {
      dataToSend.email = emailOrPhone
    } else {
      dataToSend.phone = emailOrPhone
    }

    // Validando qual campo de CPF ou CNPJ foi preenchido
    if (cpfOrCnpj.length <= 14) {
      dataToSend.cpf = cpfOrCnpj  // CPF tem até 14 caracteres
    } else {
      dataToSend.cnpj = cpfOrCnpj  // CNPJ tem mais de 14 caracteres
    }

    // Indicando que os dados estão sendo enviados
    setLoading(true)
  
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/validate-user/${eventId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),  // Enviando os dados no formato correto
      })
  
      const data = await response.json()
  
      if (response.ok) {
        toast.success('Dados validados com sucesso!')
  
        // Utilizando URLSearchParams para passar os parâmetros corretamente
        const userId = data.data.id ;
        // Redireciona para a página do evento com os parâmetros
        console.log(eventId, userId)
        router.push(`/evento/${eventId}/${userId}`);
      } else {
        toast.error(data.message || 'Erro ao enviar os dados. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao validar os dados:', error)
      toast.error('Erro ao validar os dados. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="flex h-screen">
        <div className="w-1/2 bg-principal-blue text-white flex flex-col justify-center p-8">
          <p className="text-3xl font-bold mb-20">
            Antes de poder participar do evento, precisamos validar alguns dados, ou se preferir pode realizar o login com uma conta
          </p>
          <h2 className="text-3xl font-bold mb-4">Você ainda não faz parte do SysEventos?</h2>
          <p className="text-xl mb-6">
            Quero realizar o login com minha conta
          </p>
          <button 
            onClick={handleLoginClick}
            className="bg-white text-black ml-2 py-3 px-4 rounded-3xl font-bold hover:bg-gray-200 transition hover:scale-105">
            Login
          </button>
          <p className="text-xl mb-6">
            Ainda não tenho uma conta, quero me cadastrar!
          </p>
          <button 
            onClick={handleCreateAccountClick}
            className="bg-white text-black ml-2 py-3 px-4 rounded-3xl font-bold hover:bg-gray-200 transition hover:scale-105">
            Criar conta
          </button>
        </div>

        {/* Metade Direita (Branca) */}
        <div className="w-1/2 bg-gray-100 flex flex-col justify-center p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email ou Telefone */}
            <input
              type="text"
              placeholder="Email ou Telefone"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full border border-gray-400 rounded-2xl focus:scale-105 placeholder-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* CPF */}
            <input
              type="text"
              placeholder="CPF"
              value={cpfOrCnpj}
              onChange={(e) => setCpfOrCnpj(e.target.value)}
              className="w-full border border-gray-400 rounded-2xl focus:scale-105 placeholder-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Nome Completo */}
            <input
              type="text"
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-400 text-lg rounded-2xl focus:scale-105 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-black"
            />
            
            <button
              type="submit"
              className="w-full mt-4 text-2xl bg-principal-blue hover:scale-95 scale-90 text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Participar do Evento'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
