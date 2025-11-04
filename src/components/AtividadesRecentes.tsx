import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Atividade = {
  id: number;
  tipo_entidade: string;
  status_novo: string;
  data_mudanca: string;
  usuario_nome?: string;
};

const AtividadesRecentes = () => {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tabela historico_status não existe ainda
    setLoading(false);
    setAtividades([]);
  }, []);

  const getAtividadeTexto = (atividade: Atividade) => {
    if (atividade.tipo_entidade === 'convenio') {
      if (atividade.status_novo === 'ativo') return 'Convênio ativado';
      if (atividade.status_novo === 'renovacao') return 'Convênio renovado';
      if (atividade.status_novo === 'prospeccao') return 'Novo convênio criado';
      if (atividade.status_novo === 'inativo') return 'Convênio inativado';
      if (atividade.status_novo === 'negociacao') return 'Convênio em negociação';
    }
    if (atividade.tipo_entidade === 'documento') {
      if (atividade.status_novo === 'aprovado') return 'Documento aprovado';
      if (atividade.status_novo === 'rejeitado') return 'Documento rejeitado';
      if (atividade.status_novo === 'pendente') return 'Documento enviado';
    }
    return 'Atividade registrada';
  };

  const formatarTempo = (data: string) => {
    return formatDistanceToNow(new Date(data), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Carregando atividades...</p>
          </div>
        ) : atividades.length > 0 ? (
          <div className="space-y-4">
            {atividades.map((atividade) => (
              <div key={atividade.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    {getAtividadeTexto(atividade)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatarTempo(atividade.data_mudanca)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AtividadesRecentes;
