'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'universal-cookie'

interface Answer {
  id: string;
  answer: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question: string // Texto da pergunta
  questionType: string // Tipo da pergunta (open_short, open_long, multiple_choice, single_choice)
  photo: File
  answers: Answer[];
}

interface Option {
  id: string;
  answer: string;
  isCorrect: boolean;
  saved?: boolean;  // Adiciona a propriedade 'saved' como opcional
}
interface EventData {
  id: string;
  eventName: string;
  data: string;
  description: string;
  horarioInicio: string;
  horarioFinal: string;
  photo: string;
  qrCode: string;
  isActive: boolean;
  // Add any other properties you expect
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
  const [eventDetails, setEventDetails] = useState<EventData | null>(null) // Detalhes do evento
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cookies = useMemo(() => new Cookies(), [])
  const image_url = process.env.NEXT_PUBLIC_API_BASE_URL
  const router = useRouter()

  const { id: eventId } = useParams()
  const questionTypeTranslation: { [key: string]: string } = {
    open_short: 'Resposta curta',
    open_long: 'Resposta longa',
    multiple_choice: 'Múltiplas escolhas',
    single_choice: 'Escolha única',
  };
  const fetchQuestions = useCallback(async () => {
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
        const questionsData = data.data.map((item: Question) => ({
          ...item,
          answers: item.answers.map((answer: Answer) => ({
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
  }, [cookies, eventId])

  const fetchEventDetails = useCallback(async () => {
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
        console.log(data)
        setEventDetails(data.event) // Definir detalhes do evento
      } else {
        toast.error('Erro ao carregar detalhes do evento')
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do evento:', error)
      toast.error('Erro ao carregar detalhes do evento. Tente novamente mais tarde.')
    }
    setLoader(false)
  }, [cookies, eventId])

  // Função para validar o token do usuário
  const validateToken = useCallback(async () => {
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
  }, [cookies, router])

  useEffect(() => {
    validateToken()
    if (eventId) {
      fetchQuestions()
      fetchEventDetails() // Obter detalhes do evento
    }
  }, [eventId, fetchEventDetails, fetchQuestions, validateToken])

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setNewQuestion(question.question)
    setOptions(question.answers || [])
    setQuestionType(question.questionType)
    setQuestionImage(question.photo); // Reset image state when editing
    setPreviewURL(question.photo ? `${image_url}${question.photo}` : null); // Set preview URL if image exists
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setNewQuestion('');
    setOptions([]);
    setQuestionType('open_short');
    setQuestionImage(null);
    setPreviewURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsCorrect(false); // Reset isCorrect
  };

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
      if (questionImage) {
        await handleUpdateImage(); // Atualiza a imagem, se houver
      }
    } else {
      // Lógica de criação (USANDO FormData)
      if (!questionImage) {
        toast.warning('Por favor, selecione uma imagem.');
        return;
      }

      const formData = new FormData(); // Cria um objeto FormData
      formData.append('question', newQuestion);
      formData.append('questionType', questionType);

      const answersArray = options.map(option => ({
        answer: option.answer,
        isCorrect: option.isCorrect
      }));
      formData.append('answers', JSON.stringify(answersArray));
      formData.append('photo', questionImage); // Adiciona a imagem ao FormData

      await createQuestion(formData); // Envia o FormData
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpa o valor do input
    }
    // Após salvar, desmarcar a checkbox de "correto" e limpar as opções
    setIsCorrect(false)  // Desmarcar a opção "correta"
    setNewOption('')     // Limpar o campo de nova opção
    setOptions([])
    setQuestionImage(null)
    setPreviewURL(null)       // Limpar as opções
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file && file.type.startsWith('image/')) {
      if (file.size <= 2 * 1024 * 1024) {
        setQuestionImage(file);
        setPreviewURL(URL.createObjectURL(file));
      } else {
        toast.error('A imagem deve ter no máximo 2MB.');
      }
    } else if (file) {
      toast.error('Por favor, selecione um arquivo de imagem válido.');
    }
  };

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

  const createQuestion = async (formData: FormData) => {
    setLoader(true)
    console.log(formData.getAll('answers'));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/create-question/${eventId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast.success('Pergunta criada com sucesso!')
        setNewQuestion('') // Limpar o campo de nova pergunta
        setOptions([]) // Limpar as opções
        setQuestionImage(null)
        setPreviewURL(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Limpa o valor do input
        }
        fetchQuestions() // Atualizar a lista de perguntas apenas após a confirmação do backend
      } else {
        toast.error('Erro ao criar pergunta.')
      }
    } catch (error) {
      console.error('Erro ao criar pergunta:', error)
      toast.error('Erro ao criar pergunta. Tente novamente mais tarde.')
    }
    setLoader(false)
  }

