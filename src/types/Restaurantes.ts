export interface Restaurante {
  nome: string;
  estrelas: number;
  descricao: string;
  categorias: string[];
  horario: string;
  imagens: string[];
  link: string;
}

export interface Historia {
  info: string;
  imagens: string[];
}

export interface Atracao {
  nome: string;
  descricao: string;
  imagens: string[];
  link: string;
}
export interface Hoteis {
  nome: string;
  estrelas: number;
  descricao: string;
  categorias: string[];
  horario: string;
  imagens: string[];
  link: string;
}

export interface Cultura {
  nome: string;
  descricao: string;
  imagens: string[];
  link: string;
}

export interface Teatro {
  nome: string;
  descricao: string;
  imagens: string[];
  link: string;
}

export interface CidadeData {
  Restaurantes: Restaurante[];
  Hoteis: Hoteis[];
  Historia: Historia[];
  Atrações: Atracao[];
  Cultura: Cultura[];
  Teatro: Teatro[];
}