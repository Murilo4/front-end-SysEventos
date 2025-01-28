export type FormCreateEvent = {
    eventName: string,
    data: string,
    horarioIni: string,
    horarioFinal: string,
    photo: File  | null,
    description: string,
  }
  
  export type FormCreateEventErrors = {
      eventName: string[],
      data: string[],
      horarioIni: string[],
      horarioFinal: string[],
      photo: string[],
      description: string[],
  }
  
   export type InputName = keyof FormCreateEvent