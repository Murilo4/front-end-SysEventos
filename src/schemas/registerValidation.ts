import * as z from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  confirmEmail: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF deve ter no mínimo 11 caracteres"),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve ter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve ter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "Senha deve ter pelo menos um caractere especial"),
  confirmPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Os emails não coincidem",
  path: ["confirmEmail"],
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default registerSchema
