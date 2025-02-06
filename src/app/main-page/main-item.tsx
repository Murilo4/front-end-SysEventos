'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import { BrowserMultiFormatReader } from '@zxing/library'

interface EventData {
  id: string;
  eventName: string;
  description: string;
  photo: string;
  qrCode: string;
  isActive: boolean;
  // Add any other properties you expect
}
const MainPage: React.FC = () => {
  const cookies = useMemo(() => new Cookies(), [])
  const [events, setEvents] = useState<EventData[]>([])
  const [canAddEvent, setCanAddEvent] = useState<boolean | null>(null)
  const [loader, setLoader] = useState<boolean>(false)
  const [eventCode, setEventCode] = useState<string>('') 
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const [isQrCodeVisible, setIsQrCodeVisible] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const router = useRouter()

  const validateAuth = useCallback(() => {
    const userValid = cookies.get('user_valid')
    setCanAddEvent(userValid === true)
  }, [cookies])
  // Função para validar o token do usuário
  const validateToken = useCallback ( async () => {
    const token = cookies.get('access')
    if (!token) {
      router.push('/')
      return
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/validate-token/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        router.push('/')
      } else {
        validateAuth()
      }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      router.push('/')
    }
  }, [router, cookies, validateAuth]);

  const handleStartEvent = async (eventId: string) => {
    router.push(`/control-evento/${eventId}`)
  }

  const handleLogout = () => {
    cookies.remove('access') 
    cookies.remove('user_valid')
    router.push('/')
    toast.success('Você foi deslogado com sucesso!')
  }
  const fetchEvents = useCallback(async () => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/get-all-events/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setEvents(data.events)
      } else {
        toast.error('Erro ao carregar eventos')
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      toast.error('Erro ao carregar eventos. Tente novamente mais tarde.')
    }
    setLoader(false)
  }, [cookies]);

  useEffect(() => {
    validateToken()
    fetchEvents()
  }, [fetchEvents, validateToken])


  const handleCreateEvent = () => {
    if (canAddEvent) {
      router.push('/criar-evento')
    } else {
      toast.warning('Você não tem permissão para criar eventos. Solicite permissão!')
    }
  }

  const handleRequestPermission = () => {
    toast.info('Solicitação de permissão enviada para um administrador.')
  }

  const handleDeleteEvent = async (eventId: string) => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/delete-event/${eventId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ eventId }),
      })
      const data = await response.json()
      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId))
        toast.success('Evento excluído com sucesso!')
        router.push('/main-page')
      } else {
        toast.error(data.message || 'Erro ao excluir evento.')
      }
    } catch (error) {
      console.error('Erro na requisição de exclusão:', error)
      toast.error('Erro ao excluir evento. Tente novamente mais tarde.')
    }
    setLoader(false)
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/editar-evento?id=${eventId}`)
  }

  // const handleSubmitCode = (event: React.FormEvent) => {
  //   event.preventDefault()
  //   handleEventNavigation(eventCode)
  // }

  const handleEventNavigation = (eventCode: string) => {
    if (eventCode) {
      if (eventCode.startsWith('http') || eventCode.startsWith('www')) {
        window.location.href = eventCode
      } else {
        router.push(`/event/invitation/${eventCode}`)
      }
    }
  }

  const openQrCodeImage = (qrCodeUrl: string) => {
    setQrCodeImage(qrCodeUrl)
    setIsQrCodeVisible(true)
  }

  const closeQrCodeImage = () => {
    setIsQrCodeVisible(false)
  }

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Erro ao baixar a imagem')
      }
      const blob = await response.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = url.split('/').pop() ?? 'download.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao baixar a imagem.')
    }
  }

  // Função para processar o QR Code
  const handleScan = useCallback((result: string) => {
    if (result) {
      router.push(`/evento/invitation/${result}`)
    }
  }, [router]); 

  useEffect(() => {
    const scanner = new BrowserMultiFormatReader()
    if (videoRef.current) {
      scanner.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          handleScan(result.getText())
        }
        if (error) {
          console.error(error)
        }
      })
    }

    return () => {
      scanner.reset()
    }
  }, [handleScan])


  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-3 relative">
        <div className="flex justify-end space-x-2 sm:flex sm:space-x-2 z-10">
          <button
            onClick={() => router.push('/meu-perfil')}
            className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue"
          >
            Meu Perfil
          </button>
          <button
            onClick={handleLogout}
            className="bg-red text-white py-3 px-4 rounded-md hover:bg-red"
          >
            Sair
          </button>
        </div>
        <div className="container mx-auto p-6 relative pt-4">
          <h1 className="text-3xl font-bold text-center mb-3">Gerenciamento de Eventos</h1>

          {canAddEvent === null ? (
            <p>Carregando...</p>
          ) : (
            <div className="text-center">
              <button
                onClick={handleCreateEvent}
                className="bg-principal-blue text-white py-2 px-4 mb-4 rounded-md hover:bg-blue-600"
                disabled={canAddEvent === false}
              >
                {canAddEvent ? 'Criar Novo Evento' : 'Solicitar Permissão para Criar Evento'}
              </button>
            </div>
          )}

          {!canAddEvent && (
            <div className="text-center">
              <button
                onClick={handleRequestPermission}
                className="bg-yellow text-white py-2 px-4 rounded-md hover:bg-yellow"
              >
                Solicitar Permissão
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loader ? (
              <p>Carregando eventos...</p>
            ) : events.length === 0 ? (
              <p className="text-center">Nenhum evento encontrado.</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="border border-blue-mid p-4 rounded-md shadow-md shadow-blue-mid flex flex-col items-center">
                  <h3 className="text-2xl mb-2 font-semibold text-center">{event.eventName}</h3>
                  {event.photo ? (
                    <img src={`http://localhost:8000${event.photo}`} alt="Foto do Evento" className="h-1/3 rounded-md mb-2" />
                  ) : (
                    <p>Foto do evento não disponível</p>
                  )}
                  <p className="text-center mt-2 text-xl">{event.description}</p>
                  {event.qrCode && (
                    <div className="w-2/4">
                      <img
                        src={`http://localhost:8000${event.qrCode}`}
                        alt="QR Code do Evento"
                        className="h-auto rounded-md cursor-pointer"
                        onClick={() => openQrCodeImage(`http://localhost:8000${event.qrCode}`)}
                      />
                      <button
                        onClick={() => downloadImage(`http://localhost:8000${event.qrCode}`)}
                        className="bg-green text-black py-2 px-3 rounded-md ml-10"
                      >
                        Baixar QR Code
                      </button>
                    </div>
                  )}
                  {isQrCodeVisible && qrCodeImage && (
                    <div
                      className="fixed w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-20"
                      onClick={closeQrCodeImage}
                    >
                      <img
                        src={qrCodeImage}
                        alt="QR Code"
                        className="max-w-lg max-h-lg rounded-md cursor-pointer"
                      />
                    </div>
                  )}
                  <div className="flex justify-center w-full mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <button
                        onClick={() => handleEditEvent(event.id)}
                        className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="bg-red text-white py-2 px-4 rounded-md hover:bg-red"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => router.push(`/questions/${event.id}`)}
                        className="bg-yellow text-white py-2 px-4 rounded-md hover:bg-yellow"
                      >
                        Manipular Perguntas
                      </button>
                      <button
                        onClick={() => handleStartEvent(event.id)}
                        className="bg-green text-white py-2 px-4 rounded-md hover:bg-green"
                        disabled={!canAddEvent}
                      >
                        Iniciar evento
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-center mt-4">
        <div className="w-full max-w-md mr-4">
          <label htmlFor="eventCode" className="block text-gray-700 font-bold mb-2">
            Código ou Link do Evento:
          </label>
          <input
            type="text"
            id="eventCode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEventNavigation(eventCode)
              }
            }}
          />
        </div>
        <button
          onClick={() => handleEventNavigation(eventCode)}
          className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          disabled={!eventCode}
        >
          Acessar Evento
        </button>
      </div>

      <button
        onClick={() => setIsQrCodeVisible(true)}
        className="bg-green-500 hover:bg-green-700 text-black font-bold py-2 px-4 rounded flex justify-center"
      >
        Escanear QR Code
      </button>

      {isQrCodeVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-20" onClick={() => setIsQrCodeVisible(false)}>
          <video ref={videoRef} autoPlay playsInline muted />
        </div>
        )}
      </div>
    </>
  )
}

export default MainPage
