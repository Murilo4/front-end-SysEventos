'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'

interface Option {
    id: number;
    text: string;
}

interface Question {
    question_id: number;
    question_text: string;
    question_type: string;
    options: Option[];
    events: { id: string }[]; // Update events to be an array of objects with id
}

interface Event {
    id: string;
    eventName: string;
    data: string;
    isActive: boolean;
    horarioInicio: string;
    horarioFinal: string;
    description: string;
    photo: string;
    qrCode: string;
    participantes: string;
    existFilter: boolean;
}

const questionTypeTranslation: { [key: string]: string } = {
    open_short: 'Resposta curta',
    open_long: 'Resposta longa',
    multiple_choice: 'Múltiplas escolhas',
    single_choice: 'Escolha única',
}

const SearchQuestionsPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([])
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [filter, setFilter] = useState<{ user: boolean; others: boolean }>({ user: true, others: true })
    const [events, setEvents] = useState<Event[]>([])
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
    const [selectedEvents, setSelectedEvents] = useState<string[]>([])
    const [includeOptions, setIncludeOptions] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const cookies = useMemo(() => new Cookies(), [])
    const router = useRouter()

    const fetchQuestions = useCallback(async (filterType: string) => {
        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/get-questions-user/${filterType}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cookies.get('access')}`,
                },
            })
            const data = await response.json()
            if (response.ok && data.success) {
                setQuestions(data.data.questions)
                setFilteredQuestions(data.data.questions)
            } else {
                toast.error('Erro ao carregar perguntas')
            }
        } catch (error) {
            console.error('Erro na requisição:', error)
            toast.error('Erro ao carregar perguntas. Tente novamente mais tarde.')
        }
        setLoading(false)
    }, [cookies])

    const fetchEvents = useCallback(async () => {
        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/get-all-events/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cookies.get('access')}`,
                },
            })
            const data = await response.json()
            if (response.ok && data.success) {
                setEvents(data.events)
            } else {
                toast.error('Erro ao carregar eventos')
            }
        } catch (error) {
            console.error('Erro na requisição:', error)
            toast.error('Erro ao carregar eventos. Tente novamente mais tarde.')
        }
        setLoading(false)
    }, [cookies])

    useEffect(() => {
        fetchQuestions('all')
        fetchEvents()
    }, [fetchQuestions, fetchEvents])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        const filtered = questions.filter(question =>
            question.question_text.toLowerCase().includes(e.target.value.toLowerCase())
        )
        setFilteredQuestions(filtered)
    }

    const handleFilterChange = (filterType: 'user' | 'others') => {
        const newFilter = { ...filter, [filterType]: !filter[filterType] }
        setFilter(newFilter)

        if (newFilter.user && newFilter.others) {
            fetchQuestions('all')
        } else if (newFilter.user) {
            fetchQuestions('user')
        } else if (newFilter.others) {
            fetchQuestions('others')
        } else {
            setFilteredQuestions([])
        }
    }

    const handleAddQuestionToEvent = (question: Question) => {
        setSelectedQuestion(question)
    }

    const handleEventSelection = (eventId: string) => {
        setSelectedEvents(prevSelectedEvents =>
            prevSelectedEvents.includes(eventId)
                ? prevSelectedEvents.filter(id => id !== eventId)
                : [...prevSelectedEvents, eventId]
        )
    }

    const handleAddToSelectedEvents = async () => {
        if (!selectedQuestion) return

        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/add-question-to-events/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cookies.get('access')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questionId: selectedQuestion.question_id,
                    eventIds: selectedEvents,
                    includeOptions,
                }),
            })
            const data = await response.json()
            if (response.ok) {
                toast.success('Pergunta adicionada aos eventos com sucesso!')
                setSelectedQuestion(null)
                setSelectedEvents([])
                setIncludeOptions(false)
            } else {
                toast.error(data.message || 'Erro ao adicionar pergunta aos eventos.')
            }
        } catch (error) {
            console.error('Erro ao adicionar pergunta aos eventos:', error)
            toast.error('Erro ao adicionar pergunta aos eventos. Tente novamente mais tarde.')
        }
        setLoading(false)
    }

    const canAddQuestionToAnyEvent = (question: Question) => {
        return events.some(event => !question.events.some(e => e.id === event.id))
    }

    return (
        <>
            <ToastContainer />
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                </div>
            )}
            <div className="container mx-auto p-6">
                <button
                    onClick={() => router.back()}
                    className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300 mb-4"
                >
                    Voltar
                </button>
                <div className="flex flex-col items-center mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="border p-2 rounded-md w-full max-w-md"
                        placeholder="Digite para pesquisar..."
                    />
                </div>
                <div className="flex">
                    <div className="w-1/4 p-4">
                        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
                        <div className="mb-4">
                            <label className="block mb-2">Filtrar por:</label>
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={filter.user}
                                    onChange={() => handleFilterChange('user')}
                                    className="mr-2"
                                />
                                <label>Minhas Perguntas</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filter.others}
                                    onChange={() => handleFilterChange('others')}
                                    className="mr-2"
                                />
                                <label>Perguntas de Outros Usuários</label>
                            </div>
                        </div>
                    </div>
                    <div className="w-3/4 p-4">
                        <h2 className="text-xl font-semibold mb-4">Perguntas</h2>
                        {filteredQuestions.length === 0 ? (
                            <p className="text-center">Nenhuma pergunta encontrada.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredQuestions.map((question) => (
                                    <div key={question.question_id} className="border p-4 rounded-md shadow-md flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">{question.question_text}</h3>
                                            <p className="text-sm mb-2"><strong>Tipo:</strong> {questionTypeTranslation[question.question_type]}</p>
                                            {question.options.length > 0 && (
                                                <ul className="list-disc list-inside mb-2">
                                                    {question.options.map((option) => (
                                                        <li key={option.id}>{option.text}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAddQuestionToEvent(question)}
                                            className={`py-2 px-4 rounded-md transition duration-300 w-full mt-auto ${canAddQuestionToAnyEvent(question) ? 'bg-blue text-white hover:bg-blue-600' : 'bg-gray-400 text-white cursor-not-allowed'}`}
                                            disabled={!canAddQuestionToAnyEvent(question)}
                                        >
                                            {canAddQuestionToAnyEvent(question) ? 'Adicionar ao Evento' : 'Já possui em todos os eventos'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedQuestion && (
                    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                            <h3 className="text-xl font-semibold text-center mb-4">
                                Selecionar Eventos
                            </h3>
                            <div className="mb-4">
                                {events
                                    .filter(event => !selectedQuestion.events.some(e => e.id === event.id)) // Exclude events that already use the question
                                    .map((event) => (
                                        <div key={event.id} className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedEvents.includes(event.id)}
                                                onChange={() => handleEventSelection(event.id)}
                                                className="mr-2"
                                            />
                                            <label>{event.eventName}</label>
                                        </div>
                                    ))}
                            </div>
                            {selectedQuestion.question_type !== 'open_short' && selectedQuestion.question_type !== 'open_long' && (
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={includeOptions}
                                            onChange={() => setIncludeOptions(!includeOptions)}
                                            className="mr-2"
                                        />
                                        Incluir opções de resposta
                                    </label>
                                </div>
                            )}
                            <div className="flex justify-around">
                                <button
                                    onClick={handleAddToSelectedEvents}
                                    className="bg-green text-white py-2 px-6 rounded-md hover:bg-green-600 transition duration-300"
                                >
                                    Adicionar
                                </button>
                                <button
                                    onClick={() => setSelectedQuestion(null)}
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

export default SearchQuestionsPage
