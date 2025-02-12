'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Cookies from 'universal-cookie'
import { toast, ToastContainer } from 'react-toastify'

// Define interfaces for event and question data
interface Answer {
  answer: string;
  votes: number;
  isCorrect: boolean;
}

interface Question {
  question: string;
  type: string;
  answers: Answer[];
}

interface Event {
  eventName: string;
  description: string;
  photo: string;
}

const EventStatistics: React.FC = () => {
  const cookies = useMemo(() => new Cookies(), [])
  const [event, setEvent] = useState<Event | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])  // Array of questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [isAnswerVisible, setIsAnswerVisible] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true) // Loading state
  const { id: eventId } = useParams()
  const router = useRouter()

  // Use useCallback to memoize functions to avoid unnecessary re-renders
  const fetchEventDetails = useCallback(async () => {
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
  }, [eventId, cookies])

  const fetchQuestionsAndAnswers = useCallback(async () => {
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
        setQuestions(data.questions || []) // Ensure it's an array
      } else {
        toast.error('Erro ao carregar perguntas e respostas.')
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas e respostas:', error)
      toast.error('Erro ao carregar perguntas e respostas.')
    } finally {
      setIsLoading(false) // Set loading to false once data is fetched
    }
  }, [eventId, cookies])

  // Run the fetch functions when eventId changes
  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
      fetchQuestionsAndAnswers()
    }
  }, [eventId, fetchEventDetails, fetchQuestionsAndAnswers]) // Add functions as dependencies

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
    router.push('/main-page') // Redirect to the main page
  }

  const calculatePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0
    return ((votes / totalVotes) * 100).toFixed(2)
  }

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-2 relative">
        <button
          onClick={handleGoBack}
          className="sm:absolute top-4 right-4 bg-gray-600 text-white py-2 px-4 rounded-md"
        >
          Voltar
        </button>

        {isLoading ? (
          <div className="text-center">
            <p className="text-2xl">Carregando...</p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">{event?.eventName || 'Carregando...'}</h1>
              <p className="text-xl">{event?.description}</p>
              {event?.photo && <img src={`http://localhost:8000${event.photo}`} alt="Foto do Evento" className="h-auto rounded-md mb-4" />}
            </div>

            {Array.isArray(questions) && questions.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <h2 className="text-2xl">{questions[currentQuestionIndex]?.question}</h2>

                  <div className="mt-4">
                    {questions[currentQuestionIndex]?.type === 'open_short' || questions[currentQuestionIndex]?.type === 'open_long' ? (
                      <div>
                        <p className="text-lg">Respostas abertas:</p>
                        {questions[currentQuestionIndex]?.answers.map((openAnswer: Answer, idx: number) => (
                          <div key={idx} className="mt-2">
                            <p>{openAnswer.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      questions[currentQuestionIndex]?.answers.map((answer: Answer, idx: number) => {
                        const totalVotes = questions[currentQuestionIndex]?.answers.reduce(
                          (sum: number, item: Answer) => sum + item.votes, 0
                        )
                        const percentage = calculatePercentage(answer.votes, totalVotes)

                        return (
                          <div
                            key={idx}
                            className={`answer-option p-4 my-2 rounded-md ${isAnswerVisible && answer.isCorrect ? 'bg-green lg:w-1/3 text-white' : 'bg-white'}`}
                          >
                            <p>
                              {answer.answer} - Votos: {answer.votes} 
                              {isAnswerVisible && (
                                <span> - {percentage}%</span>
                              )}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {!(
                    questions[currentQuestionIndex]?.type === 'open_short' ||
                    questions[currentQuestionIndex]?.type === 'open_long'
                  ) && (
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
                  )}
                </div>

                <div className="flex space-x-4 sm:flex justify-between mt-6">
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
