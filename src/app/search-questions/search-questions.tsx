'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'
import debounce from 'lodash.debounce'

interface Option {
    id: number;
    text: string;
    isCorrect: boolean;
}

interface Question {
    question_id: number;
    question_text: string;
    question_type: string;
    options: Option[];
    events: { id: string }[];
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
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('')

    const [filter, setFilter] = useState<{ user: boolean; others: boolean }>({ user: true, others: true })
    const [tempFilter, setTempFilter] = useState<{ user: boolean; others: boolean }>({ user: true, others: true })

    const [questionTypes, setQuestionTypes] = useState<{ [key: string]: boolean }>({
        open_short: true,
        open_long: true,
        multiple_choice: true,
        single_choice: true,
    })
    const [tempQuestionTypes, setTempQuestionTypes] = useState<{ [key: string]: boolean }>({
        open_short: true,
        open_long: true,
        multiple_choice: true,
        single_choice: true,
    })

    const [events, setEvents] = useState<Event[]>([])
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
    const [selectedEvents, setSelectedEvents] = useState<string[]>([])
    const [includeOptions, setIncludeOptions] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [hasNext, setHasNext] = useState<boolean>(false)
    const [hasBack, setHasBack] = useState<boolean>(false)
    const [totalPages, setTotalPages] = useState<number>(1)
    const questionsPerPage = 12
    const cookies = useMemo(() => new Cookies(), [])
    const router = useRouter()

    const fetchQuestions = useCallback(async (filterType: string, page: number = 1, search: string = '', types: string[] = []) => {
        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
            const typesQuery = types.length > 0 ? `&types=${types.join(',')}` : ''
            const response = await fetch(`${apiUrl}/get-questions-user/${filterType}/?page=${page}&search=${search}${typesQuery}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cookies.get('access')}`,
                },
            })
            const data = await response.json()
            if (response.ok && data.success) {
                setFilteredQuestions(data.data.questions)
                setHasNext(data.data.hasNext)
                setHasBack(data.data.hasBack)
                setTotalPages(data.data.totalPages)
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
        const initialTypes = Object.keys(questionTypes).filter(type => questionTypes[type])
        fetchQuestions('all', 1, '', initialTypes)
        fetchEvents()
    }, [fetchQuestions, fetchEvents, questionTypes])

    const debouncedFetchQuestions = useMemo(() => debounce(fetchQuestions, 1200), [fetchQuestions])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        const selectedTypes = Object.keys(questionTypes).filter(type => questionTypes[type])
        debouncedFetchQuestions(filter.user && filter.others ? 'all' : filter.user ? 'user' : 'others', 1, e.target.value, selectedTypes)
        setCurrentPage(1)
    }

    const handleTempFilterChange = (filterType: 'user' | 'others') => {
        const newFilter = { ...tempFilter, [filterType]: !tempFilter[filterType] }
        setTempFilter(newFilter)
    }

    const handleTempQuestionTypeChange = (type: string) => {
        const newQuestionTypes = { ...tempQuestionTypes, [type]: !tempQuestionTypes[type] }
        setTempQuestionTypes(newQuestionTypes)
    }

    const applyFilters = () => {
        setFilter(tempFilter)
        setQuestionTypes(tempQuestionTypes)

        const selectedTypes = Object.keys(tempQuestionTypes).filter(type => tempQuestionTypes[type])
        if (tempFilter.user && tempFilter.others) {
            fetchQuestions('all', 1, searchTerm, selectedTypes)
        } else if (tempFilter.user) {
            fetchQuestions('user', 1, searchTerm, selectedTypes)
        } else if (tempFilter.others) {
            fetchQuestions('others', 1, searchTerm, selectedTypes)
        } else {
            setFilteredQuestions([])
        }
        setCurrentPage(1)
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

    const renderOptions = (question: Question) => {
        if (question.question_type === 'multiple_choice' || question.question_type === 'single_choice') {
            const allCorrect = question.options.every(option => option.isCorrect)
            const allIncorrect = question.options.every(option => !option.isCorrect)
            return (
                <ul className="list-disc list-inside mb-2">
                    {question.options.map((option) => (
                        <li key={option.id} className={allCorrect || allIncorrect ? 'text-gray-600' : option.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {option.text} {allCorrect || allIncorrect ? '(Sem opção correta)' : option.isCorrect ? '(Correta)' : '(Errada)'}
                        </li>
                    ))}
                </ul>
            )
        }
        return null
    }

    const filteredQuestionsToShow = filteredQuestions.filter(question => {
        const isAddedToAllEvents = !canAddQuestionToAnyEvent(question)
        return filter.user || !isAddedToAllEvents
    })

    const indexOfLastQuestion = currentPage * questionsPerPage
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage
    const currentQuestions = filteredQuestionsToShow.slice(indexOfFirstQuestion, indexOfLastQuestion)

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        const selectedTypes = Object.keys(questionTypes).filter(type => questionTypes[type])
        fetchQuestions(filter.user && filter.others ? 'all' : filter.user ? 'user' : 'others', pageNumber, searchTerm, selectedTypes)
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
                                    checked={tempFilter.user}
                                    onChange={() => handleTempFilterChange('user')}
                                    className="mr-2"
                                />
                                <label>Minhas Perguntas</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={tempFilter.others}
                                    onChange={() => handleTempFilterChange('others')}
                                    className="mr-2"
                                />
                                <label>Perguntas de Outros Usuários</label>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Tipo de Pergunta:</label>
                            {Object.keys(questionTypeTranslation).map((type) => (
                                <div key={type} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={tempQuestionTypes[type]}
                                        onChange={() => handleTempQuestionTypeChange(type)}
                                        className="mr-2"
                                    />
                                    <label>{questionTypeTranslation[type]}</label>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={applyFilters}
                            className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                    <div className="w-3/4 p-4">
                        <h2 className="text-xl font-semibold mb-4">Perguntas</h2>
                        {currentQuestions.length === 0 ? (
                            <p className="text-center">Nenhuma pergunta encontrada.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentQuestions.map((question) => (
                                    <div key={question.question_id} className="border p-4 rounded-md shadow-md flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">{question.question_text}</h3>
                                            <p className="text-sm mb-2"><strong>Tipo:</strong> {questionTypeTranslation[question.question_type]}</p>
                                            {renderOptions(question)}
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
                        <div className="flex justify-center mt-4">
                            <nav>
                                <ul className="flex list-none">
                                    <li className="mx-1">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            className={`py-2 px-4 rounded-md ${hasBack ? 'bg-blue text-white' : 'bg-gray-200 text-gray-700 cursor-not-allowed'}`}
                                            disabled={!hasBack}
                                        >
                                            Anterior
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <li key={index} className="mx-1">
                                            <button
                                                onClick={() => paginate(index + 1)}
                                                className={`py-2 px-4 rounded-md ${currentPage === index + 1 ? 'bg-blue text-white' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className="mx-1">
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            className={`py-2 px-4 rounded-md ${hasNext ? 'bg-blue text-white' : 'bg-gray-200 text-gray-700 cursor-not-allowed'}`}
                                            disabled={!hasNext}
                                        >
                                            Próxima
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
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
