import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../layout/LoadingSpinner";

const DetalhesConvenio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [convenio, setConvenio] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchConvenioDetalhes();
    }
  }, [id]);

  const fetchConvenioDetalhes = async () => {
    try {
      // Buscar convênio com parceiro
      const { data: convenioData, error: convenioError } = await supabase
        .from("contratos")
        .select(
          `
          *,
          parceiros (
            nome,
            tipo_pessoa,
            email,
            telefone,
            endereco,
            cpf,
            cnpj,
            razao_social,
            nome_fantasia,
            responsavel
          )
        `,
        )
        .eq("id_contrato", parseInt(id))
        .single();

      if (convenioError) throw convenioError;
      setConvenio(convenioData);

      // Buscar dados do usuário separadamente
      if (convenioData?.id_usuario) {
        const { data: usuarioData } = await supabase
          .from("usuarios")
          .select("nome, email")
          .eq("id_usuario", convenioData.id_usuario)
          .single();

        setUsuario(usuarioData);
      }

      // Buscar serviços oferecidos
      const { data: servicosData, error: servicosError } = await supabase
        .from("servicos_oferecidos")
        .select(
          `
          *,
          servicos (
            nome,
            descricao,
            categoria
          )
        `,
        )
        .eq("id_contrato", parseInt(id))

      if (servicosError) throw servicosError;
      setServicos(servicosData || []);

      // Buscar documentos
      const { data: documentosData, error: documentosError } = await supabase
        .from("documentos")
        .select(
          `
          *,
          tipos_documento (
            nome
          )
        `,
        )
        .eq("id_contrato", parseInt(id))
        .order("data_upload", { ascending: false });

      if (documentosError) throw documentosError;
      setDocumentos(documentosData || []);
    } catch (error) {
      console.error("Error fetching convenio details:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes do convênio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    ATIVO: { label: "Ativo", variant: "default" },
    EM_ANALISE: { label: "Em análise", variant: "secondary" },
    EM_NEGOCIACAO: { label: "Em negociação", variant: "accent" },
    RENOVACAO: { label: "Renovação", variant: "outline" },
    ENCERRADO: { label: "Encerrado", variant: "destructive" },
  };

  if (isLoading) {
    return <LoadingSpinner message="Carregando detalhes do convênio..." fullScreen />;
  }

  if (!convenio) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Convênio não encontrado</p>
      </div>
    );
  }

  const getStatusDocumentoBadge = (status) => {
    const statusMap = {
      pendente: { label: "Pendente", variant: "secondary" },
      aprovado: { label: "Aprovado", variant: "default" },
      rejeitado: { label: "Rejeitado", variant: "destructive" },
      em_correcao: { label: "Em Correção", variant: "outline" }
    };
    const config = statusMap[status] || statusMap.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleVisualizarDocumento = async (documento) => {
    try {
      const { data, error } = await supabase.storage
        .from('convenio-documents')
        .createSignedUrl(documento.caminho_arquivo, 60);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível visualizar o documento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => navigate("/convenios", { state: { selectedStatus: location.state?.selectedStatus || 'EM_ANALISE' } })}
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>

      {/* Três Cards lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card: Dados do Convênio */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Convênio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Cadastrado por: </span>
                <span className="text-sm">{usuario?.nome || "-"}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Data de Cadastro: </span>
                <span className="text-sm">{new Date(convenio.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Informações Gerais do Parceiro */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais do Parceiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Nome: </span>
                <span className="text-sm">{convenio.parceiros?.nome || "-"}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Tipo: </span>
                <span className="text-sm">
                  {convenio.parceiros?.tipo_pessoa === "JURIDICA" ? "Pessoa Jurídica" : "Pessoa Física"}
                </span>
              </div>
              {convenio.parceiros?.tipo_pessoa === "JURIDICA" ? (
                <>
                  <div>
                    <span className="text-sm font-medium">CNPJ: </span>
                    <span className="text-sm">{convenio.parceiros?.cnpj || "-"}</span>
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-sm font-medium">CPF: </span>
                  <span className="text-sm">{convenio.parceiros?.cpf || "-"}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Email: </span>
                <span className="text-sm">{convenio.parceiros?.email || "-"}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Telefone: </span>
                <span className="text-sm">{convenio.parceiros?.telefone || "-"}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Endereço: </span>
                <span className="text-sm">{convenio.parceiros?.endereco || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Serviços Oferecidos */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Oferecidos</CardTitle>
          </CardHeader>
          <CardContent>
            {servicos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado</p>
            ) : (
              <div className="space-y-2">
                {servicos.map((servico) => (
                  <div key={servico.id_servico_oferecido} className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">{servico.servicos?.categoria}</div>
                    <div className="text-xs text-muted-foreground mt-1">{servico.servicos?.nome}</div>
                    {servico.desconto_concedido > 0 && (
                      <div className="text-xs text-primary font-medium mt-1">
                        Desconto: {servico.desconto_concedido}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card: Movimentações dos Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações dos Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum documento enviado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Data de Atualização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((documento) => (
                  <TableRow key={documento.id_documento}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVisualizarDocumento(documento)}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>{documento.tipos_documento?.nome || "-"}</TableCell>
                    <TableCell>
                      {new Date(documento.data_upload).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{getStatusDocumentoBadge(documento.status)}</TableCell>
                    <TableCell className="text-right">
                      {documento.data_status 
                        ? new Date(documento.data_status).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetalhesConvenio;
