export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contratos: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id_contrato: number
          id_parceiro: number
          id_usuario: number
          numero: string | null
          status: Database["public"]["Enums"]["status_contrato"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id_contrato?: number
          id_parceiro: number
          id_usuario: number
          numero?: string | null
          status?: Database["public"]["Enums"]["status_contrato"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id_contrato?: number
          id_parceiro?: number
          id_usuario?: number
          numero?: string | null
          status?: Database["public"]["Enums"]["status_contrato"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratos_id_parceiro_fkey"
            columns: ["id_parceiro"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id_parceiro"]
          },
          {
            foreignKeyName: "contratos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      documentos: {
        Row: {
          caminho_arquivo: string
          created_at: string
          data_status: string | null
          data_upload: string
          id_contrato: number
          id_documento: number
          id_tipo_documento: number | null
          motivo_rejeicao: string | null
          nome: string
          status: Database["public"]["Enums"]["status_documento"]
        }
        Insert: {
          caminho_arquivo: string
          created_at?: string
          data_status?: string | null
          data_upload?: string
          id_contrato: number
          id_documento?: number
          id_tipo_documento?: number | null
          motivo_rejeicao?: string | null
          nome: string
          status?: Database["public"]["Enums"]["status_documento"]
        }
        Update: {
          caminho_arquivo?: string
          created_at?: string
          data_status?: string | null
          data_upload?: string
          id_contrato?: number
          id_documento?: number
          id_tipo_documento?: number | null
          motivo_rejeicao?: string | null
          nome?: string
          status?: Database["public"]["Enums"]["status_documento"]
        }
        Relationships: [
          {
            foreignKeyName: "documentos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id_contrato"]
          },
          {
            foreignKeyName: "documentos_id_tipo_documento_fkey"
            columns: ["id_tipo_documento"]
            isOneToOne: false
            referencedRelation: "tipos_documento"
            referencedColumns: ["id_tipo_documento"]
          },
        ]
      }
      parceiros: {
        Row: {
          ativo: boolean
          cnpj: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          endereco: string | null
          id_parceiro: number
          nome: string | null
          nome_fantasia: string | null
          razao_social: string | null
          responsavel: string | null
          telefone: string | null
          tipo_pessoa: string
          updated_at: string
          validacao_add: boolean
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          id_parceiro?: number
          nome?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          responsavel?: string | null
          telefone?: string | null
          tipo_pessoa: string
          updated_at?: string
          validacao_add?: boolean
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          id_parceiro?: number
          nome?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          responsavel?: string | null
          telefone?: string | null
          tipo_pessoa?: string
          updated_at?: string
          validacao_add?: boolean
        }
        Relationships: []
      }
      servicos: {
        Row: {
          categoria: string | null
          created_at: string
          descricao: string | null
          id_servico: number
          nome: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id_servico?: number
          nome: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id_servico?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      servicos_oferecidos: {
        Row: {
          created_at: string
          desconto_concedido: number | null
          id_contrato: number
          id_servico: number
          id_servico_oferecido: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          desconto_concedido?: number | null
          id_contrato: number
          id_servico: number
          id_servico_oferecido?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          desconto_concedido?: number | null
          id_contrato?: number
          id_servico?: number
          id_servico_oferecido?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_oferecidos_id_contrato_fkey"
            columns: ["id_contrato"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id_contrato"]
          },
          {
            foreignKeyName: "servicos_oferecidos_id_servico_fkey"
            columns: ["id_servico"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id_servico"]
          },
        ]
      }
      tipos_documento: {
        Row: {
          created_at: string
          descricao: string | null
          id_tipo_documento: number
          nome: string
          obrigatorio: boolean
          prazo_validade_dias: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id_tipo_documento?: number
          nome: string
          obrigatorio?: boolean
          prazo_validade_dias?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id_tipo_documento?: number
          nome?: string
          obrigatorio?: boolean
          prazo_validade_dias?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id_usuario: number
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
          senha: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id_usuario?: number
          nome: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          senha: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id_usuario?: number
          nome?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          senha?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_dias_restantes: {
        Args: { p_id_contrato: number }
        Returns: number
      }
      get_user_perfil: { Args: { user_email: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_analista: { Args: never; Returns: boolean }
      validar_documento: { Args: { p_id_documento: number }; Returns: boolean }
    }
    Enums: {
      perfil_usuario: "ADMIN" | "ANALISTA" | "ESTAGIARIO"
      status_contrato:
        | "EM_ANALISE"
        | "EM_NEGOCIACAO"
        | "ATIVO"
        | "RENOVACAO"
        | "ENCERRADO"
      status_documento: "pendente" | "aprovado" | "rejeitado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      perfil_usuario: ["ADMIN", "ANALISTA", "ESTAGIARIO"],
      status_contrato: [
        "EM_ANALISE",
        "EM_NEGOCIACAO",
        "ATIVO",
        "RENOVACAO",
        "ENCERRADO",
      ],
      status_documento: ["pendente", "aprovado", "rejeitado"],
    },
  },
} as const
