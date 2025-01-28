import React, { useEffect, useState } from 'react';

interface Hotel {
  nome: string;
  descricao: string;
  preco: string;
}

interface HotelsProps {
  city: string;
}

const Hotels: React.FC<HotelsProps> = ({ city }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    // Simulando a chamada de API ou busca de dados
    const fetchHotels = async () => {
      const data = await fetch(`/api/hoteis?city=${city}`);
      const json = await data.json();
      setHotels(json);
    };

    fetchHotels();
  }, [city]);

  if (!hotels.length) {
    return <div className="text-center">Nenhum hotel encontrado para esta cidade.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg text-gray-700">Conheça os principais Hotéis</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
        {hotels.map((item, index) => (
          <div key={index} className="border rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <div className="p-4">
              <h3 className="font-semibold text-lg">{item.nome}</h3>
              <p className="text-sm text-gray-600">{item.descricao}</p>
              <p className="text-sm text-gray-600">Preço: {item.preco}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;