export type FormCreateEvent = {
  eventName: string,
  data: string,
  horarioIni: string,
  horarioFinal: string,
  photo: string,
  participants: string,
  description: string,
}

export type FormCreateEventErrors = {
    eventName: string[],
    data: string[],
    horarioIni: string[],
    horarioFinal: string[],
    photo: string[],
    participants: string[],
    description: string[],
}

 export type InputName = keyof FormCreateEvent