import { NavItemProps } from '@/types/navItem'

export const loginItems: NavItemProps[] = [
    {
      title: 'Minha conta',
      links: [
        {
          name: 'Alterar meus dados',
          link: '/meu-perfil',
        },
      ],
    },
    {
      title: 'Logar',
      links: [
        {
          name: 'Fazer Login',
          link: '/login',
        },
        {
          name: 'Registrar',
          link: '/registro',
        },
      ],
    },
  ]