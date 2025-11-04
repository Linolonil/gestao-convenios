import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDocumentStatusSummary } from "@/lib/getDocumentStatusSummary";
import { ArrowLeft, Briefcase, Building2, FileText } from "lucide-react";
import CardAdicionarDocumentos from "./CardAdicionarDocumentos";
import VisualizadorDocumento from "./VisualizadorDocumento";

/* Tipos compartilhados */
interface Parceiro {
    nome?: string;
    nome_fantasia?: string;
    tipo_pessoa?: "JURIDICA" | "FISICA";
}

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

interface Convenio {
    id_contrato: number;
    parceiros?: Parceiro;
    servicos_oferecidos?: { servicos?: { nome?: string } }[];
    documentos?: Documento[];
}

interface ResumoConvenioProps {
    selectedConvenio: Convenio;
    usuario?: { id: number; perfil?: string };
    canApproveDocuments: boolean;
    setSelectedConvenio: (value: Convenio | null) => void;
    fetchConvenios: () => void;
}

export default function ResumoConvenio({
    selectedConvenio,
    usuario,
    canApproveDocuments,
    setSelectedConvenio,
    fetchConvenios,
}: ResumoConvenioProps) {
    const nomeParceiro =
        selectedConvenio.parceiros?.nome ||
        selectedConvenio.parceiros?.nome_fantasia ||
        "N/A";

    const tipoPessoa =
        selectedConvenio.parceiros?.tipo_pessoa === "JURIDICA"
            ? "Pessoa Jurídica"
            : "Pessoa Física";

    const servicos =
        selectedConvenio.servicos_oferecidos &&
            selectedConvenio.servicos_oferecidos.length > 0
            ? selectedConvenio.servicos_oferecidos
                .map((s) => s.servicos?.nome)
                .filter(Boolean)
                .join(", ")
            : "Nenhum serviço cadastrado";

    const documentos = selectedConvenio.documentos || [];

    return (
        <div className="space-y-6">
            {/* Voltar */}
            <Button
                variant="ghost"
                onClick={() => setSelectedConvenio(null)}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para lista
            </Button>

            {/* Resumo */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-2xl">Resumo do Convênio</CardTitle>
                        {getDocumentStatusSummary(selectedConvenio.documentos)}
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoItem
                            icon={<Building2 className="h-5 w-5 text-primary" />}
                            label="Nome do Parceiro"
                            value={nomeParceiro}
                        />
                        <InfoItem
                            icon={<Briefcase className="h-5 w-5 text-primary" />}
                            label="Tipo de Pessoa"
                            value={tipoPessoa}
                        />
                        <InfoItem
                            icon={<Briefcase className="h-5 w-5 text-primary" />}
                            label="Serviços Oferecidos"
                            value={servicos}
                        />
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Adicionar documentos */}
            <CardAdicionarDocumentos
                idContrato={selectedConvenio.id_contrato}
                onDocumentosAdicionados={fetchConvenios}
            />

            <Separator />

            {/* Documentos */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Documentos do Convênio</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Clique em "Ver" para visualizar o documento. Use os botões de ação
                    para aprovar, rejeitar ou solicitar correção.
                </p>

                {documentos.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                Nenhum documento enviado
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Este convênio ainda não possui documentos anexados
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {documentos.map((doc, index) => {
                            const isCartaProposta =
                                doc.nome?.toLowerCase().includes("carta") ||
                                doc.nome?.toLowerCase().includes("proposta") ||
                                doc.tipos_documento?.nome
                                    ?.toLowerCase()
                                    .includes("carta") ||
                                doc.tipos_documento?.nome
                                    ?.toLowerCase()
                                    .includes("proposta");

                            return (
                                <div key={doc.id_documento}>
                                    {index === 0 && isCartaProposta && (
                                        <SectionHeader label="Carta Proposta" highlight />
                                    )}
                                    {index === 1 && !isCartaProposta && (
                                        <SectionHeader label="Outros Documentos" />
                                    )}
                                    {index === 1 && isCartaProposta && (
                                        <SectionHeader label="Documentos Complementares" />
                                    )}

                                    <VisualizadorDocumento
                                        documento={doc}
                                        canApprove={canApproveDocuments}
                                        usuarioId={usuario?.id ?? 0}
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
    );
}

/* Item de informação genérico */
function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-semibold text-lg">{value}</p>
            </div>
        </div>
    );
}

/* Cabeçalho das seções */
function SectionHeader({
    label,
    highlight = false,
}: {
    label: string;
    highlight?: boolean;
}) {
    return (
        <div className="mt-6 mb-2 flex items-center gap-2">
            <FileText
                className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"
                    }`}
            />
            <span
                className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"
                    }`}
            >
                {label}
            </span>
        </div>
    );
}
