import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const parceiroSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(120, "Máximo 120 caracteres"),
  cpf_cnpj: z
    .string()
    .trim()
    .min(11, "CPF/CNPJ inválido")
    .max(20, "CPF/CNPJ inválido"),
  area_atuacao: z
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().trim().max(20, "Máximo 20 caracteres").optional().or(z.literal("")),
  logradouro: z.string().trim().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
  numero: z.string().trim().max(20, "Máximo 20 caracteres").optional().or(z.literal("")),
  complemento: z.string().trim().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  bairro: z.string().trim().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  cidade: z.string().trim().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  estado: z.string().trim().max(2, "Use sigla do estado").optional().or(z.literal("")),
  cep: z.string().trim().max(10, "CEP inválido").optional().or(z.literal("")),
});

export type ParceiroFormValues = z.infer<typeof parceiroSchema>;

export function FormularioParceiro({
  defaultValues,
  onSubmit,
  submitLabel = "Salvar",
  loading = false,
}: {
  defaultValues?: Partial<ParceiroFormValues>;
  onSubmit: (values: ParceiroFormValues) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParceiroFormValues>({
    resolver: zodResolver(parceiroSchema),
    defaultValues: {
      nome: "",
      cpf_cnpj: "",
      area_atuacao: "",
      email: "",
      telefone: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      ...defaultValues,
    },
  });

  const handleFormSubmit = (values: ParceiroFormValues) => {
    const endereco_completo = {
      logradouro: values.logradouro?.trim() || undefined,
      numero: values.numero?.trim() || undefined,
      complemento: values.complemento?.trim() || undefined,
      bairro: values.bairro?.trim() || undefined,
      cidade: values.cidade?.trim() || undefined,
      estado: values.estado?.trim() || undefined,
      cep: values.cep?.trim() || undefined,
    };

    const hasEndereco = Object.values(endereco_completo).some(v => v);

    onSubmit({
      nome: values.nome,
      cpf_cnpj: values.cpf_cnpj,
      area_atuacao: values.area_atuacao?.trim() || undefined,
      email: values.email?.trim() || undefined,
      telefone: values.telefone?.trim() || undefined,
      endereco_completo: hasEndereco ? endereco_completo : undefined,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid gap-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" placeholder="Ex.: Maria Silva" {...register("nome")} />
        {errors.nome && <p className="text-destructive text-sm">{errors.nome.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
        <Input id="cpf_cnpj" placeholder="Somente números" {...register("cpf_cnpj")} />
        {errors.cpf_cnpj && (
          <p className="text-destructive text-sm">{errors.cpf_cnpj.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="area_atuacao">Área de Atuação</Label>
        <Input id="area_atuacao" placeholder="Ex.: Jurídico" {...register("area_atuacao")} />
        {errors.area_atuacao && (
          <p className="text-destructive text-sm">{errors.area_atuacao.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="contato@exemplo.com" {...register("email")} />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input id="telefone" placeholder="(00) 00000-0000" {...register("telefone")} />
        {errors.telefone && <p className="text-destructive text-sm">{errors.telefone.message}</p>}
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium mb-3">Endereço</h3>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input id="logradouro" placeholder="Rua, Av, etc" {...register("logradouro")} />
            {errors.logradouro && <p className="text-destructive text-sm">{errors.logradouro.message}</p>}
          </div>
          <div>
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" placeholder="123" {...register("numero")} />
            {errors.numero && <p className="text-destructive text-sm">{errors.numero.message}</p>}
          </div>
        </div>

        <div className="grid gap-2 mt-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input id="complemento" placeholder="Apto, Sala, etc" {...register("complemento")} />
          {errors.complemento && <p className="text-destructive text-sm">{errors.complemento.message}</p>}
        </div>

        <div className="grid gap-2 mt-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input id="bairro" placeholder="Nome do bairro" {...register("bairro")} />
          {errors.bairro && <p className="text-destructive text-sm">{errors.bairro.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="col-span-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" placeholder="Nome da cidade" {...register("cidade")} />
            {errors.cidade && <p className="text-destructive text-sm">{errors.cidade.message}</p>}
          </div>
          <div>
            <Label htmlFor="estado">UF</Label>
            <Input id="estado" placeholder="SP" maxLength={2} {...register("estado")} />
            {errors.estado && <p className="text-destructive text-sm">{errors.estado.message}</p>}
          </div>
        </div>

        <div className="grid gap-2 mt-2">
          <Label htmlFor="cep">CEP</Label>
          <Input id="cep" placeholder="00000-000" {...register("cep")} />
          {errors.cep && <p className="text-destructive text-sm">{errors.cep.message}</p>}
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2 sticky bottom-0 bg-background">
        <Button type="submit" disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
