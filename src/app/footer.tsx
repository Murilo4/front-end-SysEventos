'use client';

import React, { useState } from "react";

export const Footer = () => {
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  // Funções para abrir e fechar as modais
  const openModal1 = () => setIsModalOpen1(true);
  const closeModal1 = () => setIsModalOpen1(false);

  const openModal2 = () => setIsModalOpen2(true);
  const closeModal2 = () => setIsModalOpen2(false);

  return (
    <section className="flex flex-col items-center justify-center bg-white-secundary space-y-4">
  {/* Seção de Quem Somos e Contato */}
  <div className="w-full flex justify-end pr-80 mt-10">
    <p className="text-center font-medium">Quem somos <br /> Contatos:</p>
  </div>
  {/* Botões das Modais */}
  <div className="w-full flex justify-end pr-64 space-x-4">
    <div className="max-w-310px">
      <button onClick={openModal1} className="rounded-xl py-4 bg-blue-500 text-white">
        <img src="/logos/instagram.png" alt="Abrir Modal" className="w-14 h-14 rounded-xl" />
      </button>
    </div>
    <div className="max-w-310px">
      <button onClick={openModal2} className="rounded-xl px-4 mt-1 bg-blue-500 text-white">
        <img src="/logos/facebook.png" alt="Abrir Modal" className="w-20 h-20" />
      </button>
    </div>
  </div>

  {/* Modais */}
  {isModalOpen1 && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-464px h-420px shadow-lg z-60 overflow-y-auto">
        <h2 className="text-xl mb-4 text-black font-serif">Instagram</h2>
        <div className="flex flex-col space-y-3">
                <button className="relative rounded-xl px-6 py-4 bg-blue-500 text-white flex items-center space-x-4">
                <img src="/logos/instagram.png" alt="Instagram" className="w-14 h-14 rounded-lg" />
                <span className="text-black font-serif text-xl">
                <a
                    href="https://www.instagram.com/comtur_franca/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:underline"
                    >
                    Comtur
                    </a>
                </span>
                </button>
                
                <button className="relative rounded-xl px-6 py-4 bg-blue-500 text-white flex items-center space-x-4">
                <img src="/logos/instagram.png" alt="Instagram" className="w-14 h-14 rounded-lg" />
                <span className="text-black font-serif text-xl">
                <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:underline"
                    >
                    SysForms
                    </a>
                </span>
                </button>
                
                <button className="relative rounded-xl px-6 py-4 bg-blue-500 text-white flex items-center space-x-4">
                <img src="/logos/instagram.png" alt="Instagram" className="w-14 h-14 rounded-lg" />
                <span className="text-black font-serif text-xl">
                <a
                    href="https://www.instagram.com/polotifranca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:underline"
                    >
                    Polo Francano De T.I
                    </a>
                </span>
                </button>
            </div>
        <div className="mt-4 text-right">
          <button onClick={closeModal1} className="px-4 text-black hover:text-black font-serif text-xl">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )}

  {isModalOpen2 && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg z-60 overflow-y-auto">
        <h2 className="text-xl mb-4 text-black font-serif">Facebook</h2>
        <div className="flex flex-col space-y-3">
            <button className="relative rounded-xl px-6 py-4 bg-blue-500 text-white flex items-center space-x-4">
            <img src="/logos/facebook.png" alt="Instagram" className="w-16 h-16 rounded-lg" />
            <span className="text-black">
            <a
                href="https://www.facebook.com/comturfranca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline font-serif text-xl"
                >
                Comtur
                </a>
            </span>
            </button>
            
            <button className="relative rounded-xl px-6 py-4 bg-blue-500 text-white flex items-center space-x-4">
            <img src="/logos/facebook.png" alt="Instagram" className="w-16 h-16 rounded-lg" />
            <span className="text-black font-serif text-xl">
            <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline"
                >
                SysForms
                </a>
            </span>
            </button>
            
            <button className="relative rounded-xl px-6 py-4 bg-blue-500 text-white flex items-center space-x-4">
            <img src="/logos/facebook.png" alt="Instagram" className="w-16 h-16 rounded-lg" />
            <span className="text-black">
            <a
                href="https://www.facebook.com/PoloFrancanoTecnologia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline font-serif text-xl" 
                >
                Polo Francano De T.I
                </a>
            </span>
            </button>
        </div>
        <div className="mt-5 text-right">
          <button onClick={closeModal2} className="px-5 py-2 text-black hover:text-black font-serif text-xl">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Rodapé */}
  <div>
    <p className="text-black">2024 Todos os direitos reservados</p>
    <div className="flex justify-center mt-5">
      <a href="/termos-de-uso" target="_blank" className="hover:underline mr-7">
        Termos de uso
      </a>
      <a href="/politica-de-privacidade" target="_blank" className="hover:underline">
        Politicas de cookies
      </a>
    </div>
  </div>
</section>
  );
};