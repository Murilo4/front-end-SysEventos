'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
interface AnswerOption {
  id: number;
  text: string;
}
interface Answer {
  id: number;
  answer: string;
}
interface Question {
  question: string;
  type: string;
  options: AnswerOption[];
  photo: string;
  questionId: number;
}

interface AnswerData {
  userId: string;
  answer: string;
  answerIds?: number[]; // Optional for multiple choice or single choice
}

interface EventData {
  eventName: string;
  description: string;
  photo: string;
  // Add any other properties you expect
}

interface UserData {
  id: string;
  name: string;
  // Add other properties that represent user data
}
const EventoPage = () => {
  const router = useRouter();
  const { id: eventId } = useParams();
  const { userId } = useParams();
  const userIdString = Array.isArray(userId) ? userId[0] : userId || ''; // Fallback to an empty string
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const [eventActive, setEventActive] = useState(true);  // Para armazenar se o evento está ativo

  const questionTypeTranslation: { [key: string]: string } = {
    open_short: 'Resposta curta',
    open_long: 'Resposta longa',
    multiple_choice: 'Múltiplas escolhas',
    single_choice: 'Escolha única',
  };

  // Função para verificar se o evento está ativo
  const checkEventActive = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${apiUrl}/get-event-active/${eventId}/`);
      const data = await response.json();
      console.log('Status do evento:', data.event.isActive);
      setEventActive(data.event.isActive);
    } catch (error) {
      setEventActive(false);
      console.error('Erro ao verificar o evento ativo:', error);
    }
  }, [eventId]);

  // Efeito para verificar o status do evento a cada 60 segundos
  useEffect(() => {
    if (eventId) {
      checkEventActive();
  
      const intervalId = setInterval(() => {
        checkEventActive();
      }, 60000);
  
      return () => clearInterval(intervalId);
    }
  }, [eventId, checkEventActive]);

  useEffect(() => {
    // Não redireciona até o evento ser verificado
    if (eventActive === false) {
      router.push(`/event/invitation/${eventId}`);
    }
  }, [eventActive, eventId, router]);

  // Função para carregar os dados do evento
  const fetchEventData = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${apiUrl}/get-event-user/${eventId}/`);
      const data = await response.json();
      if (response.ok) {
        setEventData(data.event);
        console.log("eventdata", data);
      } else {
        toast.error('Erro ao carregar dados do evento.');
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do evento.');
      console.error(error);
    }
  }, [eventId]);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${apiUrl}/get-user-data/${userId}/${eventId}/`);
      const data = await response.json();
      if (response.ok) {
        setUserData(data.data);
        console.log("userdata", data);
      } else {
        toast.error('Usuário não encontrado. Redirecionando para a página de validação.');
        router.push(`/validate-user-info/${eventId}`);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do usuário.');
      console.error(error);
    }
  }, [eventId, userId, router]);

  const fetchQuestion = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${apiUrl}/get-question-event/${eventId}/`);
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        const questionData = data.question[0];
        const question = {
          question: questionData.question,
          type: questionData.questionType,
          options: questionData.answers.map((answer: Answer) => ({
            id: answer.id,  // Captura o ID da resposta
            text: answer.answer,  // Texto da resposta
          })),
          photo: questionData.photo,
          questionId: questionData.id,
        };
        setCurrentQuestion(question);
        console.log("Pergunta carregada:", question);
      } else {
        toast.error('Erro ao carregar pergunta.');
      }
    } catch (error) {
      toast.error('Erro ao carregar pergunta.');
      console.error(error);
    }
  }, [eventId]);

  const sendAnswer = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
    let answerData: AnswerData = {
      userId: userIdString,
      answer: userAnswer, // Always include 'answer'
    };
  
    if (currentQuestion?.type === 'multiple_choice') {
      const selectedAnswerIds = userAnswer.split(',').map((answer) => answer.trim());
  
      answerData = {
        userId: userIdString,
        answer: userAnswer,
        answerIds: selectedAnswerIds
          .map((answerText) =>
            currentQuestion.options.find((option: AnswerOption) => option.text === answerText)?.id
          )
          .filter((id): id is number => id !== undefined), // Ensure the array is only numbers
      };
    } else if (currentQuestion?.type === 'single_choice') {
      answerData = {
        userId: userIdString,
        answer: userAnswer,
        answerIds: [
          currentQuestion.options.find((option: AnswerOption) => option.text === userAnswer)?.id,
        ].filter((id): id is number => id !== undefined),
      };
    }
  
    try {
      const response = await fetch(`${apiUrl}/send-answer/${eventId}/${currentQuestion?.questionId}/${userId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast.success('Resposta enviada com sucesso!');
        checkNextQuestion();
      } else {
        toast.error(data.message || 'Erro ao enviar a resposta.');
      }
    } catch (error) {
      toast.error('Erro ao enviar a resposta.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleMultipleChoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const option = e.target.value;
  
    setUserAnswer((prev) => {
      const currentAnswers = prev.split(',').map((answer) => answer.trim()).filter(Boolean);  // Limpa valores vazios
  
      if (e.target.checked) {
        // Se a opção foi marcada, adiciona ela à lista
        return [...currentAnswers, option].join(',');
      } else {
        // Se a opção foi desmarcada, remove ela da lista
        return currentAnswers.filter((answer) => answer !== option).join(',');
      }
    });
  };

  const checkNextQuestion = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    try {
      const questionId = currentQuestion?.questionId; // Verifica se a pergunta atual existe
      if (!questionId) {
        toast.error('Não foi possível determinar a pergunta atual.');
        return;
      }
  
      const response = await fetch(`${apiUrl}/validate-next-question/${eventId}/${questionId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        if (data.has_next) {
          // A próxima pergunta está disponível, mas precisamos verificar se está liberada para o usuário
          if (data.next_question_available) {
            // A próxima pergunta foi liberada, podemos carregá-la
            const questionResponse = await fetch(`${apiUrl}/get-question-event/${eventId}/`);
            const questionData = await questionResponse.json();
  
            if (questionResponse.ok && questionData?.question?.length > 0) {
              const question = {
                question: questionData.question[0].question,
                type: questionData.question[0].questionType,
                options: questionData.question[0].answers.map((answer: Answer) => ({
                  id: answer.id,  // Captura o ID da resposta
                  text: answer.answer,  // Texto da resposta
                })),
                photo: questionData.question[0].photo,
                questionId: questionData.question[0].id,
              };
              setCurrentQuestion(question);  // Define a próxima pergunta
              setUserAnswer('');  // Reseta a resposta do usuário
              setLoading(false);  // Habilita novamente o botão de envio
            } else {
              toast.error('Erro ao carregar a próxima pergunta.');
            }
          } else {
            // A próxima pergunta ainda não está disponível, mantém o botão desabilitado
            setLoading(true); // Mantém o estado de "loading" até que a pergunta esteja disponível
            toast.info('A próxima pergunta ainda não está disponível. Verificando novamente em breve.');
  
            // Continua verificando a disponibilidade da próxima pergunta
            setTimeout(() => {
              checkNextQuestion();
            }, 5000); // Verifica novamente após 5 segundos
          }
        } else {
          // Não há próxima pergunta, o evento está finalizado
          router.push(`/finalizado-evento/${eventId}/${userId}`);
        }
      } else {
        toast.error('Erro ao verificar nova pergunta.');
      }
    } catch (error) {
      toast.error('Erro ao verificar nova pergunta.');
      console.error(error);
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    sendAnswer();
  };

  useEffect(() => {
    if (eventId && userId) {
      fetchEventData();
      fetchUserData();
      fetchQuestion();
    }
  }, [eventId, userId, fetchEventData, fetchQuestion, fetchUserData]); // Simplified dependencies

  const renderQuestionForm = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'open_short':
        return (
          <div className="mb-6 flex items-center space-x-4">
            {currentQuestion.photo && (
              <img
                src={`http://localhost:8000${currentQuestion.photo}`}
                alt="Imagem da pergunta"
                className="h-24 w-24 object-cover rounded-md"
              />
            )}
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              maxLength={100}
              placeholder="Digite sua resposta curta"
              className="w-full border border-gray-400 rounded-2xl p-3 text-sm"
            />
            <div className="text-right text-sm text-gray-500">
              {userAnswer.length}/100
            </div>
          </div>
        );
      case 'open_long':
        return (
          <div className="mb-6 flex items-center space-x-4">
            {currentQuestion.photo && (
              <img
                src={`http://localhost:8000${currentQuestion.photo}`}
                alt="Imagem da pergunta"
                className="h-24 w-24 object-cover rounded-md"
              />
            )}
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              maxLength={250}
              placeholder="Digite sua resposta longa"
              className="w-full border border-gray-400 rounded-2xl p-3 text-sm h-32"
            />
            <div className="text-right text-sm text-gray-500">
              {userAnswer.length}/250
            </div>
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="mb-6 space-y-3 flex items-start">
            <div className="space-y-2">
            {currentQuestion.options?.map((option: { id: number, text: string }, index: number) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={option.text}  // Garantindo que o valor é o texto da resposta
                    checked={userAnswer.split(',').includes(option.text)}  // Marca a opção com base no texto
                    onChange={handleMultipleChoiceChange}
                    className="h-5 w-5"
                  />
                  <span>{option.text}</span>  {/* Aqui estamos acessando a propriedade 'text' para exibir a resposta */}
                </label>
              ))}
            </div>
            {currentQuestion.photo && (
              <img
                src={`http://localhost:8000${currentQuestion.photo}`}
                alt="Imagem da pergunta"
                className="h-36 w-36 object-cover rounded-md ml-8"
              />
            )}
          </div>
        );
      case 'single_choice':
        return (
          <div className="mb-6 space-y-3 flex items-start">
            {currentQuestion.photo && (
              <img
                src={`http://localhost:8000${currentQuestion.photo}`}
                alt="Imagem da pergunta"
                className="h-24 w-24 object-cover rounded-md mr-4"
              />
            )}
            <div className="space-y-2">
            {currentQuestion.options?.map((option: { id: number, text: string }, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="singleChoice"
                  value={option.text}  // Garantindo que o valor é o texto da resposta
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="h-5 w-5"
                />
                <span>{option.text}</span>  {/* Aqui também estamos acessando a propriedade 'text' para exibir a resposta */}
              </label>
            ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {eventData && (
        <div className="flex items-center space-x-4 mb-6">
          <img src={`http://localhost:8000${eventData.photo}`} alt={eventData.eventName} className="h-16 w-16 object-cover rounded-full" />
          <h1 className="text-3xl font-bold">{eventData.eventName}</h1>
        </div>
      )}
      {userData && <p className="text-xl mb-4 text-black">Olá, {userData.name}!</p>}

      {currentQuestion && (
        <form onSubmit={handleSubmitAnswer} className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">{questionTypeTranslation[currentQuestion.type]}</h3>
          <p className="mb-4 text-black">{currentQuestion.question}</p>
          
          {renderQuestionForm()}

          <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue text-white font-semibold py-2 rounded-xl hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Aguarde... Carregando próxima pergunta' : 'Enviar Resposta'}
            </button>
        </form>
      )}
    </div>
  );
};

export default EventoPage;
