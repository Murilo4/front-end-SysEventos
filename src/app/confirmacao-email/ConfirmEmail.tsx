'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'

const ConfirmEmail = () => {
  const [loading, setLoading] = useState(true)
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isRequestingCode, setIsRequestingCode] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const identifier = searchParams ? searchParams.get('identifier') : null
  useEffect(() => {
    const cookies = new Cookies()
    const token = cookies.get('token')

    if (!token || !identifier) {
      toast.error('Token ou email não encontrado.')
      router.push('/')
      return
    }

    const validateToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/validate-token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error('Erro ao validar o token:', errorData)
          toast.error('Erro ao validar o token. Tente novamente mais tarde.')
          router.push('/')
          return
        }

        const data = await response.json();
        if (!data.success) {
              toast.warning('Token inválido. Gerando um novo token...');
              await generateNewToken(identifier);
            } else {
              setLoading(false); // Token válido, exibe opções de ação
            }
          } catch (error) {
            toast.error('Erro ao validar o token. Tente novamente mais tarde.');
            console.error('Erro ao validar o token:', error);
            }
        }

    const generateNewToken = async (identifier: string) => {
      const cookies = new Cookies()
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/generate-new-token/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ identifier })
            });
      
            if (!response.ok) {
              toast.error('Erro ao gerar um novo token. Tente novamente mais tarde.');
              router.push('/');
              return;
            }
      
            const data = await response.json();
            cookies.set('token', data.token);
          } catch (error) {
            toast.error('Erro ao gerar um novo token. Tente novamente mais tarde.');
            console.error('Erro ao gerar um novo token:', error);
          }
        }
      
        validateToken();
      }, [identifier, router]);

      const handleSendCode = async () => {
        setIsRequestingCode(true); // Set to true when the request starts
        if (!identifier) {
          toast.error('Identificador não encontrado.');
          setIsRequestingCode(false); // Set to false if there is an error or invalid identifier
          return;
        }
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/email-validation/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: identifier }),
          });
      
          if (!response.ok) {
            const errorData = await response.text();
            console.error('Erro ao enviar o código de verificação:', errorData);
            toast.error('Erro ao enviar o código de verificação. Tente novamente mais tarde.');
            setIsRequestingCode(false);
            return;
          }
      
          const data = await response.json();
          console.log('Send Code Data:', data);
      
          toast.success('Código de verificação enviado para seu email.');
          setCodeSent(true);  // Agora a interface muda para inserir o código.
          setIsRequestingCode(false);  // Done requesting, set to false
        } catch (error) {
          console.error('Erro ao enviar o código de verificação:', error);
          toast.error('Erro ao enviar o código de verificação. Tente novamente mais tarde.');
          setIsRequestingCode(false);
        }
      };

  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/verify-email-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: identifier, code: verificationCode }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erro ao verificar o código:', errorData)
        toast.error('Código de verificação inválido. Tente novamente.')
        return
      }

      const data = await response.json()

      if (!data.success) {
        toast.error('Código de verificação inválido. Tente novamente.')
        return
      }

      toast.success('Código de verificação confirmado com sucesso!')
      router.push('/login-email')
    } catch (error) {
      console.error('Erro ao verificar o código:', error)
      toast.error('Erro ao verificar o código. Tente novamente mais tarde.')
    }
  }

  const handleResendCode = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/email-validation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: identifier }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erro ao reenviar o código de verificação:', errorData)
        toast.error('Erro ao reenviar o código de verificação. Tente novamente mais tarde.')
        return
      }

      toast.success('Código de verificação reenviado para seu email.')
      setResendTimer(60)
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev === 1) {
            clearInterval(timer)
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Erro ao reenviar o código de verificação:', error)
      toast.error('Erro ao reenviar o código de verificação. Tente novamente mais tarde.')
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        {codeSent ? (
          <div className="text-center">
            <p className="text-lg text-gray-800 mb-6">
              Agora iremos validar o seu endereço de email, será enviado para o email que usou no cadastro de sua conta!
            </p>
            <h1 className="text-xl font-semibold mb-4">Um código de verificação foi enviado para o seu email.</h1>
            <p className="text-gray-600">Por favor, insira o código para confirmar seu email.</p>
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Código de 6 dígitos"
                required
                className="w-full border border-gray-300 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue text-black py-3 px-4 rounded-2xl font-semibold hover:bg-blue-600 transition"
              >
                Verificar Código
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-2xl font-semibold hover:bg-gray-400 transition"
              >
                {resendTimer > 0 ? `Reenviar código em ${resendTimer}s` : 'Reenviar Código'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-xl text-black font-semibold mb-4">Por favor, solicite um código de verificação.</h1>
            <button
              onClick={handleSendCode}
              disabled={isRequestingCode}
              className="w-full bg-blue text-black py-3 px-4 rounded-2xl font-semibold hover:bg-blue-600 transition"
            >
              Enviar Código
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmEmail