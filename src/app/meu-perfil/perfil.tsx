'use client'

import Cookies from 'universal-cookie'
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserAccount = () => {
  const [image, setImage] = useState<string>('/foto-padrao.png');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    cpf: '',
    phone: '',
    photo: ''
  });
  const [originalUserData, setOriginalUserData] = useState(userData)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter();

  useEffect(() => {
    // Função para buscar dados do usuário
    const fetchUserData = async () => {
      try {
        const cookies = new Cookies();
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/user-profile/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cookies.get('access')}`
          },
        });
        const data = await response.json();
        if (data.success) {
          const fetchedData = {
            username: data.userData.username,
            email: data.userData.email,
            cpf: data.userData.cpf,
            phone: data.userData.phone,
            photo: data.userData.photo
          };
          setUserData(fetchedData);
          setOriginalUserData(fetchedData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        toast.error('Erro ao buscar dados do usuário.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Usando a optional chaining para evitar null
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result; // Verificando se e.target não é null
        if (typeof result === 'string') {
          setImage(result); // Atualiza a imagem para a nova escolhida
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const HandleRedirect = () => {
    router.push('/main-page');
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    try {
      const cookies = new Cookies();
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/update-user/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.get('access')}` 
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (data.success) {
        console.log('Dados atualizados com sucesso:', data);
        setOriginalUserData(userData);
        toast.success(data.message || 'Dados atualizados com sucesso.');
      } else {
        console.error('Erro ao atualizar dados:', data);
        toast.error(data.message || 'Erro ao atualizar dados.');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar dados.');
    }
  };

  const handlePasswordReset = async () => {
    try {
      const cookies = new Cookies();
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/request-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.get('access')}`
        },
        body: JSON.stringify({ email: userData.email })
      });
      const data = await response.json();
      if (data.success) {
        setIsEditingPassword(true)
        toast.success('Link para redefinição de senha enviado para o seu email.');
      } else {
        toast.error(data.message || 'Erro ao enviar link de redefinição de senha.');
      }
    } catch (error) {
      console.error('Erro ao enviar link de redefinição de senha:', error);
      toast.error('Erro ao enviar link de redefinição de senha.');
    }
  };

  const isDataChanged = JSON.stringify(userData) !== JSON.stringify(originalUserData);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-32 max-w-1440px px-2 bg-white min-h-screen">
      <ToastContainer />
      <div className="flex ml-350px mb-8">
        <button
          onClick={HandleRedirect}
          className="flex text-xl border-blue-thirth rounded-2xl py-2 px-4 bg-blue-thirth text-white font-medium justify-center"
        >Voltar</button>
      </div>
      <div className="flex justify-end">
        <div>
          <p className='text-xl ml-4'>Plano atual da conta:</p>
          <p className="flex ml-12 text-xl">Plano Gratuito</p>
          <button
            className="flex text-xl border-4 ml-6 hover:bg-blue-thirth hover:text-white border-blue-thirth rounded-xl px-4 justify-center mr-40"
          >Mudar de plano</button>
        </div>
      </div>
      <div className='flex justify-center'>
        <p className="text-3xl text-slate-800 mb-10 font-sans font-semibold">Meu perfil</p>
      </div>

      {/* Flex container to align profile photo and user data form side by side */}
      <div className="flex justify-center items-start mb-20">
        {/* User Data Form */}
        <div className="max-w-530px space-y-4 mr-10">
          <form className="space-y-4" onSubmit={handleSaveClick}>
            {/* User Data Fields */}
            <p className="text-xl font-sans">Nome completo:</p>
            <input
              type="text"
              value={userData.username}
              placeholder='Nome completo'
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              className="w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md shadow-slate-500 placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xl font-sans">Email:</p>
            <input
              type="email"
              value={userData.email}
              placeholder='Email'
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md shadow-slate-500 placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xl font-sans">CPF:</p>
            <input
              type="text"
              value={userData.cpf}
              placeholder='CPF'
              onChange={(e) => setUserData({ ...userData, cpf: e.target.value })}
              className="w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md shadow-slate-500 placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xl font-sans">Telefone:</p>
            <input
              type="text"
              value={userData.phone}
              placeholder='Telefone'
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              className="w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md shadow-slate-500 placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xl font-sans">Senha:</p>
            <input
              type="password"
              placeholder='*************'
              readOnly={!isEditingPassword}
              className={`w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md shadow-slate-500 placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditingPassword ? 'bg-gray-100' : ''}`}
            />

            <div className="flex min-w-screen h-16">
              <button
                type="submit"
                disabled={!isDataChanged}
                className={`shadow-md h-full shadow-slate-500 font-sans justify-center mr-5 w-full border-4 border-blue-thirth rounded-2xl px-3 mt-5 bg-blue-thirth text-white text-lg font-medium hover:bg-blue-600 transition ${!isDataChanged ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Salvar alterações
              </button>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full h-full border-4 border-blue-thirth rounded-2xl py-3 px-6 mt-5 bg-blue-thirth text-white text-lg font-medium">
                Alterar senha
              </button>
            </div>
          </form>
        </div>

        {/* Profile Photo */}
         {/* Profile Photo Section */}
         <div className="ml-10">
          <div className="flex justify-center">
            <div className="relative w-60 h-60 mb-8">
              <Image
                src={image}
                alt="Foto de perfil"
                width={240}
                height={240}
                className="rounded-full object-cover border-4 border-blue-thirth"
              />
              <div className="absolute bottom-0 right-0">
                <button
                  onClick={handleButtonClick}
                  className="bg-blue-thirth p-2 rounded-full text-white"
                >
                  <span>Editar</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;