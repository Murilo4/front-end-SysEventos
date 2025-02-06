'use client'

import React from 'react'
import registerSchema from '@/schemas/registerValidation'
import { userEmailAtom } from '@/states/atoms/userData'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSetRecoilState } from 'recoil'
import Cookies from 'universal-cookie'
import { FormRegisterErrors, FormRegisterValues, InputName } from '@/types/register'
import Link from 'next/link';

const initialValues: FormRegisterValues = {
  username: '',
  email: '',
  confirmEmail: '',
  password: '',
  confirmPassword: '',
  cpf: '',
  phone: '',
}

const initialErrors: FormRegisterErrors = {
  username: [],
  email: [],
  confirmEmail: [],
  password: [],
  confirmPassword: [],
  cpf: [],
  phone: [],
}

export const RegisterFormSection = () => {
  const [formValues, setFormValues] =
    useState<FormRegisterValues>(initialValues)
  const [formErrors, setFormErrors] =
    useState<FormRegisterErrors>(initialErrors)
  const [loader, setLoader] = useState<boolean>(false)

  const router = useRouter()
  const cookies = new Cookies()

  const setEmail = useSetRecoilState(userEmailAtom)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    // limpar erros
    if (formErrors[name as InputName].length > 0)
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: [],
      } as FormRegisterErrors))

    if (name === 'username') {
      const formattedValue = value
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: formattedValue,
      }))
    } else if (name === 'email' || name === 'confirmEmail') {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value.toLowerCase(),
      }))
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }))
    }
  }
  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoader(true)

    const validation = registerSchema.safeParse(formValues)

    if (!validation.success) {
      console.log('Validation errors:', validation.error.formErrors.fieldErrors)
      setFormErrors({
        ...initialErrors,
        ...validation.error.formErrors.fieldErrors,
      } as FormRegisterErrors)
      Object.values(validation.error.formErrors.fieldErrors).forEach((errorArray) => {
        errorArray.forEach((error) => {
          toast.error(error)
        })
      })
    } else {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        console.log('API URL:', apiUrl) // Debug the API URL

        // JSON to be sent to the backend
        console.log('JSON to be sent:', JSON.stringify(formValues))

        const response = await fetch(`${apiUrl}/create/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        })

        const data = await response.json()

        console.log('API response:', data) // Log the entire response

        if (response.status === 429) {
          toast.error('Muitas requisições. Tente novamente mais tarde.')
          setLoader(false)
          return
        }

        if (data.success) {
          toast.success(data.message)
          setEmail(formValues.email) // Atualiza o estado global do email
          // Save email to local storage
          localStorage.setItem('userEmail', formValues.email)
          // Save JWT token to cookies
          cookies.set('token', data.token)
          router.push('/confirmacao-email')
        } else {
          console.log('API error:', data.message, data.errors)
          toast.warning(data.message)
        }
      } catch (error) {
        console.error('API request error:', error)
        toast.error('Erro ao enviar a requisição. Tente novamente mais tarde.')
      }
    }

    setLoader(false)
  }
  return (
    <>
      <ToastContainer />
      <div className="flex h-screen">
        {/* Metade Esquerda (Azul) */}
        <div className="w-1/2 bg-principal-blue text-white flex flex-col justify-center p-8">
          <h2 className="text-3xl font-bold mb-4">Que bom que você deseja Fazer parte da Contur!</h2>
          <p className="text-xl mb-6">
            Vamos realizar o seu cadastro rapidamente para você possa desfrutar de tudo que podemos oferecer!
          </p>
          <p className="text-xl mb-6">
            Caso já tenha uma conta e deseja utiliza-la, você pode realizar o login através deste botão:
          </p>
          <Link href="/">
            <button className="bg-white w-full text-black py-3 px-4 rounded-3xl scale-95 hover:scale-100 font-bold hover:bg-gray-200 transition">
              Realizar login
            </button>
          </Link>
        </div>

        {/* Metade Direita (Branca) */}
        <div className="w-1/2 bg-gray-100 flex flex-col justify-center p-8">
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            {/* Campo Nome Completo */}
            <input
              type="text"
              name="username"
              placeholder="Nome completo"
              className="w-full border border-gray-400 focus:scale-105 placeholder:text-black text-black rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {formErrors.username.length > 0 && (
              <p className="text-red text-sm  ">{formErrors.username[0]}</p>
            )}

            {/* Campo Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {formErrors.email.length > 0 && (
              <p className="text-red text-sm">{formErrors.email[0]}</p>
            )}

            {/* Campo Confirmar Email */}
            <input
              type="email"
              name="confirmEmail"
              placeholder="Confirme o Email"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {formErrors.confirmEmail?.length > 0 && (
              <p className="text-red text-sm">{formErrors.confirmEmail[0]}</p>
            )}

            {/* Campo CPF */}
            <input
              type="text"
              name="cpf"
              placeholder="Cpf"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {formErrors.cpf.length > 0 && (
              <p className="text-red text-sm">{formErrors.cpf[0]}</p>
            )}

            {/* Campo Telefone */}
            <input
              type="text"
              name="phone"
              placeholder="Telefone"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {formErrors.phone.length > 0 && (
              <p className="text-red text-sm">{formErrors.phone[0]}</p>
            )}

            {/* Campo Senha */}
            <input
              type="password"
              name="password"
              placeholder="Senha"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {formErrors.password.length > 0 && (
              <p className="text-red text-sm">{formErrors.password[0]}</p>
            )}

            {/* Campo Confirmar Senha */}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirme a senha"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {formErrors.confirmPassword?.length > 0 && (
              <p className="text-red text-sm">{formErrors.confirmPassword[0]}</p>
            )}

            <button
              type="submit"
              className="w-full mt-4 text-xl bg-principal-blue hover:scale-100 scale-95 text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition">
              {loader ? 'Enviando...' : 'Cadastre-se'}
            </button>
          </form>
        </div>
        <div className="bg-gray-300 absolute bottom-0 w-full pt-1"></div>
      </div>
    </>
  )
}