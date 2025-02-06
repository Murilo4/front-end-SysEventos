export type FormRegisterAddressValues = {
    addressName: string
    state: string
    city: string
    street: string
    neighborhood: string
    addressType: string
    number: string
    cep: string
  }

  export type FormRegisterAddressErrors = {
    addressName: string[]
    state: string[]
    city: string[]
    street: string[]
    neighborhood: string[]
    addressType: string[]
    number: string[]
    cep: string[]
  }

    export type InputName = keyof FormRegisterAddressValues