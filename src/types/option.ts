export type Option = {
    label: string; // Nome da opção
    value: string; // Valor associado à opção
    link?: string; // Link opcional associado à opção
  }
  
  // Tipagem para a função que abre o menu e manipula a opção selecionada
  export type OpenMobileMenuOptionType = (option: Option) => void;
  export type CloseMobileMenuOptionType = (option: Option) => void;