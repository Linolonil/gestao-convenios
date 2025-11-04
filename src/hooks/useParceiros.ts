import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EnderecoCompleto = {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
};

export type Parceiro = {
  id: number;
  nome: string;
  cpf_cnpj: string;
  tipo_pessoa: string | null;
  area_atuacao: string | null;
  email: string | null;
  telefone: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  responsavel: string | null;
  endereco_completo: EnderecoCompleto | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  categorias?: string[];
};

export type ParceiroInput = {
  nome: string;
  cpf_cnpj: string;
  tipo_pessoa?: string | null;
  area_atuacao?: string | null;
  email?: string | null;
  telefone?: string | null;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  responsavel?: string | null;
  endereco_completo?: EnderecoCompleto | null;
};

async function fetchParceiros() {
  const { data, error } = await supabase
    .from("parceiros")
    .select(`
      *,
      contratos (
        servicos_oferecidos (
          servicos (
            categoria
          )
        )
      )
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const mapped = (data || []).map(p => {
    // Extrair categorias únicas dos serviços
    const categorias = new Set<string>();
    if (p.contratos) {
      p.contratos.forEach((contrato: any) => {
        if (contrato.servicos_oferecidos) {
          contrato.servicos_oferecidos.forEach((so: any) => {
            if (so.servicos?.categoria) {
              categorias.add(so.servicos.categoria);
            }
          });
        }
      });
    }
    
    return {
      id: p.id_parceiro,
      nome: p.nome || '',
      cpf_cnpj: p.cpf || p.cnpj || '',
      tipo_pessoa: p.tipo_pessoa,
      area_atuacao: null,
      email: p.email,
      telefone: p.telefone,
      razao_social: p.razao_social,
      nome_fantasia: p.nome_fantasia,
      responsavel: p.responsavel,
      endereco_completo: null,
      ativo: p.ativo,
      created_at: p.created_at,
      updated_at: p.updated_at,
      categorias: Array.from(categorias)
    };
  });
  return mapped;
}

async function createParceiro(input: ParceiroInput) {
  const isCpf = input.cpf_cnpj.length === 11 || input.cpf_cnpj.replace(/\D/g, '').length === 11;
  const tipoPessoa = (input.tipo_pessoa || 'juridica').toUpperCase();
  const { data, error } = await supabase
    .from("parceiros")
    .insert({
      nome: input.nome,
      [isCpf ? 'cpf' : 'cnpj']: input.cpf_cnpj,
      tipo_pessoa: tipoPessoa,
      email: input.email || null,
      telefone: input.telefone || null,
      razao_social: input.razao_social || null,
      nome_fantasia: input.nome_fantasia || null,
      responsavel: input.responsavel || null,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id_parceiro,
    nome: data.nome || '',
    cpf_cnpj: data.cpf || data.cnpj || '',
    tipo_pessoa: data.tipo_pessoa,
    area_atuacao: null,
    email: data.email,
    telefone: data.telefone,
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia,
    responsavel: data.responsavel,
    endereco_completo: null,
    ativo: data.ativo,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

async function updateParceiro(id: number, input: ParceiroInput) {
  const tipoPessoa = input.tipo_pessoa ? input.tipo_pessoa.toUpperCase() : null;
  const { data, error} = await supabase
    .from("parceiros")
    .update({
      nome: input.nome,
      tipo_pessoa: tipoPessoa,
      email: input.email || null,
      telefone: input.telefone || null,
      razao_social: input.razao_social || null,
      nome_fantasia: input.nome_fantasia || null,
      responsavel: input.responsavel || null,
    })
    .eq("id_parceiro", id)
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id_parceiro,
    nome: data.nome || '',
    cpf_cnpj: data.cpf || data.cnpj || '',
    tipo_pessoa: data.tipo_pessoa,
    area_atuacao: null,
    email: data.email,
    telefone: data.telefone,
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia,
    responsavel: data.responsavel,
    endereco_completo: null,
    ativo: data.ativo,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

async function deleteParceiro(id: number) {
  const { error } = await supabase.from("parceiros").delete().eq("id_parceiro", id);
  if (error) throw error;
}

async function inativarParceiro(id: number) {
  const { data, error } = await supabase
    .from("parceiros")
    .update({ ativo: false })
    .eq("id_parceiro", id)
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id_parceiro,
    nome: data.nome || '',
    cpf_cnpj: data.cpf || data.cnpj || '',
    tipo_pessoa: data.tipo_pessoa,
    area_atuacao: null,
    email: data.email,
    telefone: data.telefone,
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia,
    responsavel: data.responsavel,
    endereco_completo: null,
    ativo: data.ativo,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export function useParceiros() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({ queryKey: ["parceiros"], queryFn: fetchParceiros });

  const createMutation = useMutation({
    mutationFn: createParceiro,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parceiros"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ParceiroInput }) => updateParceiro(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parceiros"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteParceiro(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parceiros"] }),
  });

  const inativarMutation = useMutation({
    mutationFn: (id: number) => inativarParceiro(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parceiros"] }),
  });

  return { listQuery, createMutation, updateMutation, deleteMutation, inativarMutation };
}
