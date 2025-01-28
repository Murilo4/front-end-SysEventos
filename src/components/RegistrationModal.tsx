import React, { useState } from 'react'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const [isCompany, setIsCompany] = useState(false)

  if (!isOpen) return null

  const handleAccountTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCompany(event.target.value === 'company')
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      aria-hidden="true"
    >
      <div className="flex w-full max-w-4xl h-[70vh] rounded-lg overflow-hidden shadow-lg">
        {/* Parte da esquerda: Texto explicativo */}
        <div className="bg-blue-thirth text-black text-xl p-12 flex flex-col w-1/2">
          <h3 className="text-xl font-bold mb-4 font-serif">
            Que bom que você deseja fazer parte da Contur!
          </h3>
          <p className="text-xl font-semibold font-serif mt-10">
            Vamos realizar o seu cadastro rapidamente para que você possa desfrutar de tudo que podemos oferecer!
          </p>
        </div>

        {/* Parte da direita: Formulário de Cadastro */}
        <div className="bg-slate-200 text-black pt-4 p-12 w-1/2 flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-gray-300"
          >
            &times;
          </button>

          <h3 className="text-xl font-bold mb-4 text-black">
            Qual tipo de conta você gostaria de abrir conosco?
          </h3>
          
          {/* Tipo de Conta */}
          <div className="mb-10">
            <p className="text-sm font-medium">
              <span className="font-bold text-xl">Consumidor: Quero estar me hospedando e ganhando pontos</span>
            </p>
            <a href="/registro-consumidor">
              <button className="mt-4 ml-4 text-xl mb-10 text-black font-bold py-2 px-4 hover:bg-blue-thirth transition border-2 border-blue-thirth shadow-black shadow-mid rounded-3xl">
                Cadastre-se aqui
              </button>
            </a>
          </div>

          {/* Para Empresas */}
          <div className="mt-6">
            <p className="text-sm font-medium mt-0">
              <span className="font-bold text-xl">Empresa: Quero cadastrar minha empresa</span>
            </p>
            <a href="/registro-empresa">
              <button className="mt-4 text-xl ml-4 text-black font-bold py-2 px-4 hover:bg-blue-thirth transition border-2 border-blue-thirth shadow-black shadow-mid rounded-3xl">
                Cadastre sua empresa aqui
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationModal