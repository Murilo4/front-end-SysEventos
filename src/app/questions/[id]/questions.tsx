'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'

interface Question {
  id: string // Identificador da pergunta
  question: string // Texto da pergunta
  questionType: string // Tipo da pergunta (open_short, open_long, multiple_choice, single_choice)
  answers?: { id: string, answer: string, isCorrect: boolean }[] // Para perguntas fechadas, opções com o campo is_correct
}

interface Option {
  id: string;
  answer: string;
  isCorrect: boolean;
  saved?: boolean;  // Adiciona a propriedade 'saved' como opcional
}

const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]) // Lista de perguntas
  const [loader, setLoader] = useState<boolean>(false)
  const [newQuestion, setNewQuestion] = useState<string>('') // Pergunta nova
  const [questionType, setQuestionType] = useState<string>('open_short') // Tipo da pergunta
  const [options, setOptions] = useState<Option[]>([]); // Agora 'options' é um array de 'Option'
  const [newOption, setNewOption] = useState<string>('') // Nova opção de resposta
  const [isCorrect, setIsCorrect] = useState<boolean>(false) // Marcar a opção como correta
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null) // Pergunta em edição
  const [eventDetails, setEventDetails] = useState<any>(null) // Detalhes do evento
  const router = useRouter()
  const cookies = new Cookies()

  const { id: eventId } = useParams()
  const questionTypeTranslation: { [key: string]: string } = {
    open_short: 'Resposta curta',
    open_long: 'Resposta longa',
    multiple_choice: 'Múltiplas escolhas',
    single_choice: 'Escolha única',
  };

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
      }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      router.push('/')
    }
  }

  useEffect(() => {
    validateToken()
    if (eventId) {
      fetchQuestions()
      fetchEventDetails() // Obter detalhes do evento
    }
  }, [eventId])

  const fetchQuestions = async () => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/get-questions/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
        },
      })
      const data = await response.json()
      if (response.ok && Array.isArray(data.data)) {
        const questionsData = data.data.map((item: any) => ({
          ...item,
          answers: item.answers.map((answer: any) => ({
            id: answer.id,
            answer: answer.answer,
            isCorrect: answer.isCorrect,
          })),
        }))
        setQuestions(questionsData)
      } else {
        toast.error('Erro ao carregar perguntas')
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      toast.error('Erro ao carregar perguntas. Tente novamente mais tarde.')
    }
    setLoader(false)
  }

  const fetchEventDetails = async () => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/get-event/${eventId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setEventDetails(data.event) // Definir detalhes do evento
      } else {
        toast.error('Erro ao carregar detalhes do evento')
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do evento:', error)
      toast.error('Erro ao carregar detalhes do evento. Tente novamente mais tarde.')
    }
    setLoader(false)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setNewQuestion(question.question)
    setOptions(question.answers || [])
    setQuestionType(question.questionType)
  }

  const handleSaveQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.warning('Por favor, insira uma pergunta.')
      return
    }

    // Se estamos editando uma pergunta existente
    if (editingQuestion) {
      const updatedQuestion: Question = {
        ...editingQuestion,
        question: newQuestion,
        questionType,
        answers: options,
      }

      // Passo 1: Atualizar a pergunta
      await updateQuestion(updatedQuestion)

      // Passo 2: Atualizar as opções separadamente
      await updateOptions(updatedQuestion.id)
    } else {
      // Se estamos criando uma nova pergunta
      const newQuestionData: Question = {
        id: Date.now().toString(), // Gerar um id temporário
        question: newQuestion,
        questionType,
        answers: options,
      }
      await createQuestion(newQuestionData)
    }

    // Após salvar, desmarcar a checkbox de "correto" e limpar as opções
    setIsCorrect(false)  // Desmarcar a opção "correta"
    setNewOption('')     // Limpar o campo de nova opção
    setOptions([])       // Limpar as opções
  }

  const updateQuestion = async (updatedQuestion: Question) => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/update-question/${eventId}/${updatedQuestion.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestion),
      })

      if (response.ok) {
        toast.success('Pergunta atualizada com sucesso!')
        setEditingQuestion(null) // Limpar o estado de edição
      } else {
        toast.error('Erro ao atualizar pergunta.')
      }
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error)
      toast.error('Erro ao atualizar pergunta. Tente novamente mais tarde.')
    }
    setLoader(false)
  }

  const updateOptions = async (questionId: string) => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const updatedAnswers = options.map((option) => ({
        id: option.id, // ID da opção
        answer: option.answer,
        isCorrect: option.isCorrect,
      }))

      // Enviar a atualização das opções
      const response = await fetch(`${apiUrl}/update-answers/${eventId}/${questionId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: updatedAnswers }),
      })

      if (response.ok) {
        toast.success('Opções atualizadas com sucesso!')
        fetchQuestions() // Atualizar a lista de perguntas e opções
      } else {
        toast.error('Erro ao atualizar opções.')
      }
    } catch (error) {
      console.error('Erro ao atualizar opções:', error)
      toast.error('Erro ao atualizar opções. Tente novamente mais tarde.')
    }
    setLoader(false)
  }

  const createQuestion = async (newQuestionData: Question) => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/create-question/${eventId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestionData),
      })

      if (response.ok) {
        toast.success('Pergunta criada com sucesso!')
        fetchQuestions() // Atualizar a lista de perguntas
        setNewQuestion('') // Limpar o campo de nova pergunta
        setOptions([]) // Limpar as opções
      } else {
        toast.error('Erro ao criar pergunta.')
      }
    } catch (error) {
      console.error('Erro ao criar pergunta:', error)
      toast.error('Erro ao criar pergunta. Tente novamente mais tarde.')
    }
    setLoader(false)
  }

  const handleDeleteOption = async (optionId: string) => {
    setLoader(true);
  
    // Verificar se a opção foi salva no banco de dados
    const optionToDelete = options.find(option => option.id === optionId);
  
    // Se o ID for igual ao do banco de dados, é uma opção salva, e devemos chamar a API para remover
    if (optionToDelete && optionToDelete.id !== "temp") {
      if (editingQuestion) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/delete-answer/${eventId}/${optionId}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${cookies.get('access')}`,
            },
          });
  
          if (response.ok) {
            setOptions(options.filter(option => option.id !== optionId)); // Remover opção da lista
            toast.success('Opção excluída com sucesso!');
          } else {
            toast.error('Erro ao excluir opção.');
          }
        } catch (error) {
          console.error('Erro ao excluir opção:', error);
          toast.error('Erro ao excluir opção. Tente novamente mais tarde.');
        }
      }
    } else {
      // Se a opção não tem ID persistente (gerado com Date.now()), removemos apenas localmente
      setOptions(options.filter(option => option.id !== optionId));
    }
  
    setLoader(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setLoader(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/delete-question/${eventId}/${questionId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
        },
      })

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId)) // Atualizar a lista
        toast.success('Pergunta excluída com sucesso!')
      } else {
        toast.error('Erro ao excluir pergunta.')
      }
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error)
      toast.error('Erro ao excluir pergunta. Tente novamente mais tarde.')
    }
    setLoader(false)
  }

  const handleAddOption = () => {
    if (newOption.trim()) {
      // Verificar se a pergunta é de "Escolha única"
      if (questionType === 'single_choice') {
        // Desabilitar a marcação de correta se já houver uma opção correta
        if (options.some(option => option.isCorrect)) {
          setOptions(prevOptions => [
            ...prevOptions,
            { id: Date.now().toString(), answer: newOption, isCorrect: false } // A nova opção sempre não será correta
          ]);
        } else {
          setOptions(prevOptions => [
            ...prevOptions,
            { id: Date.now().toString(), answer: newOption, isCorrect } // Mantém o valor de `isCorrect`
          ]);
        }
      } else {
        // Para outras perguntas (como múltiplas escolhas), permite que a opção seja adicionada normalmente
        setOptions(prevOptions => [
          ...prevOptions,
          { id: Date.now().toString(), answer: newOption, isCorrect }
        ]);
      }
      
      // Remover a opção localmente das opções a serem adicionadas
      // Presumo que você tem uma lista de "opções a serem adicionadas", talvez algo como "availableOptions"
      setNewOption(''); // Limpar o campo de nova opção
    } else {
      toast.warning('Por favor, insira uma opção válida.');
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-6 relative">
        {/* Exibição dos dados do evento */}
        {eventDetails && (
          <div className="bg-gray-100 p-3 rounded-md shadow-md w-1/4">
            <h3 className="text-xl font-semibold">Detalhes do Evento</h3>
            <p><strong>Nome do Evento:</strong> {eventDetails.eventName}</p>
            <p><strong>Data:</strong> {eventDetails.data}</p>
            {eventDetails.photo ? (
              <img src={`http://localhost:8000${eventDetails.photo}`} alt="Foto do Evento" className="w-2/4 rounded-md" />
            ) : (
              <p>Foto do evento não disponível</p>
            )}
          </div>
        )}

        <div className="absolute top-4 right-4 flex space-x-4 sm:flex-col sm:space-x-0 sm:space-y-2 z-10">
          <button
            onClick={() => router.push('/main-page')}
            className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue"
          >
            Voltar
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">Manipulação de Perguntas</h1>

        <div className="mb-6 text-center">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Digite uma nova pergunta"
            className="border p-2 rounded-md w-2/3"
          />

          {/* Seleção do tipo de pergunta */}
          <div className="mt-4">
            <label className="mr-4">Tipo de Pergunta:</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="border p-2 rounded-md"
            >
              <option value="open_short">Resposta curta</option>
              <option value="open_long">Resposta longa</option>
              <option value="multiple_choice">Múltiplas escolhas</option>
              <option value="single_choice">Escolha única</option>
            </select>
          </div>

          {/* Campos para opções (para perguntas fechadas) */}
          {(questionType === 'multiple_choice' || questionType === 'single_choice') && (
            <div className="mt-4">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Adicionar uma opção"
                className="border p-2 rounded-md w-2/3"
              />
              <button
                onClick={handleAddOption}
                className="bg-blue text-white py-2 px-4 rounded-md ml-4"
              >
                Adicionar Opção
              </button>
              <div className="mt-4">
                <label className="mr-4">Marcar a opção como correta:</label>
                <input
                  type="checkbox"
                  checked={isCorrect}
                  onChange={() => {
                    if (questionType === 'multiple_choice' || !options.some(option => option.isCorrect)) {
                      setIsCorrect(!isCorrect); // Alterna a opção correta, permitindo múltiplas escolhas ou sem opções corretas
                    }
                  }}
                  disabled={questionType === 'single_choice' && options.some(option => option.isCorrect)} // Bloquear em "Escolha Única" se já houver uma opção correta
                />
              </div>
            </div>
          )}

          {/* Mostrar lista de opções com botão de "remover" */}
          {options.length > 0 && (
            <div className="mt-4">
              <ul>
                {options.map((option, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <span>{option.answer} ({option.isCorrect ? 'Correta' : 'Errada'})</span>
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="ml-2 text-red-600"
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Salvar ou editar a pergunta */}
          <button
            onClick={handleSaveQuestion}
            className="bg-blue text-white py-2 px-4 rounded-md mt-4"
          >
            {editingQuestion ? 'Salvar Pergunta' : 'Adicionar Pergunta'}
          </button>
        </div>

        {loader ? (
          <p>Carregando perguntas...</p>
        ) : questions.length === 0 ? (
          <p className="text-center">Nenhuma pergunta encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((question, index) => (
              <div key={question.id || index} className="border p-4 rounded-md shadow-md">
                <p><strong>Tipo da pergunta:</strong>  {questionTypeTranslation[question.questionType] || 'Tipo desconhecido'}</p>
                <p className="text-xl"><strong>Pergunta:</strong> {question.question}</p>
                {question.questionType === 'multiple_choice' || question.questionType === 'single_choice' ? (
                  <ul>
                    {question.answers?.map((option, idx) => (
                      <li key={idx}>
                        {option.answer} {option.isCorrect ? '(Correta)' : '(Errada)'}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="flex justify-center w-full mt-4">
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="bg-yellow text-white py-2 px-4 rounded-md hover:bg-yellow mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="bg-red text-white py-2 px-4 rounded-md hover:bg-red"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default QuestionsPage
