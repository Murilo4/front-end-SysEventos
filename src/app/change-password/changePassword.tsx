'use client'

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'universal-cookie'

const ChangePassword: React.FC = () => {
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const [loader, setLoader] = useState<boolean>(false)
  const [email, setEmail] = useState('')

  const handleRedirect = () => {
    router.push('/login')
  };

  const handlePasswordChangeEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoader(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${apiUrl}/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email}),
      });

      const data = await response.json();
      if (data.success) {
            toast.success('Link para redefinição de senha enviado para o seu email.');
        } else {
            toast.error(data.message || 'Erro ao enviar link de redefinição de senha.');
        }
    } catch (error) {
      setLoader(false)
      console.error('Erro ao enviar link de redefinição', error);
      toast.error('Erro ao realizar login. Tente novamente mais tarde.');
    }
  };
  const handlePasswordChangePhone = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoader(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${apiUrl}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email}),
      });

      const data = await response.json();
      if (data.success) {
            toast.success('Link para redefinição de senha enviado para o seu email.');
        } else {
            toast.error(data.message || 'Erro ao enviar link de redefinição de senha.');
        }
    } catch (error) {
      setLoader(false)
      console.error('Erro ao realizar login:', error);
      toast.error('Erro ao realizar login. Tente novamente mais tarde.');
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <ToastContainer />
        <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-530px">
            <div>
                <button 
                onClick={handleRedirect}
                className="text-white w-1/5 border mb-4 bg-principal-blue hover:scale-95 scale-90 rounded-3xl hover:bg-blue-600 transition py-3 px-4">Voltar</button>
            </div>
            <div className="text-center mb-4">
                <h2 className="text-xl font-sans text-black mb-6">Para redefinir sua senha vamos precisar enviar um link de recuperação em seu email ou celular. 
                Por favor, preencha um dos campos abaixo para prosseguir.</h2>
            </div>
                <form onSubmit={handlePasswordChangeEmail} className="space-x-4 flex">
                    <div> 
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full border border-gray-400 rounded-2xl focus:scale-105 placeholder-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                    <button className="text-lg bg-principal-blue hover:scale-95 scale-90 text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition">Enviar para o email</button>
                </form>
                <form onSubmit={handlePasswordChangePhone} className="space-x-4 mt-10 flex">
                    <div> 
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Telefone"
                        className="w-full border border-gray-400 rounded-2xl focus:scale-105 placeholder-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                    <button className="text-lg bg-principal-blue hover:scale-95 scale-90 text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition">
                        Enviar para o telefone
                    </button>
                </form>
        </div>
    </div>
  );
};

export default ChangePassword