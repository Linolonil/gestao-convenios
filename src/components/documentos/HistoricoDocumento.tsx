import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, XCircle, AlertTriangle, RefreshCw, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HistoricoItem {
  id: string;
  tipo: 'upload' | 'aprovacao' | 'rejeicao' | 'solicitacao' | 'reenvio' | 'comentario';
  descricao: string;
  usuario?: string;
  data: string;
}

interface HistoricoDocumentoProps {
  documentoId: number;
}

const HistoricoDocumento = ({ documentoId }: HistoricoDocumentoProps) => {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistorico();
  }, [documentoId]);

  const fetchHistorico = async () => {
    try {
      // Buscar documento
      const { data: documento, error: docError } = await supabase
        .from('documentos')
        .select('*')
        .eq('id_documento', documentoId)
        .maybeSingle();

      if (docError) throw docError;
      if (!documento) {
        setHistorico([]);
        return;
      }

      // Montar histórico simples
      const items: HistoricoItem[] = [];

      // Upload inicial
      items.push({
        id: `upload-${documento.id_documento}`,
        tipo: 'upload',
        descricao: `Documento enviado: ${documento.nome}`,
        data: documento.data_upload,
      });

      // Status atual
      if (documento.status === 'aprovado') {
        items.push({
          id: `aprovacao-${documento.id_documento}`,
          tipo: 'aprovacao',
          descricao: `Documento aprovado`,
          data: documento.data_status || documento.data_upload,
        });
      } else if (documento.status === 'rejeitado') {
        items.push({
          id: `rejeicao-${documento.id_documento}`,
          tipo: 'rejeicao',
          descricao: documento.motivo_rejeicao ? `Documento rejeitado: ${documento.motivo_rejeicao}` : 'Documento rejeitado',
          data: documento.data_status || documento.data_upload,
        });
      }

      setHistorico(items);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistorico([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'upload':
        return <Upload className="h-5 w-5 text-blue-600" />;
      case 'aprovacao':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejeicao':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'solicitacao':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'reenvio':
        return <RefreshCw className="h-5 w-5 text-purple-600" />;
      case 'comentario':
        return <MessageCircle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getBadge = (tipo: string) => {
    switch (tipo) {
      case 'upload':
        return <Badge className="bg-blue-100 text-blue-800">Upload</Badge>;
      case 'aprovacao':
        return <Badge className="bg-green-100 text-green-800">Aprovação</Badge>;
      case 'rejeicao':
        return <Badge variant="destructive">Rejeição</Badge>;
      case 'solicitacao':
        return <Badge className="bg-yellow-100 text-yellow-800">Solicitação</Badge>;
      case 'reenvio':
        return <Badge className="bg-purple-100 text-purple-800">Reenvio</Badge>;
      case 'comentario':
        return <Badge variant="secondary">Comentário</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico do Documento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-border" />
          <div className="space-y-4">
            {historico.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2">
                  {getIcon(item.tipo)}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    {getBadge(item.tipo)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.data).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">{item.descricao}</p>
                  {item.usuario && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Por: {item.usuario}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoricoDocumento;
