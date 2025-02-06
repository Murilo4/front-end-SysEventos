import React, { useEffect, useState } from 'react';

interface Historia {
  info: string;
  imagens: string[];
}

interface HistoryProps {
  city: string;
}

const History: React.FC<HistoryProps> = ({ city }) => {
  const [history, setHistory] = useState<Historia[]>([]);

  useEffect(() => {
    // Simulando a chamada de API ou busca de dados
    const fetchHistory = async () => {
      const data = await fetch(`/api/historia?city=${city}`);
      const json = await data.json();
      setHistory(json);
    };

    fetchHistory();
  }, [city]);

  if (!history.length) {
    return <div className="text-center">Nenhuma história encontrada para esta cidade.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg text-gray-700">História da cidade</h2>
      <div className="space-y-2">
        {history.map((item, index) => (
          <div key={index} className="border rounded-lg p-4">
            <p>{item.info}</p>
            <div className="flex space-x-2">
              {item.imagens.map((image, i) => (
                <img key={i} src={image} alt={`Imagem histórica ${i + 1}`} className="w-20 h-20 object-cover rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;