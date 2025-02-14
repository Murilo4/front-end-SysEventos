'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'universal-cookie';

// Extend the Window interface to include MercadoPago
declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface Plan {
  id: string;
  planName: string;
  price: number;
  description: string;
}

const PaymentPage = () => {
  const cookies = useMemo(() => new Cookies(), []);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Fetch plan details
    const fetchPlan = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/get-plan/${id}/`);
      const data = await response.json();
      setPlan(data.data);
    };

    if (id) {
      fetchPlan();
    }
  }, [id]);

  useEffect(() => {
    if (preferenceId) {
      const initializeMercadoPago = () => {
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY, {
          locale: 'pt-BR'
        });

        mp.checkout({
          preference: {
            id: preferenceId
          },
          render: {
            container: '.cho-container',
            label: 'Pagar',
          }
        });
      };

      if (window.MercadoPago) {
        initializeMercadoPago();
      } else {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = initializeMercadoPago;
        document.body.appendChild(script);
      }
    }
  }, [preferenceId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!plan) return;

    // Criar objeto de dados de pagamento
    const paymentData = {
      plan_id: plan.id,
      title: plan.planName,
      quantity: 1,
      unit_price: plan.price,
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/create_preference/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cookies.get('access')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    // Verificar se a criação da preferência foi bem-sucedida
    if (response.status === 200) {
      setPreferenceId(data.preference_id); // Armazena o preference_id
      if (data.payment_link) {
        // Redirecionar o usuário para o link de pagamento retornado
        window.location.href = data.payment_link; 
      } else {
        console.error("Erro: payment_link não encontrado na resposta.");
      }
    } else {
      console.error("Erro ao criar a preferência: ", data.message);
    }
  };

  if (!plan) {
    return <div className="text-center text-gray-600 mt-10">Carregando...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <button
        onClick={() => router.push('/meu-perfil')}
        className="flex justify-start items-start text-lg border-blue-thirth rounded-2xl py-2 px-4 bg-blue-thirth text-white font-medium mb-6"
      >
        Voltar
      </button>
      <h1 className="text-3xl font-bold text-white mb-6">Pagamento</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{plan.planName}</h2>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <p className="text-lg font-bold text-gray-800">Preço: R$ {typeof plan.price === 'number' ? plan.price.toFixed(2) : 'N/A'}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-md mx-auto mb-6">
        <button
          type="submit"
          className="bg-green text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-border transition-colors mb-4 w-full"
        >
          Gerar pagamento
        </button>
      </form>

      <div className="cho-container w-full max-w-md mx-auto"></div>
    </div>
  );
};

export default PaymentPage;
