'use client'

export const Footer = () => {

  return (
    <section className="flex flex-col justify-center bg-white-secundary space-y-4">
  {/* Seção de Quem Somos e Contato */}
  <div className="w-full flex justify-around sm:justify-center sm:pr-80 sm:mt-10">
    <p className="text-center font-medium">Quem somos <br /> Contatos:</p>
  </div>
  {/* Botões das Modais */}
  <div className="w-full flex justify-around sm:justify-center sm:pr-64 space-x-4">
    <div className="max-w-310px">
      <button className="rounded-xl py-4 bg-blue-500 text-white">
        <img src="/logos/instagram.png" alt="Abrir Modal" className="w-14 h-14 rounded-xl" />
      </button>
    </div>
    <div className="max-w-310px">
      <button className="rounded-xl px-4 mt-1 bg-blue-500 text-white">
        <img src="/logos/facebook.png" alt="Abrir Modal" className="w-20 h-20" />
      </button>
    </div>
  </div>


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