import { z } from 'zod';

export const servicoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome do serviço é obrigatório")
    .max(200, "Nome muito longo"),
  desconto: z
    .number()
    .min(0, "Desconto não pode ser negativo")
    .max(100, "Desconto máximo é 100%")
    .default(0)
});

export const servicosArraySchema = z
  .array(servicoSchema)
  .min(1, "Adicione pelo menos um serviço");

export type ServicoFormValues = z.infer<typeof servicoSchema>;
export type ServicosArrayFormValues = z.infer<typeof servicosArraySchema>;
