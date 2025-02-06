'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import EventSchema from '@/schemas/registerEvent'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import { FormCreateEventErrors, FormCreateEvent, InputName } from '@/types/updateEvent'
import { useSearchParams } from 'next/navigation'; // Importando useSearchParams


const initialErrors: FormCreateEventErrors = {
  eventName: [],
  data: [],
  horarioIni: [],
  horarioFinal: [],
  photo: [],
  description: [],
  participants: [],
}

export const EditEvent = () => {
  const [formValues, setFormValues] = useState<FormCreateEvent>({
    eventName: '',
    data: '',
    horarioIni: '', // Campo de horário inicial
    horarioFinal: '', // Campo de horário final
    photo: null,
    description: '',
    participants: ''
  });
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const [formErrors, setFormErrors] = useState<FormCreateEventErrors>(initialErrors);
  const [loader, setLoader] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carregamento
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
 // Agora depende de eventId estar definido
  useEffect(() => {
    if (!eventId) return; // Não tenta buscar dados até eventId ser definido
  
    const fetchEventData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const cookies = new Cookies();
      try {
        const response = await fetch(`${apiUrl}/get-event/${eventId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${cookies.get('access')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setFormValues({
            eventName: data.event.eventName,
            data: data.event.data,
            horarioIni: data.event.horarioInicio,
            horarioFinal: data.event.horarioFinal,
            photo: data.event.photo,
            description: data.event.description,
            participants: data.event.participants,
          });
          console.log(data)
          if (data.event.photo) {
            setImagePreview(`http://localhost:8000/${data.event.photo}`);
          }
        } else {
          toast.error(data.message || 'Erro ao buscar dados do evento');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do evento:', error);
        toast.error('Erro ao carregar os dados do evento.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchEventData();
  }, [eventId]);  // Só executa quando eventId for definido

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Limpar erros ao editar o campo
    if (formErrors[name as InputName]?.length > 0) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: [],
      }));
    }

    // Atualizar os valores no estado
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
  
    if (file) {
      // Verificar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Por favor, envie um arquivo de imagem (JPEG, PNG, JPG).');
        return;
      }
  
      // Verificar tamanho do arquivo (exemplo: máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB.');
        return;
      }
  
      // Atualizar o estado com o arquivo real
      setFormValues((prevValues) => ({
        ...prevValues,
        photo: file,
      }));
  
      // Atualizar o preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoader(true);
  
    const validation = EventSchema.safeParse(formValues);
    console.log(formValues)
    if (!validation.success) {
      console.log('Validation errors:', validation.error.formErrors.fieldErrors);
      setFormErrors({
        ...initialErrors,
        ...validation.error.formErrors.fieldErrors,
      });
  
      Object.values(validation.error.formErrors.fieldErrors).forEach((errorArray) => {
        if (errorArray && errorArray.length > 0) {
          errorArray.forEach((error) => {
            toast.error(error);
          });
        }
      });
    } else {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const cookies = new Cookies();
  
        // Usar FormData para enviar o arquivo de foto junto com os outros dados
        const formData = new FormData();
        formData.append('eventName', formValues.eventName);
        formData.append('data', formValues.data);
        formData.append('horarioIni', formValues.horarioIni);
        formData.append('horarioFinal', formValues.horarioFinal);
        formData.append('description', formValues.description);
        formData.append('participants', formValues.participants)
        
        // Verifica se a foto foi alterada e adiciona o arquivo
        if (formValues.photo instanceof File) {
          formData.append('photo', formValues.photo); // Envia o arquivo real
        }
        console.log(formValues)
        const response = await fetch(`${apiUrl}/update-event/${eventId}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${cookies.get('access')}`,
          },
          body: formData,
        });
  
        const data = await response.json();
        console.log(response)
        if (response.ok) {
          toast.success(data.message);
          router.push('/main-page');
        } else {
          toast.warning(data.message);
        }
      } catch (error) {
        console.error('API request error:', error);
        toast.error('Erro ao enviar a requisição. Tente novamente mais tarde.');
      }
    }
    setLoader(false);
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-lg bg-white p-5 rounded-xl shadow-md">
          {isLoading ? ( // Mostra o loading se isLoading for true
            <p>Carregando dados do evento...</p>
          ) : (
            <form className="space-y-3" onSubmit={handleFormSubmit}>
              {/* Campo Nome do Evento */}
              <input
                type="text"
                name="eventName"
                value={formValues.eventName} // Valor do estado
                placeholder="Nome do evento"
                className="w-full border border-gray-400 focus:scale-105 placeholder:text-black text-black rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInputChange}
              />

              <input
                type="date"
                name="data"
                value={formValues.data} // Valor do estado
                className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInputChange}
              />

              <input
                type="time"
                name="horarioIni"
                value={formValues.horarioIni} // Valor do estado
                className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInputChange}
              />

              <input
                type="time"
                name="horarioFinal"
                value={formValues.horarioFinal} // Valor do estado
                className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInputChange}
              />

              <input
                type="text"
                name="description"
                value={formValues.description} // Valor do estado
                placeholder="Descrição"
                className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInputChange}
              />
              <input
                  type="number"
                  name="participants"
                  value={formValues.participants}
                  placeholder="Quantidade de participantes"
                  className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleInputChange}
                />
                {/* Verificação de erro na descrição */}
                {formErrors.participants && formErrors.participants.length > 0 && (
                  <p className="text-red text-sm">{formErrors.participants[0]}</p>
                )}
              <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden mb-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview da Foto" className="object-cover w-full h-full" />
                ) : (
                  <p>Sem foto atual</p>
                )}
              </div>
              <input
                type="file"
                name="photo"
                className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handlePhotoChange}
              />
              {/* Verificação de erro na foto */}
              {formErrors.photo && formErrors.photo.length > 0 && (
                <p className="text-red text-sm">{formErrors.photo[0]}</p>
              )}

              <button
                type="submit"
                className="w-full mt-4 text-xl bg-principal-blue hover:scale-100 scale-95 text-white font-bold py-3 px-4 rounded-3xl hover:bg-blue-600 transition"
              >
                {loader ? 'Atualizando...' : 'Atualizar evento'}
              </button>

              <button
                type="button"
                className="w-full mt-4 text-xl bg-gray-500 hover:scale-100 scale-95 text-white font-bold py-3 px-4 rounded-3xl hover:bg-gray-600 transition"
                onClick={() => router.back()} // Voltar à página anterior
              >
                Voltar
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}