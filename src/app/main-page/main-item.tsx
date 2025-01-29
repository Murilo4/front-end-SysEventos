'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import { BrowserMultiFormatReader } from '@zxing/library'

const MainPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([])
  const [canAddEvent, setCanAddEvent] = useState<boolean | null>(null)
  const [loader, setLoader] = useState<boolean>(false)
  const [eventCode, setEventCode] = useState<string>('') 
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const [isQrCodeVisible, setIsQrCodeVisible] = useState<boolean>(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const router = useRouter()
  const cookies = new Cookies()

  // Função para validar o token do usuário
  const validateToken = async () => {
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
  }

  const handleStartEvent = async (eventId: string) => {
    router.push(`/control-evento/${eventId}`)
  }

  const validateAuth = () => {
    const userValid = cookies.get('user_valid')
    setCanAddEvent(userValid === true)
  }

  const handleLogout = () => {
    cookies.remove('access') 
    cookies.remove('user_valid')
    router.push('/')
    toast.success('Você foi deslogado com sucesso!')
  }

  useEffect(() => {
    validateToken()
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
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
  }

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

  const handleSubmitCode = (event: React.FormEvent) => {
    event.preventDefault()
    handleEventNavigation(eventCode)
  }

  const handleEventNavigation = (eventCode: string) => {
    if (eventCode) {
      if (eventCode.startsWith('http') || eventCode.startsWith('www')) {
        window.location.href = eventCode
      } else {
        router.push(`/evento/${eventCode}`)
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
  const handleScan = (result: string) => {
    if (result) {
      setScanResult(result)
      router.push(`/evento/${result}`)
    }
  }

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
  }, [])

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-6 relative">
        <div className="absolute top-4 right-4 flex space-x-4 sm:flex-col sm:space-x-0 sm:space-y-2 z-10">
          <button
            onClick={() => router.push('/meu-perfil')}
            className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue"
          >
            Meu Perfil
          </button>
          <button
            onClick={handleLogout}
            className="bg-red text-white py-2 px-4 rounded-md hover:bg-red"
          >
            Sair
          </button>
        </div>
        <div className="container mx-auto p-6 relative pt-16">
          <h1 className="text-3xl font-bold text-center mb-6">Gerenciamento de Eventos</h1>

          {canAddEvent === null ? (
            <p>Carregando...</p>
          ) : (
            <div className="mb-6 text-center">
              <button
                onClick={handleCreateEvent}
                className="bg-principal-blue text-white py-2 px-4 rounded-md hover:bg-blue-600"
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

          
            {scanResult && <p>Resultado: {scanResult}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {loader ? (
              <p>Carregando eventos...</p>
            ) : events.length === 0 ? (
              <p className="text-center">Nenhum evento encontrado.</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="border p-4 rounded-md shadow-md flex flex-col items-center">
                  <h3 className="text-2xl mb-4 font-semibold text-center">{event.eventName}</h3>
                  {event.photo ? (
                    <img src={`http://localhost:8000${event.photo}`} alt="Foto do Evento" className="h-auto rounded-md mb-2" />
                  ) : (
                    <p>Foto do evento não disponível</p>
                  )}
                  <p className="text-center mt-2 text-xl">{event.description}</p>
                  {event.qrCode && (
                    <div className="w-2/4 mt-2">
                      <img
                        src={`http://localhost:8000${event.qrCode}`}
                        alt="QR Code do Evento"
                        className="h-auto rounded-md cursor-pointer"
                        onClick={() => openQrCodeImage(`http://localhost:8000${event.qrCode}`)}
                      />
                      <button
                        onClick={() => downloadImage(`http://localhost:8000${event.qrCode}`)}
                        className="bg-green-500 text-black py-2 px-4 rounded-md ml-2"
                      >
                        Baixar QR Code
                      </button>
                    </div>
                  )}
                  {isQrCodeVisible && qrCodeImage && (
                    <div
                      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-20"
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
                    <button
                      onClick={() => handleEditEvent(event.id)}
                      className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red ml-3 text-white py-2 px-4 rounded-md hover:bg-red"
                    >
                      Excluir
                    </button>
                    <button
                      onClick={() => router.push(`/questions/${event.id}`)}
                      className="bg-yellow ml-3 text-white py-2 px-4 rounded-md hover:bg-yellow"
                    >
                      Manipular Perguntas
                    </button>
                    <button
                      onClick={() => handleStartEvent(event.id)}
                      className="bg-green text-white py-2 px-4 ml-3 rounded-md hover:bg-green"
                      disabled={!canAddEvent || event.isActive}
                    >
                      Iniciar evento
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="text-center mt-6">
            <h2 className="text-xl font-semibold">Acessar Evento</h2>
            <form onSubmit={handleSubmitCode} className="flex flex-col items-center space-y-4">
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                placeholder="Insira o código ou URL do evento"
                className="px-4 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Acessar Evento
              </button>
            </form>

            <h3 className="mt-6 mb-4">Ou, escaneie o QR Code</h3>
            <div className="w-full max-w-xs mx-auto mb-6">
              <video ref={videoRef} width="100%" height="auto" />
            </div>
      </div>
    </>
  )
}

export default MainPage
