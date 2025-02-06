'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'

interface EventData {
  eventName: string;
  description: string;
  photo: string;
  data: string;
  horarioInicio: string;
  horarioFinal: string;
  isActive: boolean;
}
const InvitationPage: React.FC = () => {
  const router = useRouter()
  const { id: eventId } = useParams()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isEventActive, setIsEventActive] = useState<boolean>(false)
  const cookies = new Cookies()

  // Função para buscar os dados do evento
  const fetchEventDetails = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/get-event-user/${eventId}/`, {
        method: 'GET',
      })
      const data = await response.json()

      if (response.ok) {
        setEventData(data.event)
        setIsEventActive(data.event.isActive)
      } else {
        setError('Erro ao carregar os detalhes do evento.')
      }
    } catch (error) {
      console.error('Erro ao buscar os dados do evento:', error)
      setError('Erro ao buscar os dados do evento. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  // Função para aceitar o convite e participar do evento
  const handleAcceptEvent = async () => {
    const token = cookies.get('access')
    
    if (!token) {
      // Se o cookie 'access' não existir, redireciona para a página de validação de usuário
      router.push(`/validate-user-info/${eventId}`)
      return
    }

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/accept-event/${eventId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      const userId = data.data.id ;
      if (response.ok) {
        toast.success('Você aceitou o convite para o evento!')
        router.push(`/evento/${eventId}/${userId}`)
      } else {
        toast.error(data.message || 'Erro ao aceitar o convite.')
      }
    } catch (error) {
      console.error('Erro ao aceitar o convite:', error)
      toast.error('Erro ao aceitar o convite. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  // Função para verificar se o evento está ativo a cada 10 segundos
  const checkEventStatus = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/get-event-active/${eventId}/`, {
        method: 'GET',
      })
      const data = await response.json()

      if (response.ok && data.event.isActive !== isEventActive) {
        setIsEventActive(data.event.isActive)
      }
    } catch (error) {
      console.error('Erro ao verificar status do evento:', error)
    }
  }, [eventId, isEventActive])

  // Efetua a busca dos detalhes do evento assim que o eventId estiver disponível
  useEffect(() => {
    if (eventId) {
      fetchEventDetails()

      // Inicia a verificação do status do evento a cada 10 segundos
      const interval = setInterval(checkEventStatus, 10000)

      return () => clearInterval(interval)
    }
  }, [eventId, fetchEventDetails, checkEventStatus])

  if (loading) {
    return <p>Carregando...</p>
  }

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Convite para o Evento</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {eventData && (
          <div className="bg-white p-6 rounded-md shadow-md">
            <img src={`http://localhost:8000${eventData.photo}`} alt="Foto do Evento" className="h-auto rounded-md mb-2" />
            <h2 className="text-2xl font-semibold mb-4">{eventData.eventName}</h2>
            <p className="mb-4">{eventData.description}</p>
            <p className="text-lg mb-4">Data: {new Date(eventData.data).toLocaleDateString()}</p>
            <p className="text-lg mb-4">Horario inicial: {eventData.horarioInicio}</p>
            <p className="text-lg mb-4">Horario estimado de termino: {eventData.horarioFinal}</p>

            <div className="flex justify-center">
              <button
                onClick={handleAcceptEvent}
                className="bg-green text-white py-2 px-6 rounded-md hover:bg-green"
                disabled={!isEventActive || loading} // Habilita/desabilita com base no status do evento
              >
                {loading ? 'Carregando...' : isEventActive ? 'Aceitar Convite' : 'Evento ainda não começou'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default InvitationPage
