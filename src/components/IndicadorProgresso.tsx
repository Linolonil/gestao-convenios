import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

interface Documento {
  id: number;
  nome_arquivo: string;
  status?: string;
  requer_correcao?: boolean;
  categoria_documento?: string;
}

interface IndicadorProgressoProps {
  documentos: Documento[];
}

const IndicadorProgresso = ({ documentos }: IndicadorProgressoProps) => {
  const documentosObrigatorios = documentos; // Assumindo que todos os documentos enviados são relevantes
  const totalDocumentos = documentosObrigatorios.length;
  
  const aprovados = documentosObrigatorios.filter(d => d.status === 'aprovado').length;
  const pendentes = documentosObrigatorios.filter(d => !d.status || d.status === 'pendente').length;
  const requeremCorrecao = documentosObrigatorios.filter(d => d.requer_correcao).length;
  const rejeitados = documentosObrigatorios.filter(d => d.status === 'rejeitado').length;

  const progressoPercentual = totalDocumentos > 0 ? (aprovados / totalDocumentos) * 100 : 0;

  const getStatusIcon = (documento: Documento) => {
    if (documento.status === 'aprovado') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (documento.requer_correcao) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    if (documento.status === 'rejeitado') {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = (documento: Documento) => {
    if (documento.status === 'aprovado') {
      return <Badge className="bg-green-100 text-green-800 text-xs">Aprovado</Badge>;
    }
    if (documento.requer_correcao) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Requer Correção</Badge>;
    }
    if (documento.status === 'rejeitado') {
      return <Badge variant="destructive" className="text-xs">Rejeitado</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">Pendente</Badge>;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Progresso de Análise</h3>
              <span className="text-sm font-medium">
                {aprovados} de {totalDocumentos} aprovados ({Math.round(progressoPercentual)}%)
              </span>
            </div>
            <Progress value={progressoPercentual} className="h-2" />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{aprovados}</div>
              <div className="text-xs text-green-600">Aprovados</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">{pendentes}</div>
              <div className="text-xs text-gray-600">Pendentes</div>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{requeremCorrecao}</div>
              <div className="text-xs text-yellow-600">Requerem Correção</div>
            </div>
            <div className="p-2 rounded-lg bg-red-50 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{rejeitados}</div>
              <div className="text-xs text-red-600">Rejeitados</div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Status dos Documentos</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {documentosObrigatorios.map((documento) => (
                <div
                  key={documento.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(documento)}
                    <span className="text-sm truncate">
                      {documento.categoria_documento || documento.nome_arquivo}
                    </span>
                  </div>
                  {getStatusBadge(documento)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndicadorProgresso;
