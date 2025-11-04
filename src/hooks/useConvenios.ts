import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function useConvenios() {
    const { toast } = useToast();
    const [convenios, setConvenios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [conveniosServicos, setConveniosServicos] = useState({});
    const [conveniosDescontos, setConveniosDescontos] = useState({});
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [convenioToReprove, setConvenioToReprove] = useState(null);
    const [convenioToActivate, setConvenioToActivate] = useState(null);
    const [numeroContrato, setNumeroContrato] = useState('');

    useEffect(() => {
        fetchConvenios();
        let channel: ReturnType<typeof supabase.channel> | null = null;
        const setup = async () => {
            channel = supabase
                .channel('contratos-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'contratos' }, fetchConvenios)
                .subscribe();
        };
        setup();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);


    const fetchConvenios = async () => {
        try {
            const { data, error } = await supabase
                .from('contratos')
                .select(`*, parceiros (nome, tipo_pessoa, cpf, cnpj)`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const conveniosTyped = (data || []).map(c => ({ ...c, parceiro: c.parceiros }));
            setConvenios(conveniosTyped);

            if (conveniosTyped.length) {
                const contratoIds = conveniosTyped.map(c => c.id_contrato);
                const { data: servicosData } = await supabase
                    .from('servicos_oferecidos')
                    .select(`id_contrato, desconto_concedido, servicos (nome)`)
                    .in('id_contrato', contratoIds);

                const servicosMap = {};
                const descontosMap = {};

                if (servicosData) {
                    servicosData.forEach(s => {
                        if (!servicosMap[s.id_contrato]) servicosMap[s.id_contrato] = [];
                        const nome = s.servicos?.nome;
                        if (nome) servicosMap[s.id_contrato].push(nome);
                        if (!descontosMap[s.id_contrato] && s.desconto_concedido > 0) {
                            descontosMap[s.id_contrato] = s.desconto_concedido;
                        }
                    });

                    Object.keys(servicosMap).forEach(
                        key => (servicosMap[key] = servicosMap[key].join(', '))
                    );
                }

                setConveniosServicos(servicosMap);
                setConveniosDescontos(descontosMap);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro",
                description: "Erro ao carregar convênios",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        convenios,
        isLoading,
        selectedStatus,
        setSelectedStatus,
        conveniosServicos,
        conveniosDescontos,
        convenioToReprove,
        setConvenioToReprove,
        convenioToActivate,
        setConvenioToActivate,
        numeroContrato,
        setNumeroContrato,
        fetchConvenios,
        toast
    };
}
