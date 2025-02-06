'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';

interface EventData {
  eventName: string;
  description: string;
  photo: string;
  // Add any other properties you expect
}
interface Question {
  answer_text: string;
  question_type: string;
  question_text: string;
  options: { id: number; text: string }[];  // Define the options type more strictly
  photo: string;
  questionId: number;
  user_answers: { answer_text: string }[];  // Define user_answers type
}
const AgradecimentoPage = () => {
  const { eventId, userId } = useParams();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]); // Inicializa com array vazio

  // Função para carregar dados do evento e perguntas/respostas do usuário
  const fetchEventAndQuestions = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    try {
      const eventResponse = await fetch(`${apiUrl}/get-event-user/${eventId}/`);
      const eventData = await eventResponse.json();
      setEventData(eventData.event);

      const questionsResponse = await fetch(`${apiUrl}/get-event-questions/${eventId}/${userId}/`);
      const questionsData = await questionsResponse.json();
      if (questionsData.data && Array.isArray(questionsData.data.questions)) {
        console.log(questionsData)
        setQuestions(questionsData.data.questions);
      } else {
        setQuestions([]);
        console.error('A resposta da API não tem a propriedade "questions" ou está em formato inválido');
      }
    } catch (error) {
      toast.error('Erro ao carregar os dados do evento ou respostas.');
      console.error(error);
    }
  }, [eventId, userId]);

  useEffect(() => {
    if (eventId && userId) {
      fetchEventAndQuestions();
    }
  }, [eventId, userId, fetchEventAndQuestions]);

  // Função para renderizar as perguntas e as respostas do usuário
  const renderQuestionAnswer = (question: Question) => {
    const userAnswers = question.user_answers; // Respostas do usuário
  
    switch (question.question_type) {
      case 'open_short':
      case 'open_long':
        // Perguntas abertas (mostrar apenas o texto da resposta)
        return <p className="text-lg italic text-gray-700">{userAnswers?.[0]?.answer_text}</p>;
  
      case 'multiple_choice':
        // Perguntas de múltipla escolha (mostrar as opções selecionadas)
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={userAnswers?.some(
                    (answer) => answer.answer_text === option.text // Verificando se o texto da resposta coincide com o texto da opção
                  )}
                  disabled
                  className="mr-2"
                />
                <span className="text-gray-700">{option.text}</span> {/* Exibindo o texto da opção */}
              </div>
            ))}
          </div>
        );
  
      case 'single_choice':
        // Perguntas de escolha única (mostrar a opção selecionada)
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  checked={userAnswers?.some(
                    (answer) => answer.answer_text === option.text // Comparando texto de resposta
                  )}
                  disabled
                  className="mr-2"
                />
                <span className="text-gray-700">{option.text}</span> {/* Exibindo o texto da opção */}
              </div>
            ))}
          </div>
        );
  
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg max-w-3xl mt-10">
      {eventData && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center text-indigo-600">{eventData.eventName}</h1>
          {eventData.description && <p className="text-lg text-gray-600 mt-2 text-center">{eventData.description}</p>}
          {eventData.photo && <img src={`http://localhost:8000${eventData.photo}`} alt="Foto do evento" className="h-40 w-40 object-cover mx-auto mt-4 rounded-full border-4 border-indigo-200" />}
        </div>
      )}

      <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-4">Agradecemos por participar!</h2>
      <p className="mb-4 text-lg text-center text-gray-700">Você completou todas as perguntas. Aqui estão suas respostas:</p>

      {Array.isArray(questions) && questions.length === 0 ? (
        <p className="text-center text-gray-500">Não há perguntas disponíveis para este evento.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((question: Question, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{question.question_text}</h3>
              {question.photo && (
                <img
                  src={`http://localhost:8000${question.photo}`}
                  alt="Imagem da pergunta"
                  className="h-24 w-24 object-cover rounded-md mt-4 mb-4 mx-auto"
                />
              )}
              <div className="mt-2">
                <p className="font-bold text-gray-800">Sua resposta:</p>
                {renderQuestionAnswer(question)} {/* Renderiza a resposta diretamente */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgradecimentoPage;
