import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const documentoSchema = z.object({
  tipoDocumentoId: z
    .number()
    .positive("Selecione o tipo de documento"),
  arquivo: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Arquivo vazio")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "Arquivo deve ter no máximo 10MB"
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Apenas PDF, JPG, PNG, DOC ou DOCX são permitidos"
    )
});

export const documentosArraySchema = z
  .array(documentoSchema)
  .optional();

export type DocumentoFormValues = z.infer<typeof documentoSchema>;
export type DocumentosArrayFormValues = z.infer<typeof documentosArraySchema>;
