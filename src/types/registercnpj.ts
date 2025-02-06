export type FormRegisterCNPJValues = {
    username: string
    email: string
    confirmEmail: string
    password: string
    confirmPassword: string
    cnpj: string
    phone: string
  }

  export type FormRegisterCNPJErrors = {
    username: string[]
    email: string[]
    confirmEmail: string[]
    password: string[]
    confirmPassword: string[]
    cnpj: string[]
    phone: string[]
  }

    export type InputName = keyof FormRegisterCNPJValues