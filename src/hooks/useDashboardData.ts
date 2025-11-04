import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const useDashboardData = () => {
    const [recentConvenios, setRecentConvenios] = useState([]);
    const [stats, setStats] = useState({
        totalConvenios: 0,
        conveniosAtivos: 0,
        parceiros: 0,
        documentos: 0,
    });
    const [loading, setLoading] = useState(true);
    const [conveniosServicos, setConveniosServicos] = useState({});
    const { toast } = useToast();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);


                // 🔹 2. Caso o cache esteja vazio ou expirado → consulta o Supabase
                const { count: totalConvenios } = await supabase
                    .from("contratos")
                    .select("*", { count: "exact", head: true });

                const { count: conveniosAtivos } = await supabase
                    .from("contratos")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "ATIVO");

                const { count: parceiros } = await supabase
                    .from("parceiros")
                    .select("*", { count: "exact", head: true });

                const { count: documentos } = await supabase
                    .from("documentos")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "pendente");

                const { data: conveniosRecentes, error } = await supabase
                    .from("contratos")
                    .select(`
            id_contrato,
            numero,
            status,
            created_at,
            parceiros (nome)
          `)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (error) throw error;

                // 🔹 3. Busca todos os serviços associados de uma vez
                let servicosMap = {};
                if (conveniosRecentes?.length > 0) {
                    const contratoIds = conveniosRecentes.map((c) => c.id_contrato);
                    const { data: servicosData } = await supabase
                        .from("servicos_oferecidos")
                        .select(`
              id_contrato,
              desconto_concedido,
              servicos (nome)
            `)
                        .in("id_contrato", contratoIds);

                    servicosData?.forEach((s) => {
                        if (!servicosMap[s.id_contrato]) servicosMap[s.id_contrato] = [];
                        const nome = s.servicos?.nome;
                        const desconto = s.desconto_concedido;
                        if (nome) {
                            servicosMap[s.id_contrato].push(
                                desconto > 0 ? `${nome} (${desconto}% desconto)` : nome
                            );
                        }
                    });

                    Object.keys(servicosMap).forEach((k) => {
                        servicosMap[k] = servicosMap[k].join(", ");
                    });
                }

                // 🔹 4. Atualiza estados
                const newStats = {
                    totalConvenios: totalConvenios || 0,
                    conveniosAtivos: conveniosAtivos || 0,
                    parceiros: parceiros || 0,
                    documentos: documentos || 0,
                };

                setStats(newStats);
                setRecentConvenios(conveniosRecentes || []);
                setConveniosServicos(servicosMap);
           
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
                toast({
                    title: "Erro",
                    description:
                        "Erro ao carregar dados do dashboard. Tente novamente.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return { stats, recentConvenios, conveniosServicos, loading };
};
