'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'  // Adicionando useRouter
import Cookies from 'universal-cookie'
import { toast, ToastContainer } from 'react-toastify'

const EventStatistics: React.FC = () => {
  const [event, setEvent] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])  // Inicializado com um array vazio
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [isAnswerVisible, setIsAnswerVisible] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true) // Estado de carregamento
  const cookies = new Cookies()
  const { id: eventId } = useParams()
  const router = useRouter() // Hook do Next.js para navegação

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
      fetchQuestionsAndAnswers()
    }
  }, [eventId])

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
      } else {
        toast.error('Erro ao carregar o evento.')
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do evento:', error)
      toast.error('Erro ao carregar detalhes do evento.')
    }
  }

  const fetchQuestionsAndAnswers = async () => {
    const token = cookies.get('access')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/get-event-stats/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setQuestions(data.questions || []) // Garantindo que seja um array
      } else {
        toast.error('Erro ao carregar perguntas e respostas.')
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas e respostas:', error)
      toast.error('Erro ao carregar perguntas e respostas.')
    } finally {
      setIsLoading(false) // Marca o carregamento como concluído
    }
  }

  // Funções de navegação entre as perguntas
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleGoToFirstQuestion = () => {
    setCurrentQuestionIndex(0)
  }

  const handleToggleAnswerVisibility = () => {
    setIsAnswerVisible(!isAnswerVisible)
  }

  const handleGoBack = () => {
    router.push('/main-page')  // Redireciona para a página principal
  }

  return (
    <>
      <ToastContainer />
      <div className="relative container mx-auto p-6">
        {/* Botão de Voltar no canto superior direito */}
        <button
          onClick={handleGoBack}
          className="absolute top-4 right-4 bg-gray-600 text-white py-2 px-4 rounded-md"
        >
          Voltar
        </button>

        {/* Exibe um texto de carregamento enquanto os dados estão sendo carregados */}
        {isLoading ? (
          <div className="text-center">
            <p className="text-2xl">Carregando...</p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">{event?.event_name || 'Carregando...'}</h1>
              <p className="text-xl">{event?.description}</p>
              {event?.photo && <img src={`http://localhost:8000${event.photo}`} alt="Foto do Evento" className="h-auto rounded-md mb-4" />}
            </div>

            {/* Exibe uma pergunta por vez */}
            {Array.isArray(questions) && questions.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <h2 className="text-2xl">{questions[currentQuestionIndex]?.question}</h2>

                  <div className="mt-4">
                    {/* Verifica se a pergunta é do tipo 'open_short' ou 'open_long' */}
                    {questions[currentQuestionIndex]?.type === 'open_short' || questions[currentQuestionIndex]?.type === 'open_long' ? (
                      <div>
                        <p className="text-lg">Respostas abertas:</p>
                        {questions[currentQuestionIndex]?.answers?.map((openAnswer: any, idx: number) => (
                          <div key={idx} className="mt-2">
                            <p>{openAnswer.answerText}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Caso contrário, pergunta fechada
                      questions[currentQuestionIndex]?.answers && questions[currentQuestionIndex]?.answers.length > 0 ? (
                        questions[currentQuestionIndex]?.answers.map((answer: any, idx: number) => (
                          <div key={idx}>
                            <p className="text-lg">
                              {answer.answer} - Votos: {answer.votes}
                              {/* Exibe a opção correta, se disponível */}
                              {answer.isCorrect && (
                                <span className="ml-2 text-green-500">(Correta)</span>
                              )}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-lg">Nenhuma resposta encontrada.</p>
                      )
                    )}
                  </div>

                  {/* Botão para mostrar ou ocultar as respostas corretas */}
                  <div className="mt-4">
                    {isAnswerVisible && (
                      <button
                        onClick={handleToggleAnswerVisibility}
                        className="bg-orange-500 text-white py-2 px-4 rounded-md"
                      >
                        Ocultar Respostas Corretas
                      </button>
                    )}
                    {!isAnswerVisible && (
                      <button
                        onClick={handleToggleAnswerVisibility}
                        className="bg-blue text-white py-2 px-4 rounded-md"
                      >
                        Mostrar Respostas Corretas
                      </button>
                    )}
                  </div>
                </div>

                {/* Botões de navegação entre as perguntas */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePrevQuestion}
                    className="bg-gray text-white py-2 px-4 rounded-md"
                    disabled={currentQuestionIndex === 0}
                  >
                    Pergunta Anterior
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="bg-blue text-white py-2 px-4 rounded-md"
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Próxima Pergunta
                  </button>

                  <button
                    onClick={handleGoToFirstQuestion}
                    className="bg-green text-white py-2 px-4 rounded-md"
                  >
                    Voltar para a Primeira
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default EventStatistics
