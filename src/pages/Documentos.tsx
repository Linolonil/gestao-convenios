import ResumoConvenio from "@/components/documentos/ResumoConvenio";
import LoadingSkeleton from "@/components/layout/LoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDocumentStatusSummary } from "@/lib/getDocumentStatusSummary";
import { Briefcase, FileText } from "lucide-react";
import { useEffect, useState } from "react";

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
          return new Date(b.data_upload).getTime() - new Date(a.data_upload).getTime();
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

          <ResumoConvenio canApproveDocuments={canApproveDocuments} selectedConvenio={selectedConvenio} setSelectedConvenio={setSelectedConvenio} fetchConvenios={fetchConvenios} usuario={usuario}/>
      )}
    </div>
  );
};

export default Documentos;
