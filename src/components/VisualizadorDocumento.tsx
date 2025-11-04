import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, FileText, CheckCircle, MessageCircle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DialogoSolicitarCorrecao from "./DialogoSolicitarCorrecao";
import DialogoRejeitarDocumento from "./DialogoRejeitarDocumento";
import SecaoComentarios from "./SecaoComentarios";
import { Input } from "@/components/ui/input";

interface Documento {
  id_documento: number;
  nome: string;
  caminho_arquivo: string;
  status?: string;
  created_at: string;
  data_upload: string;
  motivo_rejeicao?: string;
  id_tipo_documento?: number;
  tipos_documento?: {
    id_tipo_documento: number;
    nome: string;
    descricao: string;
  };
}

interface DocumentViewerProps {
  documento: Documento;
  canApprove: boolean;
  usuarioId: number;
  onStatusChange: () => void;
  userPerfil?: string;
}

const VisualizadorDocumento = ({ documento, canApprove, usuarioId, onStatusChange, userPerfil }: DocumentViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [isReenvioOpen, setIsReenvioOpen] = useState(false);
  const [novoArquivo, setNovoArquivo] = useState<File | null>(null);
  const { toast } = useToast();

  const getDocumentTypeLabel = (documento: Documento) => {
    // Verificar se há tipo_documento relacionado
    if (documento.tipos_documento?.nome) {
      return documento.tipos_documento.nome;
    }
    
    // Fallback: tentar inferir do nome do arquivo
    const fileName = documento.nome.toLowerCase();
    
    if (fileName.includes('contrato') || fileName.includes('contract')) {
      return 'Contrato Social';
    }
    if (fileName.includes('cnpj') || fileName.includes('receita')) {
      return 'Cartão CNPJ';
    }
    if (fileName.includes('carta') || fileName.includes('proposta')) {
      return 'Carta Proposta';
    }
    
    return 'Documento';
  };

  const handleApproveDocument = async () => {
    if (!canApprove) {
      toast({
        title: "Acesso Negado",
        description: "Você não possui permissão para aprovar documentos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('documentos')
        .update({
          status: 'aprovado',
          motivo_rejeicao: null,
        })
        .eq('id_documento', documento.id_documento);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Documento aprovado com sucesso",
      });

      onStatusChange();
    } catch (error) {
      console.error('Error approving document:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar documento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Pendente</Badge>;
    
    switch (status) {
      case "aprovado":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Aprovado</Badge>;
      case "rejeitado":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Rejeitado</Badge>;
      case "pendente":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Pendente</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">{status}</Badge>;
    }
  };

  const handleViewDocument = async () => {
    try {
      if (!documento.caminho_arquivo) {
        toast({
          title: "Erro",
          description: "Caminho do documento não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Gerar URL assinada do Supabase Storage
      const { data, error } = await supabase.storage
        .from('convenio-documents')
        .createSignedUrl(documento.caminho_arquivo, 60 * 60); // 1 hora

      if (error || !data?.signedUrl) {
        console.error('Error generating signed URL:', error);
        throw error || new Error('Falha ao gerar URL assinada');
      }

      setDocumentUrl(data.signedUrl);
      setIsViewerOpen(true);
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar documento. Verifique se o arquivo existe no storage.",
        variant: "destructive",
      });
    }
  };

  const handleReenviarDocumento = async () => {
    if (!novoArquivo) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para enviar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload do novo arquivo
      const fileExt = novoArquivo.name.split('.').pop();
      const fileName = `${documento.id_documento}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('convenio-documents')
        .upload(filePath, novoArquivo, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Atualizar registro do documento
      const { error: updateError } = await supabase
        .from('documentos')
        .update({
          caminho_arquivo: filePath,
          nome: novoArquivo.name,
          status: 'pendente',
          motivo_rejeicao: null,
          data_upload: new Date().toISOString(),
        })
        .eq('id_documento', documento.id_documento);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Documento reenviado com sucesso",
      });

      setIsReenvioOpen(false);
      setNovoArquivo(null);
      onStatusChange();
    } catch (error) {
      console.error('Error resending document:', error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar documento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Detectar tipo de arquivo pela extensão
  const fileExtension = documento.nome.split('.').pop()?.toLowerCase() || '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';

  const isCorrecaoSolicitada = documento.status === 'pendente' && documento.motivo_rejeicao?.includes('Correção solicitada');
  const canReenviar = userPerfil === 'ESTAGIARIO' && isCorrecaoSolicitada;

  return (
    <>
      <div 
        className={`flex items-center justify-between p-3 bg-muted/50 rounded-lg border ${canReenviar ? 'cursor-pointer hover:bg-muted' : ''}`}
        onClick={() => canReenviar && setIsReenvioOpen(true)}
      >
        <div className="flex items-center gap-3 flex-1">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {getDocumentTypeLabel(documento)}
              </span>
              {getStatusBadge(documento.status)}
            </div>
            {documento.motivo_rejeicao && (
              <div className="text-xs text-destructive mt-1">
                Motivo: {documento.motivo_rejeicao}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewDocument();
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>

          {canApprove && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setIsCommentsOpen(true);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Comentários
            </Button>
          )}

          {(documento.status === 'pendente' || !documento.status) && canApprove && (
            <>
              <DialogoSolicitarCorrecao
                documento={documento}
                usuarioId={usuarioId}
                onSolicitar={onStatusChange}
              />
              
              <DialogoRejeitarDocumento
                documento={documento}
                usuarioId={usuarioId}
                onRejeitar={onStatusChange}
              />
              
              <Button
                size="sm"
                onClick={handleApproveDocument}
                disabled={isLoading}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Aprovar
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-5xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{documento.nome}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {isImage && (
              <img 
                src={documentUrl} 
                alt={documento.nome}
                className="w-full h-full object-contain"
              />
            )}
            {isPdf && (
              <iframe
                src={documentUrl}
                className="w-full h-full border-0"
                title={documento.nome}
              />
            )}
            {!isImage && !isPdf && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Formato não suportado para visualização inline. 
                  <a 
                    href={documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline ml-1"
                  >
                    Abrir em nova aba
                  </a>
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comentários - {documento.nome}</DialogTitle>
          </DialogHeader>
          <SecaoComentarios documentoId={documento.id_documento} usuarioId={usuarioId} />
        </DialogContent>
      </Dialog>

      <Dialog open={isReenvioOpen} onOpenChange={setIsReenvioOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reenviar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Documento atual:</p>
              <p className="text-sm text-muted-foreground">{documento.nome}</p>
              {documento.motivo_rejeicao && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-destructive">Motivo:</p>
                  <p className="text-sm text-muted-foreground">{documento.motivo_rejeicao}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="novo-arquivo" className="text-sm font-medium">
                Selecionar novo arquivo
              </label>
              <Input
                id="novo-arquivo"
                type="file"
                onChange={(e) => setNovoArquivo(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {novoArquivo && (
                <p className="text-xs text-muted-foreground">
                  Arquivo selecionado: {novoArquivo.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsReenvioOpen(false);
                  setNovoArquivo(null);
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleReenviarDocumento}
                disabled={isLoading || !novoArquivo}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VisualizadorDocumento;
