'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import { BrowserMultiFormatReader } from '@zxing/library'
import { FaEdit, FaTrash, FaQuestion, FaEye, FaDownload } from 'react-icons/fa'

interface EventData {
  id: string;
  eventName: string;
  description: string;
  photo: string;
  qrCode: string;
  isActive: boolean;
  existFilter: boolean;
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
  const image_url = process.env.NEXT_PUBLIC_API_BASE_URL
  const [userData, setUserData] = useState({
    username: '',
    photo: ''
  });

  const validateAuth = useCallback(() => {
    const userValid = cookies.get('user_valid')
    setCanAddEvent(userValid === true)
  }, [cookies])
  // Função para validar o token do usuário
  const validateToken = useCallback(async () => {
    const token = cookies.get('access')
    if (!token) {
      router.push('/')
      return
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
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
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
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

  const fetchUserData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/user-profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.get('access')}`
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserData({
          username: data.userData.username,
          photo: data.userData.photo ? `${image_url}${data.userData.photo}` : '/foto-padrao.png'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }, [cookies]);

  useEffect(() => {
    validateToken()
    fetchEvents()
    fetchUserData()
  }, [fetchEvents, validateToken, fetchUserData])


  const handleCreateEvent = () => {
      router.push('/criar-evento')
  }
  
  const handleDeleteEvent = async (eventId: string) => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
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
      <div className="container mx-auto p-2 relative">
        <div className="flex justify-end space-x-2 sm:flex sm:space-x-2 z-10">
          <div
            onClick={() => router.push('/meu-perfil')}
            className="flex items-center space-x-2 cursor-pointer border-2 text-black py-2 px-4 rounded-2xl hover:bg-blue-mid hover:text-white"
          >
            {userData.photo && (
              <img
                src={userData.photo}
                alt="Foto do usuário"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{userData.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-black py-2 px-4 rounded-2xl hover:bg-red hover:text-white border-2"
          >
            Sair
          </button>
        </div>
        <div className="container mx-auto relative">
          <h1 className="text-2xl font-bold text-center mb-1">Gerenciamento de Eventos</h1>

          {canAddEvent === null ? (
            <p>Carregando...</p>
          ) : (
            <div className="text-center">
              <button
                onClick={handleCreateEvent}
                className="bg-principal-blue text-white py-2 px-4 mb-4 rounded-md hover:bg-blue-600"

              >
               Criar Novo Evento
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
                <div key={event.id} className="border border-blue-mid p-4 rounded-md shadow-md shadow-blue-mid flex flex-col items-center w-full max-w-sm mx-auto">
                  <h3 className="text-xl mb-2 font-semibold text-center">{event.eventName}</h3>
                  {event.photo ? (
                    <img src={`${image_url}${event.photo}`} alt="Foto do Evento" className="h-32 rounded-md mb-2" />
                  ) : (
                    <p>Foto do evento não disponível</p>
                  )}
                  <p className="text-center mt-2 text-base">{event.description}</p>
                  {event.qrCode && (
                    <div className="w-full flex flex-col items-center mb-2">
                      <img
                        src={`${image_url}${event.qrCode}`}
                        alt="QR Code do Evento"
                        className="h-32 rounded-md cursor-pointer"
                        onClick={() => openQrCodeImage(`${image_url}${event.qrCode}`)}
                      />
                      <button
                        onClick={() => downloadImage(`${image_url}${event.qrCode}`)}
                        className="bg-green text-black py-2 px-3 rounded-md mt-2"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  )}
                  {isQrCodeVisible && qrCodeImage && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20"
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
                    <div className="grid grid-cols-4 gap-2 w-full">
                      <button
                        onClick={() => handleEditEvent(event.id)}
                        className="bg-blue text-white p-2 rounded-md hover:bg-blue flex flex-col items-center"
                      >
                        <FaEdit />
                        <span className="text-xs">Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="bg-red text-white p-2 rounded-md hover:bg-red flex flex-col items-center"
                      >
                        <FaTrash />
                        <span className="text-xs">Excluir</span>
                      </button>
                      <button
                        onClick={() => router.push(`/questions/${event.id}`)}
                        className="bg-yellow text-white p-2 rounded-md hover:bg-yellow flex flex-col items-center"
                      >
                        <FaQuestion />
                        <span className="text-xs">Perguntas</span>
                      </button>
                      <button
                        onClick={() => handleStartEvent(event.id)}
                        className="bg-green text-white p-2 rounded-md hover:bg-green flex flex-col items-center"
                        disabled={!canAddEvent}
                      >
                        <FaEye />
                        <span className="text-xs">Iniciar</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/past-events/${event.id}`)}
                    className="bg-purple text-white py-2 px-4 rounded-md hover:bg-purple w-full mt-2 flex flex-col items-center"
                    disabled={!event.existFilter}
                  >
                    <FaEye />
                    <span className="text-xs">Eventos Realizados</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-center mt-8">
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

        <div className="flex justify-center mt-8"> {/* Center the button */}
          <button
            onClick={() => setIsQrCodeVisible(true)}
            className="bg-green-500 hover:bg-green-700 text-black font-bold py-2 px-4 rounded"
          >
            Escanear QR Code
          </button>
        </div>

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
