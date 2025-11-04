import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

interface Convenio {
    id_contrato: number;
    id_parceiro: number;
}

interface UseConvenioActionsProps {
    fetchConvenios: () => void;
    setConvenioToReprove: (value: Convenio | null) => void;
    convenioToReprove: Convenio | null;
    convenioToActivate: Convenio | null;
    setConvenioToActivate: (value: Convenio | null) => void;
    numeroContrato: string;
    setNumeroContrato: (value: string) => void;
    setSelectedStatus: (value: string) => void;
}

export const useConvenioActions = ({
    fetchConvenios,
    setConvenioToReprove,
    convenioToReprove,
    convenioToActivate,
    setConvenioToActivate,
    numeroContrato,
    setNumeroContrato,
    setSelectedStatus,
}: UseConvenioActionsProps) => {
    const { toast } = useToast();

    const handleAprovarConvenio = useCallback(
        async (idContrato: number) => {
            try {
                const { data: documentos, error: docError } = await supabase
                    .from("documentos")
                    .select("id_documento, status, nome")
                    .eq("id_contrato", idContrato);

                if (docError) throw docError;

                if (!documentos || documentos.length === 0) {
                    toast({
                        title: "Impossível aprovar",
                        description: "Este convênio não possui documentos anexados",
                        variant: "destructive",
                    });
                    return;
                }

                const documentosPendentes = documentos.filter(
                    (doc) => doc.status !== "aprovado"
                );

                if (documentosPendentes.length > 0) {
                    const statusDescricao = documentosPendentes
                        .map((doc) => {
                            const statusMap: Record<string, string> = {
                                pendente: "pendente",
                                rejeitado: "rejeitado",
                                em_correcao: "em correção",
                            };
                            return `${doc.nome} (${statusMap[doc.status] || doc.status})`;
                        })
                        .join(", ");

                    toast({
                        title: "Impossível aprovar",
                        description: `Existem ${documentosPendentes.length} documento(s) não aprovado(s): ${statusDescricao}. Todos os documentos devem estar aprovados antes de aprovar o convênio.`,
                        variant: "destructive",
                    });
                    return;
                }

                const { error } = await supabase
                    .from("contratos")
                    .update({ status: "EM_NEGOCIACAO" })
                    .eq("id_contrato", idContrato);

                if (error) throw error;

                toast({
                    title: "Sucesso",
                    description: "Convênio aprovado e movido para negociação",
                });

                fetchConvenios();
            } catch (error) {
                console.error("Error approving convenio:", error);
                toast({
                    title: "Erro",
                    description: "Erro ao aprovar convênio",
                    variant: "destructive",
                });
            }
        },
        [fetchConvenios, toast]
    );

    const handleReprovarConvenio = useCallback(async () => {
        if (!convenioToReprove) return;

        try {
            const { error: docError } = await supabase
                .from("documentos")
                .delete()
                .eq("id_contrato", convenioToReprove.id_contrato);
            if (docError) throw docError;

            const { error: servicosError } = await supabase
                .from("servicos_oferecidos")
                .delete()
                .eq("id_contrato", convenioToReprove.id_contrato);
            if (servicosError) throw servicosError;

            const { error: contratoError } = await supabase
                .from("contratos")
                .delete()
                .eq("id_contrato", convenioToReprove.id_contrato);
            if (contratoError) throw contratoError;

            const { error: parceiroError } = await supabase
                .from("parceiros")
                .delete()
                .eq("id_parceiro", convenioToReprove.id_parceiro);
            if (parceiroError) throw parceiroError;

            toast({
                title: "Sucesso",
                description: "Contrato reprovado e removido com sucesso",
            });

            setConvenioToReprove(null);
            fetchConvenios();
        } catch (error) {
            console.error("Error reproving convenio:", error);
            toast({
                title: "Erro",
                description: "Erro ao reprovar contrato",
                variant: "destructive",
            });
        }
    }, [convenioToReprove, fetchConvenios, setConvenioToReprove, toast]);

    const handleAtivarConvenio = useCallback(async () => {
        if (!convenioToActivate) return;

        if (!numeroContrato.trim()) {
            toast({
                title: "Erro",
                description: "Por favor, insira o número do contrato",
                variant: "destructive",
            });
            return;
        }

        try {
            const dataInicio = new Date();
            const dataFim = new Date(dataInicio);
            dataFim.setFullYear(dataFim.getFullYear() + 3);

            const { error } = await supabase
                .from("contratos")
                .update({
                    status: "ATIVO",
                    numero: numeroContrato.trim(),
                    data_inicio: dataInicio.toISOString().split("T")[0],
                    data_fim: dataFim.toISOString().split("T")[0],
                })
                .eq("id_contrato", convenioToActivate.id_contrato);

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Convênio ativado com sucesso",
            });

            setConvenioToActivate(null);
            setNumeroContrato("");
            setSelectedStatus("ATIVO");
            fetchConvenios();
        } catch (error) {
            console.error("Error activating convenio:", error);
            toast({
                title: "Erro",
                description: "Erro ao ativar convênio",
                variant: "destructive",
            });
        }
    }, [
        convenioToActivate,
        numeroContrato,
        toast,
        setConvenioToActivate,
        setNumeroContrato,
        setSelectedStatus,
        fetchConvenios,
    ]);

    return {
        handleAprovarConvenio,
        handleReprovarConvenio,
        handleAtivarConvenio,
    };
};
