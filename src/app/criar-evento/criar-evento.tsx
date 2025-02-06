'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import EventSchema from '@/schemas/registerEvent'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import { FormCreateEventErrors, FormCreateEvent, InputName } from '@/types/createEvent'

const initialValues: FormCreateEvent = {
  eventName: '',
  data: '',
  horarioIni: '',
  horarioFinal: '',
  photo: '',
  participants: '',
  description: '',
}

const initialErrors: FormCreateEventErrors = {
  eventName: [],
  data: [],
  horarioIni: [],
  horarioFinal: [],
  photo: [],
  participants: [],
  description: [],
}

export const CreateNewEvent = () => {
  const [formValues, setFormValues] = useState<FormCreateEvent>(initialValues)
  const [formErrors, setFormErrors] = useState<FormCreateEventErrors>(initialErrors)
  const [startTime, setStartTime] = useState<string>('') // Controlando horário inicial separadamente
  const [endTime, setEndTime] = useState<string>('') // Controlando horário final separadamente
  const [photo, setPhoto] = useState<File | null>(null) // Controlando o arquivo de foto
  const router = useRouter();
  const [loader, setLoader] = useState<boolean>(false)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    // Limpar erros ao editar o campo
    if (formErrors[name as InputName]?.length > 0) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: [],
      }))
    }

    // Atualizar os valores no estado (apenas para os campos de texto ou data)
    if (name !== 'horarioIni' && name !== 'horarioFinal' && name !== 'photo') {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }))
    }
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStartTime(value)

    // Atualizar o valor de horário no formValues
    setFormValues((prevValues) => ({
      ...prevValues,
      horarioIni: value,
    }))

    // Se o horário final não for definido ou for antes do horário inicial, ajusta o horário final
    if (endTime && value >= endTime) {
      setEndTime('') // limpa o horário final se for inválido
      setFormValues((prevValues) => ({
        ...prevValues,
        horarioFinal: '', // Limpa o horário final se o horário inicial for alterado
      }))
    }
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEndTime(value)

    // Atualizar o valor de horário no formValues
    setFormValues((prevValues) => ({
      ...prevValues,
      horarioFinal: value,
    }))

    // Se o horário inicial não for definido ou for depois do horário final, ajusta o horário inicial
    if (startTime && value <= startTime) {
      setStartTime('') // limpa o horário inicial se for inválido
      setFormValues((prevValues) => ({
        ...prevValues,
        horarioIni: '', // Limpa o horário inicial se o horário final for alterado
      }))
    }
  }

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
  
      setPhoto(file); // Armazenar o arquivo no estado
    }
  };

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  
    setLoader(true);
  
    const validation = EventSchema.safeParse(formValues);
  
    if (!validation.success) {
      console.log('Validation errors:', validation.error.formErrors.fieldErrors);
      setFormErrors({
        ...initialErrors,
        ...validation.error.formErrors.fieldErrors,
      });
  
      // Exibindo os erros na interface
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
  
        // Criação do FormData para enviar o arquivo junto com os dados do evento
        const formData = new FormData();
        formData.append('eventName', formValues.eventName);
        formData.append('data', formValues.data);
        formData.append('horarioIni', formValues.horarioIni);
        formData.append('horarioFinal', formValues.horarioFinal);
        formData.append('description', formValues.description);
        formData.append('participants', formValues.participants)
        if (photo) {
          formData.append('photo', photo); // Adicionar o arquivo diretamente ao FormData
        }
  
        console.log(formData, formValues);
  
        const response = await fetch(`${apiUrl}/event-create/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cookies.get('refresh')}`,
          },
          body: formData, // Envia o FormData no corpo da requisição
        });
  
        const data = await response.json();
  
        if (response.status === 429) {
          toast.error('Muitas requisições. Tente novamente mais tarde.');
          setLoader(false);
          return;
        }
  
        if (data.success) {
          toast.success(data.message);
          router.push('/main-page')
        } else {
          console.log('API error:', data.message, data.errors);
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
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md">
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            {/* Campo Nome do Evento */}
            <input
              type="text"
              name="eventName"
              placeholder="Nome do evento"
              className="w-full border border-gray-400 focus:scale-105 placeholder:text-black text-black rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {/* Verificação de erro no eventName */}
            {formErrors.eventName && formErrors.eventName.length > 0 && (
              <p className="text-red text-sm">{formErrors.eventName[0]}</p>
            )}

            {/* Campo Data */}
            <input
              type="date"
              name="data"
              placeholder="Data"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]} // Define a data mínima como o dia de hoje
            />
            {/* Verificação de erro na data */}
            {formErrors.data && formErrors.data.length > 0 && (
              <p className="text-red text-sm">{formErrors.data[0]}</p>
            )}

            {/* Time Picker */}
            <div>
              <label htmlFor="horarioIni" className="block text-sm font-medium text-gray-700">Horário Inicial</label>
              <input
                type="time"
                id="horarioIni"
                name="horarioIni"
                value={startTime}
                onChange={handleStartTimeChange}
                className="w-full border border-gray-400 rounded-2xl p-3"
              />

              <label htmlFor="horarioFinal" className="block text-sm font-medium text-gray-700">Horário Final</label>
              <input
                type="time"
                id="horarioFinal"
                name="horarioFinal"
                value={endTime}
                onChange={handleEndTimeChange}
                min={startTime} // O horário final deve ser depois do horário inicial
                className="w-full border border-gray-400 rounded-2xl p-3"
              />
            </div>

            {/* Campo Descrição */}
            <input
              type="text"
              name="description"
              placeholder="Descrição"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {/* Verificação de erro na descrição */}
            {formErrors.description && formErrors.description.length > 0 && (
              <p className="text-red text-sm">{formErrors.description[0]}</p>
            )}
            <input
              type="number"
              name="participants"
              placeholder="Quantidade de participantes"
              className="w-full border border-gray-400 focus:scale-105 rounded-2xl placeholder:text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleInputChange}
            />
            {/* Verificação de erro na descrição */}
            {formErrors.description && formErrors.description.length > 0 && (
              <p className="text-red text-sm">{formErrors.description[0]}</p>
            )}

            {/* Campo Foto */}
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
              {loader ? 'Enviando...' : 'Cadastrar evento'}
            </button>
            <button
                type="button"
                className="w-full mt-4 text-xl bg-gray-500 hover:scale-100 scale-95 text-white font-bold py-3 px-4 rounded-3xl hover:bg-gray-600 transition"
                onClick={() => router.back()} // Voltar à página anterior
              >
                Voltar
              </button>
          </form>
        </div>
      </div>
    </>
  )
}
