'use client'
import { useRouter } from 'next/navigation';
import React from "react";

const LoginWithEmail: React.FC = () => {
    const router = useRouter();

    const handleRedirect = () => {
        router.push('/email');
    };
    return (
    <div className="flex h-screen">
      {/* Metade Esquerda (Azul) */}
      <div className="w-1/2 bg-blue-thirth text-white flex flex-col justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Você ainda não faz parte da Contur?</h2>
        <p className="text-sm mb-6">
          Vamos realizar o seu cadastro rapidamente para que você possa desfrutar de tudo que podemos oferecer!
        </p>
        <a href="/" target="_blank">
          <button className="bg-white text-black py-3 px-4 rounded-3xl font-bold hover:bg-gray-200 transition">
            Criar conta
          </button>
        </a>
      </div>

      {/* Metade Direita (Branca) */}
      <div className="w-1/2 bg-gray-100 flex flex-col justify-center p-8">
        <form className="space-y-4">
          {/* Razão Social */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-2xl placeholder-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Email para Contato */}
          <input
            type="password"
            placeholder="Senha"
            className="w-full border border-gray-300 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-black"
          />
          <button
            className="w-full mt-4 text-xl bg-blue-thirth text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition"
          >
            Logar
          </button>
          <button 
          onClick={handleRedirect}
          className="w-full flex justify-center hover: underline mt-4"
          >
            Realizar login de outra forma
          </button>
        </form>
    </div>
    </div>
    )

}

export default LoginWithEmail