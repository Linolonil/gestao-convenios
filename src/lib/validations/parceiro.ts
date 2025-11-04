import { z } from 'zod';

// Validadores de CPF e CNPJ
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cpfOnlyNumbersRegex = /^\d{11}$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const cnpjOnlyNumbersRegex = /^\d{14}$/;
const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

// Schema base com campos comuns
const parceiroBaseSchema = z.object({
  emailContato: z
    .string()
    .trim()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .max(255, "Email muito longo"),
  telefoneContato: z
    .string()
    .trim()
    .min(1, "Telefone é obrigatório")
    .regex(telefoneRegex, "Telefone inválido - use formato (00) 00000-0000")
    .max(20, "Telefone muito longo"),
  enderecoComercial: z
    .string()
    .trim()
    .min(1, "Endereço é obrigatório")
    .max(500, "Endereço muito longo")
});

// Schema para Pessoa Jurídica
const pessoaJuridicaSchema = parceiroBaseSchema.extend({
  tipoPessoa: z.literal('juridica'),
  cnpj: z
    .string()
    .trim()
    .min(1, "CNPJ é obrigatório")
    .refine(
      (val) => cnpjRegex.test(val) || cnpjOnlyNumbersRegex.test(val),
      "CNPJ inválido - use formato 00.000.000/0000-00 ou 14 dígitos"
    ),
  razaoSocial: z
    .string()
    .trim()
    .max(200, "Razão social muito longa")
    .optional(),
  nomeFantasia: z
    .string()
    .trim()
    .min(1, "Nome fantasia é obrigatório")
    .max(200, "Nome fantasia muito longo"),
  responsavel: z
    .string()
    .trim()
    .max(200, "Nome do responsável muito longo")
    .optional()
});

// Schema para Pessoa Física
const pessoaFisicaSchema = parceiroBaseSchema.extend({
  tipoPessoa: z.literal('fisica'),
  cpf: z
    .string()
    .trim()
    .min(1, "CPF é obrigatório")
    .refine(
      (val) => cpfRegex.test(val) || cpfOnlyNumbersRegex.test(val),
      "CPF inválido - use formato 000.000.000-00 ou 11 dígitos"
    ),
  nomeFantasia: z
    .string()
    .trim()
    .min(1, "Nome completo é obrigatório")
    .max(200, "Nome muito longo"),
  dataNascimento: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 18 && age <= 120;
    }, "Data de nascimento inválida - pessoa deve ter entre 18 e 120 anos")
});

// Schema discriminado por tipo de pessoa
export const parceiroDadosSchema = z.discriminatedUnion('tipoPessoa', [
  pessoaJuridicaSchema,
  pessoaFisicaSchema
]);

export type ParceiroDadosFormValues = z.infer<typeof parceiroDadosSchema>;
