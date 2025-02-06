export type FormRegisterValues = {
    username: string
    email: string
    confirmEmail: string
    password: string
    confirmPassword: string
    cpf: string
    phone: string
  }
  
  export type FormRegisterErrors = {
    username: string[]
    email: string[]
    confirmEmail: string[]
    password: string[]
    confirmPassword: string[]
    cpf: string[]
    phone: string[]
  }

  export type InputName = keyof FormRegisterValues