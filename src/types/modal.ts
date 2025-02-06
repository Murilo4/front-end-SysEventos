export type ModalState = {
    isOpen: boolean;  // Define se o modal está aberto ou fechado
    type: "novidades" | "registro" | 'minha-conta' | null;  // Tipo do modal (novidades, conta, etc.)
  };
  
  // Tipagem para a função que abre o modal
  export type OpenModalType = (isOpen: false, type: 'novidades' | 'registro' | null) => void;
  
  // Tipagem para a função que fecha o modal
  export type CloseModalType = () => void;