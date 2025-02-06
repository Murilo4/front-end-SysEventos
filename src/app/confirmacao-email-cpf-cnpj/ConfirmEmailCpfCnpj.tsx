'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'

// Função para verificar CPF
const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/\D/g, ''); // Remove qualquer caractere não numérico
  if (cpf.length !== 11) return false; // CPF deve ter 11 caracteres

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.charAt(i - 1)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.charAt(i - 1)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Função para verificar CNPJ
const isValidCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/\D/g, ''); // Remove qualquer caractere não numérico
  if (cnpj.length !== 14) return false; // CNPJ deve ter 14 caracteres

  const size = cnpj.length - 2;
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(cnpj.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let remainder = sum % 11;
  if (remainder < 2) remainder = 0;
  else remainder = 11 - remainder;
  if (remainder !== parseInt(digits.charAt(0))) return false;

  sum = 0;
  pos = size - 7;

  for (let i = size + 1; i <= 14; i++) {
    sum += parseInt(cnpj.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  remainder = sum % 11;
  if (remainder < 2) remainder = 0;
  else remainder = 11 - remainder;
  if (remainder !== parseInt(digits.charAt(1))) return false;

  return true;
};

const ConfirmEmailCpfCnpj = () => {
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
    const token = cookies.get('token');
    if (!token || !identifier) {
      toast.error('Token ou identificador não encontrado.');
      router.push('/'); // Isso deve acontecer *após* a renderização completa
      return;
    }
  
    const validateToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/validate-token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
  
        if (!response.ok) {
          toast.error('Erro ao validar o token. Tente novamente mais tarde.');
          router.push('/');
          return;
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
    if (!identifier) {
      toast.error('Identificador não encontrado.');
      return;
    }

    // Remover caracteres não numéricos
    const cleanedIdentifier = identifier.replace(/\D/g, '');
  
    // Validar se o identificador é CPF ou CNPJ
    const isCPF = /^\d{11}$/.test(cleanedIdentifier);  // CPF deve ter 11 dígitos
    const isCNPJ = /^\d{14}$/.test(cleanedIdentifier); // CNPJ deve ter 14 dígitos
  
    // Verificar se o identificador é válido
    if (!isCPF && !isCNPJ) {
      toast.error('CPF ou CNPJ inválido.');
      return;
    }
  
    // Definir a chave a ser usada no corpo da requisição
    const key = isCPF ? 'cpf' : 'cnpj';
  
    setIsRequestingCode(true);
  
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/email-validation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: identifier }),  // Enviar CPF ou CNPJ conforme a chave
      });
  
      console.log('Send Code Response:', response);
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro ao enviar o código de verificação:', errorData);
        toast.error('Erro ao enviar o código de verificação. Tente novamente mais tarde.');
        return;
      }
  
      const data = await response.json();
      console.log('Send Code Data:', data);
  
      toast.success('Código de verificação enviado para seu email.');
      setCodeSent(true);  // Agora a interface muda para inserir o código.
    } catch (error) {
      console.error('Erro ao enviar o código de verificação:', error);
      toast.error('Erro ao enviar o código de verificação. Tente novamente mais tarde.');
    }
  }

  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!identifier) {
      toast.error('Identificador não encontrado.');
      return;
    }
  
    // Limpeza do identificador (CPF ou CNPJ)
    const cleanedIdentifier = identifier.replace(/\D/g, '');
  
    // Verificar se o identificador é CPF ou CNPJ
    const isCPF = /^\d{11}$/.test(cleanedIdentifier); // CPF deve ter 11 dígitos
    const isCNPJ = /^\d{14}$/.test(cleanedIdentifier); // CNPJ deve ter 14 dígitos
  
    // Verificar se o identificador é válido
    if (!isCPF && !isCNPJ) {
      toast.error('CPF ou CNPJ inválido.');
      return;
    }
  
    // Definir a chave para enviar a requisição
    const key = isCPF ? 'cpf' : 'cnpj';
  
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/verify-email-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [key]: identifier,  // Enviar o CPF ou CNPJ
          code: verificationCode,  // Enviar o código de verificação
        }),
      });
  
      console.log('Verify Code Response:', response);
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro ao verificar o código:', errorData);
        toast.error('Código de verificação inválido. Tente novamente.');
        return;
      }
  
      const data = await response.json();
      console.log('Verify Code Data:', data);
  
      if (!data.success) {
        toast.error('Código de verificação inválido. Tente novamente.');
        return;
      }
  
      toast.success('Código de verificação confirmado com sucesso!');
      router.push('/');  // Redirecionar para login após validação com sucesso
    } catch (error) {
      console.error('Erro ao verificar o código:', error);
      toast.error('Erro ao verificar o código. Tente novamente mais tarde.');
    }
  }

  const handleResendCode = async () => {
    if (!identifier) {
      toast.error('Identificador não encontrado.');
      return;
    }

    const cleanedIdentifier = identifier.replace(/\D/g, '');
  
    // Verificar se o identificador é CPF ou CNPJ
    const isCPF = /^\d{11}$/.test(cleanedIdentifier); // CPF deve ter 11 dígitos
    const isCNPJ = /^\d{14}$/.test(cleanedIdentifier); // CNPJ deve ter 14 dígitos
  
    // Verificar se o identificador é válido
    if (!isCPF && !isCNPJ) {
      toast.error('CPF ou CNPJ inválido.');
      return;
    }
  
    // Definir a chave para enviar a requisição
    const key = isCPF ? 'cpf' : 'cnpj';
    if (!identifier || (!isValidCPF(identifier) && !isValidCNPJ(identifier))) {
      toast.error('CPF ou CNPJ inválido.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/email-validation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: identifier }),
      })

      console.log('Resend Code Response:', response)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erro ao reenviar o código de verificação:', errorData)
        toast.error('Erro ao reenviar o código de verificação. Tente novamente mais tarde.')
        return
      }

      const data = await response.json()
      console.log('Resend Code Data:', data)

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
            {/* Novo texto acima da caixa */}
            <p className="text-lg text-gray-800 mb-6">
              O seu email ainda não foi validado, Precisamos realizar essa validação primeiro.
            </p>
            <p className="text-lg text-gray-800 mb-6">
                Será enviado para o email que usou no cadastro de sua conta!
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

export default ConfirmEmailCpfCnpj
