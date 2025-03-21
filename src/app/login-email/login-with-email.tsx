'use client'

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'universal-cookie'
import RegistrationModal from '@/components/RegistrationModal'

const LoginUser: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [loader, setLoader] = useState<boolean>(false)

  const handleRedirect = () => {
    router.push('/')
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }
  const handleRedirectCreateAccount = () => {
    router.push('/registro-consumidor')
  }
  const handleRedirectForgetPass = () => {
    router.push('/change-password')
    };

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setLoader(true)
  
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isPhone = /^\d{10,11}$/.test(identifier);
  
      if (!isEmail && !isPhone) {
        toast.error('Email ou telefone inválidos.');
        return;
      }
  
      const key = isEmail ? 'email' : 'phone';
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
      try {
        const response = await fetch(`${apiUrl}/login-email/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: identifier, password }),
        });
  
        const data = await response.json();
  
        console.log('Login Response:', data)
  
        if (response.status === 406) {
          toast.warning('Email não validado. Redirecionando para a página de confirmação de email.');
          const cookies = new Cookies()
          cookies.set('token', data.token)
          console.log('Token set in cookies:', data.token)
          router.push(`/confirmacao-email?identifier=${identifier}`)
          return;
        }
  
        if (!response.ok) {
          setLoader(false)
          toast.error('Dados incorretos, tente novamente.');
          return;
        }
  
        if (response.status === 200) {
          toast.success('Login realizado com sucesso!');
          const cookies = new Cookies();
          cookies.set('refresh', data.refresh);
          cookies.set('access', data.access);
          cookies.set('user_valid', data.token)
          const accessToken = cookies.get('access');
        
          const eventId = cookies.get('eventId');
          if (eventId) {
            const validateResponse = await fetch(`${apiUrl}/validate-user/${eventId}/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });

            if (!validateResponse.ok) {
              setLoader(false);
              router.push('/main-page');
            }
            router.push(`/evento/${eventId}`);
            cookies.remove('eventId');
          } else {
            router.push('/main-page');
          }
        }
      } catch (error) {
        setLoader(false)
        console.error(error)
        toast.error('Erro ao realizar login. Tente novamente mais tarde.',);
      }
    };
  return (
    <div className="flex h-screen">
      <ToastContainer />
      <RegistrationModal isOpen={isModalOpen} onClose={handleCloseModal} />
      {/* Metade Esquerda (Azul) */}
      <div className="bg-principal-blue w-1/2  text-white flex flex-col justify-center p-3 sm:p5 sm:w-1/2 ">
        <p className=" text-xl mb-5 sm:text-3xl font-bold sm:mb-20">Muito bom ve-lo pro aqui, vamos realizar seu login, para que possa estar organizando seus eventos!</p>
        <h2 className="text-lg sm:text-3xl font-bold mb-4">Você ainda não faz parte do SysEventos?</h2>
        <button
          onClick={handleRedirectCreateAccount}
          className="bg-white text-black px-2 ml-2 py-3 sm:px-4 rounded-3xl font-bold hover:bg-gray-200 transition hover:scale-105">
          Criar conta
        </button>
      </div>

      {/* Metade Direita (Branca) */}
      <div className="w-1/2 bg-gray-100 flex flex-col justify-center p-3 sm:p5">
        <form className="space-y-3" onSubmit={handleLogin}>
          {/* CPF/CNPJ */}
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email ou Telefone"
            className="w-full border border-gray-400 rounded-2xl focus:scale-105 placeholder-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Senha */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full border border-gray-400 text-lg rounded-2xl focus:scale-105 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-black"
          />
          
          <button
            type="submit"
            className="w-full mt-4 text-xl sm:text-2xl bg-principal-blue hover:scale-95 scale-90 text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition"
          >
            {loader ? 'Logando...' : 'Logar'}
          </button>
          <button
            type="button"
            onClick={handleRedirect}
            className="w-full mt-2 sm:mt-4 text-lg sm:text-2xl bg-principal-blue hover:scale-95 scale-90 text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition"
          >
            logar com CPF/CNPJ
          </button>
          <button
            type="button"
            onClick={handleRedirectForgetPass}
            className="w-full flex text-orange-700 justify-center hover:underline mt-4 text-lg sm:text-xl underline"
          >
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginUser;