  const handleUpdateImage = async () => {
    if (!questionImage) {
      toast.warning('Por favor, selecione uma imagem.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', questionImage);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/update-question-photo/${eventId}/${editingQuestion?.id}/`, { // Endpoint específico para a imagem
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cookies.get('access')}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Foto atualizada com sucesso!');
        fetchQuestions(); // Atualiza a lista de perguntas para exibir a nova imagem
      } else {
        toast.error('Erro ao atualizar foto.');
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      toast.error('Erro ao atualizar foto. Tente novamente mais tarde.');
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    setLoader(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

      const indexToDelete = options.findIndex(option => option.id === optionId);

      if (indexToDelete !== -1) {
        const optionToDelete = options[indexToDelete];

        // Verifica se optionToDelete.id é definido e é uma string antes de usar startsWith
        if (typeof optionToDelete.id === 'string' && optionToDelete.id.startsWith("temp")) {
          setOptions(options.filter((_, index) => index !== indexToDelete));
        } else {
          if (editingQuestion) {
            const response = await fetch(`${apiUrl}/delete-answer/${eventId}/${optionId}/`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${cookies.get('access')}`,
              },
            });

            if (response.ok) {
              setOptions(options.filter((_, index) => index !== indexToDelete));
              toast.success('Opção excluída com sucesso!');
            } else {
              toast.error('Erro ao excluir opção.');
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao excluir opção:', error);
      toast.error('Erro ao excluir opção. Tente novamente mais tarde.');
    } finally {
      setLoader(false);
    }
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
        setQuestions(questions.filter(q => q.id !== questionId))
        setEditingQuestion(null);
        setNewQuestion('');
        setOptions([]);
        setQuestionType('open_short');
        setQuestionImage(null);
        setPreviewURL(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setIsCorrect(false); // Reset isCorrect
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
      const newOptionObject = {
        id: "temp-" + Date.now().toString(), // Gera um ID único para a opção
        answer: newOption,
        isCorrect: isCorrect, // Usa o estado isCorrect para o valor inicial
      };

      if (questionType === 'single_choice') {
        // Lógica para "Escolha Única"
        if (options.some(option => option.isCorrect)) {
          // Já existe uma opção correta, então a nova opção não pode ser correta
          newOptionObject.isCorrect = false;
        } else {
          // Se não houver nenhuma opção correta, permite marcar como correta (se `isCorrect` for true)
        }
      }

      setOptions(prevOptions => [...prevOptions, newOptionObject]);
      setNewOption(''); // Limpar o campo de nova opção
      setIsCorrect(false); // Reseta o estado isCorrect após adicionar a opção
    } else {
      toast.warning('Por favor, insira uma opção válida.');
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto p-3 relative">
        {/* Exibição dos dados do evento */}
        {eventDetails && (
          <div className="w-full bg-gray-200 border border-b-gray-400 p-2 rounded-md shadow-md sm:w-1/2 sm:scale-90 sm:flex sm:flex-col">
            <h3 className="text-xl font-semibold">Detalhes do Evento</h3>
            <p><strong>Nome do Evento:</strong> {eventDetails.eventName}</p>
            <p><strong>Data:</strong> {eventDetails.data}</p>
            <p><strong>Horario:</strong> {eventDetails.horarioInicio} até as {eventDetails.horarioFinal}</p>
            {eventDetails.photo ? (
              <img src={`${image_url}${eventDetails.photo}`} alt="Foto do Evento" className="w-2/5 rounded-md h-28" />
            ) : (
              <p>Foto do evento não disponível</p>
            )}
          </div>
        )}
        <div className="relative sm:absolute sm:top-4 sm:right-1 flex space-x-4 sm:flex-col sm:space-x-0 sm:space-y-2 z-10 mt-4 sm:mt-0">
          <button
            onClick={() => router.push('/main-page')}
            className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue"
          >
            Voltar
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-3">Manipulação de Perguntas</h1>

        <div className="mb-3 text-center">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Digite uma nova pergunta"
            className="border p-2 placeholder:text-slate-700 rounded-lg w-2/3 border-slate-500 shadow-sm shadow-slate-400"
          />

          {/* Seleção do tipo de pergunta */}
          <div className="mt-2">
            <label className="mr-4 border">Tipo de Pergunta:</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="border p-2 rounded-md border-slate-400 shadow-sm shadow-slate-400"
            >
              <option value="open_short">Resposta curta</option>
              <option value="open_long">Resposta longa</option>
              <option value="multiple_choice">Múltiplas escolhas</option>
              <option value="single_choice">Escolha única</option>
            </select>
          </div>

          {/* Campos para opções (para perguntas fechadas) */}
          {(questionType === 'multiple_choice' || questionType === 'single_choice') && (
            <div className="mt-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Adicionar uma opção"
                className="border p-2 rounded-md w-2/3 border-slate-500 shadow-sm shadow-slate-400"
              />
              <button
                onClick={handleAddOption}
                className="bg-blue text-white py-2 px-4 rounded-md ml-4 shadow-sm shadow-slate-400"
              >
                Adicionar Opção
              </button>
              <div className="mt-2">
                <label className="mr-4">Marcar a opção como correta:</label>
                <input
                  type="checkbox"
                  checked={isCorrect}
                  onChange={() => {
                    if (questionType === 'multiple_choice' || !options.some(option => option.isCorrect)) {
                      setIsCorrect(!isCorrect);
                    }
                  }}
                  disabled={questionType === 'single_choice' && options.some(option => option.isCorrect)}
                />
              </div>

              {/* Mostrar lista de opções com botão de "remover" */}
              {options.length > 0 && (
                <div className="mt-2 flex justify-center"> {/* Centraliza o container */}
                  <div className="grid grid-cols-2 gap-2"> {/* Grid de 2 colunas */}
                    {options.map((option, index) => (
                      <div key={index} className="bg-blue rounded-md px-2 py-1 w-fit flex items-center"> {/* Item individual com flexbox */}
                        <span>{option.answer} ({option.isCorrect ? 'Correta' : 'Errada'})</span>
                        <button
                          onClick={() => handleDeleteOption(option.id)}
                          className="ml-2 text-red-600"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col items-center"> {/* Centraliza a imagem e os botões */}
          <label htmlFor="image-upload" className="block mb-2">Imagem da Pergunta (Max 2MB):</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="border p-2 rounded-md w-2/3 border-slate-400 shadow-sm shadow-slate-400"
          />

          <div className="flex justify-center">
            {previewURL && (
              <img src={previewURL} alt="Pré-visualização da Imagem" className="mt-2 w-72 rounded-md justify-center flex content-center" />
            )}
          </div>

          {editingQuestion && (
            <button
              onClick={handleUpdateImage}
              className="bg-blue text-white py-2 px-4 rounded-md mt-2"
              disabled={!questionImage}
            >
              Atualizar Foto
            </button>
          )}

          <div className="flex space-x-4 mt-2 mb-10"> {/* Centraliza os botões e adiciona espaçamento */}
            <button
              onClick={handleSaveQuestion}
              className="bg-blue text-white py-2 px-4 rounded-md"
            >
              {editingQuestion ? 'Salvar Pergunta' : 'Adicionar Pergunta'}
            </button>
            {editingQuestion && (
              <button
                onClick={handleCancelEdit}
                className="bg-gray-400 text-white py-2 px-4 rounded-md"
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => router.push('/search-questions')}
            className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue w-1/2 lg:w-1/3 mb-4"
          >
            Buscar Perguntas de Outros Eventos
          </button>
        </div>

        {loader ? (
          <p>Carregando perguntas...</p>
        ) : questions.length === 0 ? (
          <p className="text-center">Nenhuma pergunta encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {questions.map((question, index) => (
              <div key={question.id || index} className="border bg-slate-300 p-4 rounded-md shadow-md flex flex-row  shadow-slate-400">
                <div className="w-full mr-4">
                  <p><strong>Tipo da pergunta:</strong>  {questionTypeTranslation[question.questionType] || 'Tipo desconhecido'}</p>
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
                {question.photo && (
                  <img src={`${image_url}${question.photo}`} alt="Pergunta" className="w-20 h-28 object-fill sm:w-52 sm:max-h-48 rounded-md" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default QuestionsPage
