'use client'

import React, { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import { useParams, useRouter } from 'next/navigation'

const ControlEvento: React.FC = () => {
  const [event, setEvent] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [isEventActive, setIsEventActive] = useState<boolean>(false)
  const cookies = new Cookies()
  const { id: eventId } = useParams()
  const router = useRouter()  // Hook para navegação

  useEffect(() => {
    if (eventId) {
      fetchEventDetails() // Chama a função para buscar o evento
      fetchQuestionsAndAnswers() // Chama a função para buscar perguntas e respostas
    }
  }, [eventId])

  // Função para buscar os detalhes do evento
  const fetchEventDetails = async () => {
    const token = cookies.get('access')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/get-event/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setEvent(data.event)
        setIsEventActive(data.event.isActive)  // Atualiza o estado com o status do evento
      } else {
        toast.error('Erro ao carregar o evento.')
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do evento:', error)
      toast.error('Erro ao carregar detalhes do evento.')
    }
  }

  // Função para buscar as perguntas e respostas
  const fetchQuestionsAndAnswers = async () => {
    const token = cookies.get('access')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/get-questions/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setQuestions(data.data) // Agora armazenamos as perguntas e respostas corretamente
      } else {
        toast.error('Erro ao carregar perguntas e respostas.')
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas e respostas:', error)
      toast.error('Erro ao carregar perguntas e respostas.')
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setCurrentQuestionIndex(0)  // Reinicia para a primeira pergunta
      toast.info('Você voltou para a primeira pergunta.')
    }
  }

  const handleStartEvent = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/start-event/${eventId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('Evento iniciado com sucesso!')
        setIsEventActive(true)
      } else {
        toast.error(data.message || 'Erro ao iniciar evento.')
      }
    } catch (error) {
      console.error('Erro ao iniciar evento:', error)
      toast.error('Erro ao iniciar evento.')
    }
  }

  const handleEndEvent = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/end-event/${eventId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('Evento encerrado com sucesso!')
        setIsEventActive(false)
        router.push(`/event-statistics/${eventId}`) // Redireciona para a tela de estatísticas
      } else {
        toast.error(data.message || 'Erro ao encerrar evento.')
      }
    } catch (error) {
      console.error('Erro ao encerrar evento:', error)
      toast.error('Erro ao encerrar evento.')
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">{event?.eventName || 'Carregando...'}</h1>
          <p className="text-xl">{event?.description}</p>
          {event?.photo && <img src={`http://localhost:8000${event.photo}`} alt="Foto do Evento" className="h-auto rounded-md mb-4" />}
        </div>

        <div className="text-center mb-6">
          {!isEventActive ? (
            <button
              onClick={handleStartEvent}
              className="bg-green text-white py-2 px-4 rounded-md hover:bg-green"
            >
              Iniciar Evento
            </button>
          ) : (
            <button
              onClick={handleEndEvent}
              className="bg-red text-white py-2 px-4 rounded-md hover:bg-red"
            >
              Encerrar Evento
            </button>
          )}
        </div>

        <div className="mb-6 text-center">
          {questions.length === 0 ? (
            <p>Carregando perguntas...</p>
          ) : (
            <>
              <h2 className="text-2xl mb-4">Pergunta Atual</h2>
              <div className="p-4 border rounded-md">
                <p className="text-xl">{questions[currentQuestionIndex]?.question || 'Sem pergunta disponível'}</p>
                {/* Exibe as opções de respostas, se existirem */}
                {questions[currentQuestionIndex]?.answers && questions[currentQuestionIndex]?.answers.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-lg">Escolha a resposta:</p>
                    {questions[currentQuestionIndex]?.answers.map((answer: any, index: number) => (
                      <div key={index} className="mt-2">
                        <label className="block">
                          <input
                            type="radio"
                            name="answer"
                            value={answer.id}
                            className="mr-2"
                          />
                          {answer.answer}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg mt-2"></p>
                )}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={!isEventActive}  // O botão será desabilitado até o evento ser iniciado
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Voltar para a Primeira Pergunta' : 'Próxima Pergunta'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ControlEvento
