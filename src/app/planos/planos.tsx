'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { useRouter } from 'next/navigation';

interface Plan {
    id: number;
    planName: string;
    description: string;
    price: number;
    numberEvents: number;
    imageOnQuestions: boolean;
}

interface PlansResponse {
    activePlan: number;
    availablePlans: Plan[];
}

const PlanosPage: React.FC = () => {
    const cookies = useMemo(() => new Cookies(), []);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [activePlan, setActivePlan] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        try {
            const response = await fetch(`${apiUrl}/get-all-plans/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cookies.get('access')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data: PlansResponse = await response.json();
            if (response.ok) {
                console.log(data.activePlan, data.availablePlans)
                setActivePlan(data.activePlan);
                setPlans(data.availablePlans);
            } else {
                toast.error('Erro ao carregar planos');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            toast.error('Erro ao carregar planos. Tente novamente mais tarde.');
        }
        setLoading(false);
    }, [cookies]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return (
        <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg max-w-5xl mt-10">
            {/* Botão de Voltar */}
            <button
                onClick={() => router.push('/meu-perfil')}
                className="flex items-center text-lg border-blue-thirth rounded-2xl py-2 px-4 bg-blue-thirth text-white font-medium mb-6"
            >
                Voltar
            </button>

            <h1 className="text-3xl font-bold text-center text-principal-blue mb-6">Planos Disponíveis</h1>
            {loading ? (
                <p className="text-center text-gray-500">Carregando planos...</p>
            ) : plans.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum plano disponível.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            {plan.id == activePlan && (
                                <p className="text-lg font-bold text-green mb-2">Plano Atual</p>
                            )}
                            <h2 className="text-2xl font-semibold text-gray-800">{plan.planName}</h2>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{plan.price === 0 ? 'Gratuito' : `R$ ${plan.price},00`}</p>
                            <button
                                onClick={() => router.push(`/planos/${plan.id}`)}
                                className={`bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-thirth mt-4 w-full ${plan.id == activePlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={plan.id == activePlan}
                            >
                                Assinar Plano
                            </button>
                            <hr className="my-4" />
                            <p className="text-lg text-gray-600 mt-2">{plan.description}</p>
                            <ul className="list-disc list-inside text-gray-700 mt-2">
                                <li>Disponibilidade para a criação de até <span className="font-bold text-orange-500">{plan.numberEvents}</span> eventos.</li>
                                <li>
                                    {plan.imageOnQuestions
                                        ? 'Permite adicionar fotos às perguntas criadas'
                                        : 'Sem suporte a fotos nas perguntas'}
                                </li>
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlanosPage;
