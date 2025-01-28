import React, { useEffect, useState } from 'react';

interface Restaurante {
  nome: string;
  imagens: string[];
  estrelas: number;
  descricao: string;
  horario: string;
}

interface RestaurantsProps {
  city: string;
}

const Restaurants: React.FC<RestaurantsProps> = ({ city }) => {
  const [restaurants, setRestaurants] = useState<Restaurante[]>([]);

  useEffect(() => {
    // Simulando uma chamada de API ou obtenção de dados para a cidade específica
    const fetchRestaurants = async () => {
      const data = await fetch(`/api/restaurantes?city=${city}`);
      const json = await data.json();
      setRestaurants(json);
    };

    fetchRestaurants();
  }, [city]);

  if (!restaurants.length) {
    return <div className="text-center">Nenhum restaurante encontrado para esta cidade.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg text-gray-700">Conheça os principais Restaurantes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
        {restaurants.map((item, index) => (
          <div key={index} className="border rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <div className="p-4">
              <h3 className="font-semibold text-lg">{item.nome}</h3>
              <p className="text-sm text-gray-600">{item.descricao}</p>
              <p className="text-sm text-gray-600">Horário: {item.horario}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Restaurants;