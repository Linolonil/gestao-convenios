import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Building2, Hash, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import VisualizadorDocumento from "@/components/VisualizadorDocumento";
import { Separator } from "@/components/ui/separator";
import CardAdicionarDocumentos from "@/components/CardAdicionarDocumentos";
import LoadingSkeleton from "@/components/LoadingSkeleton";

const Documentos = () => {
  const [convenios, setConvenios] = useState([]);
  const [selectedConvenio, setSelectedConvenio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { usuario, isAdmin, isAnalista } = useAuth();

  const canApproveDocuments = isAdmin() || isAnalista();

  useEffect(() => {
    fetchConvenios();
  }, []);

  const fetchConvenios = async () => {
    try {
      const { data: conveniosData, error } = await supabase
        .from('contratos')
        .select(`
          *,
          parceiros (
            nome,
            cnpj,
            cpf,
            tipo_pessoa,
            razao_social,
            nome_fantasia
          ),
          documentos (
            *,
            tipos_documento (
              id_tipo_documento,
              nome,
              descricao
            )
          ),
          servicos_oferecidos (
            *,
            servicos (
              nome,
              descricao,
              categoria
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ordenar documentos dentro de cada contrato - carta proposta primeiro
      const conveniosComDocumentosOrdenados = (conveniosData || []).map(convenio => ({
        ...convenio,
        documentos: (convenio.documentos || []).sort((a, b) => {
          const isCartaPropostaA = a.nome?.toLowerCase().includes('carta') || 
                                   a.nome?.toLowerCase().includes('proposta') ||
                                   a.tipos_documento?.nome?.toLowerCase().includes('carta') ||
                                   a.tipos_documento?.nome?.toLowerCase().includes('proposta');
          const isCartaPropostaB = b.nome?.toLowerCase().includes('carta') || 
                                   b.nome?.toLowerCase().includes('proposta') ||
                                   b.tipos_documento?.nome?.toLowerCase().includes('carta') ||
                                   b.tipos_documento?.nome?.toLowerCase().includes('proposta');
          
          if (isCartaPropostaA && !isCartaPropostaB) return -1;
          if (!isCartaPropostaA && isCartaPropostaB) return 1;
          
          // Se ambos são ou não são carta proposta, ordenar por data
          return new Date(b.data_upload) - new Date(a.data_upload);
        })
      }));

      setConvenios(conveniosComDocumentosOrdenados);
      if (selectedConvenio) {
        const atualizado = conveniosComDocumentosOrdenados.find(c => c.id_contrato === selectedConvenio.id_contrato);
        if (atualizado) setSelectedConvenio(atualizado);
      }
    } catch (error) {
      console.error('Error fetching convenios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar convênios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case "pendente":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Pendente</Badge>;
      case "aprovado":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Aprovado</Badge>;
      case "rejeitado":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">{status}</Badge>;
    }
  };

  const getDocumentStatusSummary = (documentos) => {
    if (!documentos || documentos.length === 0) return null;
    
    const statusCount = documentos.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="flex gap-2 flex-wrap">
        {statusCount.pendente && (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            {statusCount.pendente} Pendente{statusCount.pendente > 1 ? 's' : ''}
          </Badge>
        )}
        {statusCount.aprovado && (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            {statusCount.aprovado} Aprovado{statusCount.aprovado > 1 ? 's' : ''}
          </Badge>
        )}
        {statusCount.rejeitado && (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            {statusCount.rejeitado} Rejeitado{statusCount.rejeitado > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
        </div>
        <LoadingSkeleton type="list" count={5} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {!selectedConvenio ? (
        <>
          <div>
            <h1 className="text-3xl font-bold mb-2">Análise de Documentos</h1>
            <p className="text-muted-foreground">
              Selecione um convênio para visualizar e aprovar os documentos enviados
            </p>
          </div>

          <div className="grid gap-4">
            {convenios.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum convênio encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Não há convênios para análise no momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              convenios.map((convenio) => (
                <Card 
                  key={convenio.id_contrato} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedConvenio(convenio)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-semibold">
                            {convenio.parceiros?.nome || convenio.parceiros?.nome_fantasia || 'Parceiro'}
                          </h3>
                          {getDocumentStatusSummary(convenio.documentos)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>{convenio.parceiros?.tipo_pessoa === 'JURIDICA' ? 'Pessoa Jurídica' : 'Pessoa Física'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{convenio.documentos?.length || 0} documento(s)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedConvenio(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lista
          </Button>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-2xl">Resumo do Convênio</CardTitle>
                {getDocumentStatusSummary(selectedConvenio.documentos)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nome do Parceiro</p>
                    <p className="font-semibold text-lg">
                      {selectedConvenio.parceiros?.nome || selectedConvenio.parceiros?.nome_fantasia || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Pessoa</p>
                    <p className="font-semibold text-lg">
                      {selectedConvenio.parceiros?.tipo_pessoa === 'JURIDICA' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serviços Oferecidos</p>
                    <p className="font-semibold text-lg">
                      {selectedConvenio.servicos_oferecidos && selectedConvenio.servicos_oferecidos.length > 0
                        ? selectedConvenio.servicos_oferecidos.map(s => s.servicos?.nome).filter(Boolean).join(', ')
                        : 'Nenhum serviço cadastrado'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <CardAdicionarDocumentos 
            idContrato={selectedConvenio.id_contrato} 
            onDocumentosAdicionados={fetchConvenios}
          />

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4">Documentos do Convênio</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Clique em "Ver" para visualizar o documento. Use os botões de ação para aprovar, rejeitar ou solicitar correção.
            </p>
            
            {!selectedConvenio.documentos || selectedConvenio.documentos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum documento enviado</h3>
                  <p className="text-sm text-muted-foreground">
                    Este convênio ainda não possui documentos anexados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {selectedConvenio.documentos.map((doc, index) => {
                  const isCartaProposta = doc.nome?.toLowerCase().includes('carta') || 
                                         doc.nome?.toLowerCase().includes('proposta') ||
                                         doc.tipos_documento?.nome?.toLowerCase().includes('carta') ||
                                         doc.tipos_documento?.nome?.toLowerCase().includes('proposta');
                  
                  return (
                    <div key={doc.id_documento}>
                      {index === 0 && isCartaProposta && (
                        <div className="mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">Carta Proposta</span>
                        </div>
                      )}
                      {index === 1 && !isCartaProposta && (
                        <div className="mt-6 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">Outros Documentos</span>
                        </div>
                      )}
                      {index === 1 && isCartaProposta && (
                        <div className="mt-6 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">Documentos Complementares</span>
                        </div>
                      )}
                      <VisualizadorDocumento
                        documento={doc}
                        canApprove={canApproveDocuments}
                        usuarioId={usuario?.id_usuario}
                        onStatusChange={fetchConvenios}
                        userPerfil={usuario?.perfil}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentos;
