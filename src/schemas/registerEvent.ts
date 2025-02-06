import * as z from "zod";

export const EventSchema = z.object({
  eventName: z.string().min(3, "Nome do evento é obrigatório").min(1, "Nome do evento não pode ser vazio"),
  data: z.string()
    .min(1, "Data é obrigatória")  // Garante que o campo não seja vazio
    .transform((val) => new Date(val))  // Converte a string para Date
    .refine((date) => !isNaN(date.getTime()), {
      message: "Data inválida",
    }),
  description: z.string()
    .min(3, "A descrição precisa ter ao menos 3 caracteres")
    .max(70, "Você passou do limite de caracteres")
    .min(1, "Descrição não pode ser vazia"),
});

export default EventSchema;