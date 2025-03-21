'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import { useParams, useRouter } from 'next/navigation'

interface Answer {
  id: string;
  answer: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question: string;
  questionType: string;
  options?: string[]; // Add options property
  answers?: Answer[]; // Add answers property
}

interface Event {
  eventName: string;
  description: string;
  horarioIni: string;
  horarioFinal: string;
  participants: string;
  photo: string;
  isActive: boolean;
  filter: string;
}

const ControlEvento: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isEventActive, setIsEventActive] = useState<boolean>(false)
  const [registrationCount, setRegistrationCount] = useState<number>(0)
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false)
  const { id: eventId } = useParams()
  const imageUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const [isEventStarted, setIsEventStarted] = useState(false)
  const [filterId, setFilterId] = useState<string | undefined>(localStorage.getItem('filterId') || undefined)
  const router = useRouter()

  const questionTypeTranslation: { [key: string]: string } = {
    open_short: 'Resposta curta',
    open_long: 'Resposta longa',
    multiple_choice: 'Múltiplas escolhas',
    single_choice: 'Escolha única',
  }

  const cookies = useMemo(() => new Cookies(), [])

  const fetchEventDetails = useCallback(async () => {
    const token = cookies.get('access')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/get-event/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log(data)
      if (response.ok) {
        setEvent(data.event)
        setIsEventActive(data.event.isActive)

        if (data.event.isActive) {
          setIsEventStarted(true)

          if (data.data && Array.isArray(data.data)) {

            const storedQuestionId = localStorage.getItem('currentQuestionId')
            if (storedQuestionId) {
              const storedQuestionIdString = String(storedQuestionId)
              const questionIndex = data.data.findIndex((q: Question) => String(q.id) === storedQuestionIdString)
              if (questionIndex !== -1) {
                setCurrentQuestionIndex(questionIndex)
              } else {
                setCurrentQuestionIndex(0)
              }
            } else {
              setCurrentQuestionIndex(0)
            }
          } else {
            setCurrentQuestionIndex(0)
          }
        }
      } else {
        toast.error('Erro ao carregar o evento.')
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do evento:', error)
      toast.error('Erro ao carregar detalhes do evento.')
    }
  }, [cookies, eventId])

  const fetchRegistrationCount = useCallback(async () => {
    const token = cookies.get('access')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/get-registration-count/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setRegistrationCount(data.count)
      } else {
        toast.error('Erro ao carregar número de inscrições.')
      }
    } catch (error) {
      console.error('Erro ao carregar número de inscrições:', error)
      toast.error('Erro ao carregar número de inscrições.')
    }
  }, [cookies, eventId])

  const handleGoBack = () => {
    router.push('/main-page') // Redirect to the main page
  }

  const fetchQuestionsAndAnswers = useCallback(async () => {
    setIsLoadingQuestions(true)
    const token = cookies.get('access')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/get-questions/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        console.log(data.data)
        setQuestions(data.data)
        setIsLoadingQuestions(false)

        const storedQuestionId = localStorage.getItem('currentQuestionId')
        if (storedQuestionId) {
          const storedQuestionIdString = String(storedQuestionId)
          const questionIndex = data.data.findIndex((q: Question) => String(q.id) === storedQuestionIdString)
          if (questionIndex !== -1) {
            setCurrentQuestionIndex(questionIndex)
          } else {
            setCurrentQuestionIndex(0)
          }
        } else {
          console.log(data.filter)
          setFilterId(data.filter)
          setCurrentQuestionIndex(0)
        }
      } else {
        toast.error('Erro ao carregar perguntas e respostas.')
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas e respostas:', error)
      toast.error('Erro ao carregar perguntas e respostas.')
    }
  }, [cookies, eventId])

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
      fetchQuestionsAndAnswers()
    }

    const interval = setInterval(() => {
      if (isEventActive) {
        fetchRegistrationCount()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [eventId, isEventActive, fetchEventDetails, fetchQuestionsAndAnswers, fetchRegistrationCount])


  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextQuestion = questions[currentQuestionIndex + 1]
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      localStorage.setItem('currentQuestionId', nextQuestion.id)
      sendQuestionChangeRequest(`/update-event-state/${eventId}`, nextQuestion.id)
    } else {
      setCurrentQuestionIndex(0)
      toast.info('Você voltou para a primeira pergunta.')
      sendQuestionChangeRequest(`/update-event-state/${eventId}`, questions[0].id)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevQuestion = questions[currentQuestionIndex - 1]
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      localStorage.setItem('currentQuestionId', prevQuestion.id)
      sendQuestionChangeRequest(`/update-event-state/${eventId}`, prevQuestion.id)
    } else {
      setCurrentQuestionIndex(questions.length - 1)
      toast.info('Você voltou para a última pergunta.')
      sendQuestionChangeRequest(`/update-event-state/${eventId}`, questions[questions.length - 1].id)
    }
  }

  const sendQuestionChangeRequest = async (url: string, questionId: string) => {
    const token = cookies.get('access')
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    try {
      const response = await fetch(`${apiUrl}${url}/${questionId}/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Pergunta alterada com sucesso!')
      } else {
        toast.error(data.message || 'Erro ao alterar a pergunta.')
      }
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error)
      toast.error('Erro ao enviar a requisição.')
    }
  }

  const handleStartEvent = async (url: string, questionId: string) => {
    const token = cookies.get('access')
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    try {
      const response = await fetch(`${apiUrl}${url}/${questionId}/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('evento iniciado com sucesso!')
        setFilterId(data.filterId)
        localStorage.setItem('filterId', data.filterId)
        fetchRegistrationCount() // Fetch registration count immediately after starting the event
        const interval = setInterval(fetchRegistrationCount, 10000) // Continue fetching registration count periodically
        return () => clearInterval(interval)
      } else {
        toast.error(data.message || 'Erro ao alterar a pergunta.')
      }
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error)
      toast.error('Erro ao enviar a requisição.')
    }
  }

  const handleEndEvent = async () => {
    const token = cookies.get('access')
    const storedFilterId = filterId || localStorage.getItem('filterId')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/end-event/${eventId}/${storedFilterId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Evento encerrado com sucesso!')
        localStorage.removeItem('filterId')
        localStorage.removeItem('currentQuestionId')
        router.push(`/event-statistics/${eventId}`)
      } else {
        toast.error(data.message || 'Erro ao encerrar o evento.')
      }
    } catch (error) {
      console.error('Erro ao encerrar o evento:', error)
      toast.error('Erro ao encerrar o evento.')
    }
  }

  const getQuestionTypeLabel = (questionType: string): string => {
    return questionTypeTranslation[questionType] || 'Tipo desconhecido'
  }

  const startEvent = async () => {
    setIsEventStarted(true)
    handleStartEvent(`/start-event/${eventId}`, questions[0].id)
  }

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-6">
        <button
          onClick={handleGoBack}
          className="sm:absolute top-4 right-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
        >
          Voltar
        </button>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">{event?.eventName || 'Carregando...'}</h1>
          <p className="text-lg text-gray-600">{event?.description}</p>
          {event?.photo && (
            <img
              src={`${imageUrl}${event.photo}`}
              alt="Foto do Evento"
              className="sm:w-80 max-w-2xl mx-auto rounded-lg shadow-md mt-4"
            />
          )}
        </div>

        {isEventStarted ? (
          <div className="text-center mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pergunta Atual</h2>
            {questions.length > 0 && (
              <div className="p-4 bg-gray-100 rounded-md shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <span className="font-semibold text-xl text-gray-800">
                      {questions[currentQuestionIndex]?.question}
                    </span>
                    <span className="text-xl text-gray-500">
                      ({getQuestionTypeLabel(questions[currentQuestionIndex]?.questionType)})
                    </span>
                  </div>
                </div>
                {questions[currentQuestionIndex]?.answers && (
                  <ul className="mt-4 list-disc list-inside text-left">
                    {questions[currentQuestionIndex].answers!.map((answer, index) => (
                      <li key={index} className="text-gray-700">
                        {answer.answer}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={handlePreviousQuestion}
                    className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue transition duration-300"
                  >
                    Pergunta Anterior
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="bg-green text-white py-2 px-4 rounded-md hover:bg-green transition duration-300"
                  >
                    Próxima Pergunta
                  </button>
                </div>
                <div className="mt-4 text-lg font-semibold text-gray-700">
                  {`Inscritos: ${registrationCount}`}
                </div>
                <button
                  onClick={() => setShowConfirmationModal(true)}
                  className="bg-red text-white py-2 px-6 rounded-md hover:bg-red transition duration-300 mt-4"
                >
                  Encerrar Evento
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6">
            {isLoadingQuestions ? (
              <p className="text-gray-500">Carregando perguntas...</p>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Perguntas</h2>
                <ul className="space-y-3">
                  {questions.map((question) => (
                    <li
                      key={`question-${question.id}`}
                      className="p-4 bg-gray-100 rounded-md shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex-grow">
                          <span className="font-semibold text-gray-800">{question.question}</span>
                          <span className="text-sm text-gray-500">
                            ({getQuestionTypeLabel(question.questionType)})
                          </span>
                        </div>
                      </div>
                      {question.answers && (
                        <ul className="mt-2 list-disc list-inside text-left">
                          {question.answers.map((answer, index) => (
                            <li key={index} className="text-gray-700">
                              {answer.answer}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={startEvent}
                    className="bg-green text-white py-2 px-6 rounded-md hover:bg-green transition duration-300"
                  >
                    Iniciar Evento
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {showConfirmationModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <h3 className="text-xl font-semibold text-center mb-4">
                Tem certeza que deseja encerrar o evento?
              </h3>
              <div className="flex justify-around">
                <button
                  onClick={handleEndEvent}
                  className="bg-green text-white py-2 px-6 rounded-md hover:bg-green-600 transition duration-300"
                >
                  Sim, encerrar
                </button>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="bg-red text-white py-2 px-6 rounded-md hover:bg-red-600 transition duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ControlEvento
