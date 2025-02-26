'use client'

import Cookies from 'universal-cookie'
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserAccount = () => {
  const [image, setImage] = useState<string | null>('/foto-padrao.png'); // Foto padrão inicialmente
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
  const [isImageChanged, setIsImageChanged] = useState<boolean>(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    cpf: '',
    phone: '',
    photo: ''
  });
  const [planData, setPlanData] = useState({
    planName: ''
  });
  const [originalUserData, setOriginalUserData] = useState(userData);
  const [isLoading, setIsLoading] = useState(true);
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
            photo: data.userData.photo // Foto vinda do backend
          };
          console.log(data.subscriptionData.PlanName)
          setPlanData({ planName: data.subscriptionData.PlanName }); // Ensure planData is set correctly
          setUserData(fetchedData);
          setOriginalUserData(fetchedData);

          // Se a foto não estiver disponível, usa a foto padrão
          if (fetchedData.photo) {
            const fullImageUrl = `http://localhost:8000${fetchedData.photo}`;
            setImage(fullImageUrl); // A URL completa da foto do usuário
          } else {
            setImage('/foto-padrao.png'); // Imagem padrão
          }
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
          setIsImageChanged(true);
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

  const handleSaveImage = async () => {
    try {
      const cookies = new Cookies();
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('photo', fileInputRef.current?.files?.[0] as Blob);

      const response = await fetch(`${apiUrl}/update-user-photo/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Foto de perfil atualizada com sucesso.');
        setImage(URL.createObjectURL(fileInputRef.current?.files?.[0]!)); // Atualiza a imagem com a nova foto
      } else {
        toast.error(data.message || 'Erro ao atualizar foto.');
      }
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      toast.error('Erro ao enviar foto.');
    }
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
        setIsEditingPassword(true);
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
    <div className="mx-auto mt-16 px-4 bg-white min-h-screen">
      <ToastContainer />
      <div className="flex justify-between mb-8">
        <button
          onClick={HandleRedirect}
          className="flex text-lg max-h-10 border-blue-thirth rounded-2xl py-2 px-4 bg-blue-thirth text-white font-medium justify-center h-auto"
        >Voltar</button>
        <div className="text-lg mt-4 md:mt-0 xl:mr-20"> {/* Margem superior em telas pequenas */}
          <p className="mb-2">Plano atual da conta:</p>
          <p className="text-xl">{planData.planName}</p>
          <button
            className="text-lg border-4 hover:bg-blue-thirth hover:text-white border-blue-thirth rounded-xl px-4 mt-4 md:mt-0"
            onClick={() => router.push('/planos')}
          >
            Mudar de plano
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-10">
        <p className="text-3xl text-slate-800 font-semibold">Meu perfil</p>
      </div>

      {/* Flex container to align profile photo and user data form side by side */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-12 md:gap-20 mb-20">
        {/* User Data Form */}
        <div className="w-full md:w-1/2 space-y-6 max-w-[600px]">
          <form className="space-y-6" onSubmit={handleSaveClick}>
            {/* User Data Fields */}
            <div>
              <p className="text-lg font-medium">Nome completo:</p>
              <input
                type="text"
                value={userData.username}
                placeholder='Nome completo'
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                className="w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <p className="text-lg font-medium">Email:</p>
              <input
                type="email"
                value={userData.email}
                placeholder='Email'
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-lg font-medium">CPF:</p>
              <input
                type="text"
                value={userData.cpf}
                placeholder='CPF'
                onChange={(e) => setUserData({ ...userData, cpf: e.target.value })}
                className="w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-lg font-medium">Telefone:</p>
              <input
                type="text"
                value={userData.phone}
                placeholder='Telefone'
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                className="w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-lg font-medium">Senha:</p>
              <input
                type="password"
                placeholder='*************'
                readOnly={!isEditingPassword}
                className={`w-full border-4 border-blue-thirth rounded-2xl p-3 shadow-md placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditingPassword ? 'bg-gray-100' : ''}`}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!isDataChanged}
                className={`w-full md:w-auto h-full border-4 border-blue-thirth rounded-2xl px-6 py-3 mt-5 bg-blue-thirth text-white font-medium hover:bg-blue-600 ${!isDataChanged ? 'opacity-50 cursor-not-allowed' : ''}`} >
                Salvar alterações
              </button>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full md:w-auto h-full border-4 border-blue-thirth rounded-2xl py-3 px-6 mt-5 bg-blue-thirth text-white font-medium"
              >
                Alterar senha
              </button>
            </div>
          </form>
        </div>

        {/* Profile Photo Section */}
        <div className="flex justify-center w-full sm:w-1/4 md:w-1/3">
          <div className="relative w-60 h-60 mb-8">
            <div className="w-full h-full rounded-full overflow-hidden">
              {image && (
                <Image
                  src={image}
                  alt="Foto de perfil"
                  width={240}
                  height={240}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="absolute bottom-0 right-0 mb-2 mr-2 z-10">
              <button
                onClick={handleButtonClick}
                className="bg-blue-thirth p-2 rounded-full text-white"
                style={{
                  transform: 'translateY(50%)',
                  zIndex: 10,
                }}
              >
                Editar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleSaveImage}
                className="mt-4 bg-blue-thirth text-white p-2 rounded-lg"
                disabled={!isImageChanged}
              >
                Salvar foto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
