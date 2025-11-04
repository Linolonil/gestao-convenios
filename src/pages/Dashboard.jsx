import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Users, 
  FolderOpen
} from "lucide-react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [recentConvenios, setRecentConvenios] = useState([]);
  const [stats, setStats] = useState({
    totalConvenios: 0,
    conveniosAtivos: 0,
    parceiros: 0,
    documentos: 0
  });
  const [loading, setLoading] = useState(true);
  const [conveniosServicos, setConveniosServicos] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { count: totalConvenios } = await supabase
          .from('contratos')
          .select('*', { count: 'exact', head: true });

        const { count: conveniosAtivos } = await supabase
          .from('contratos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ATIVO');

        const { count: parceiros } = await supabase
          .from('parceiros')
          .select('*', { count: 'exact', head: true });

        const { count: documentos } = await supabase
          .from('documentos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente');

        const { data: conveniosRecentes, error } = await supabase
          .from('contratos')
          .select(`
            id_contrato,
            numero,
            status,
            created_at,
            parceiros (
              nome
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Erro ao carregar convênios:', error);
          return;
        }

        setStats({
          totalConvenios: totalConvenios || 0,
          conveniosAtivos: conveniosAtivos || 0,
          parceiros: parceiros || 0,
          documentos: documentos || 0
        });

        setRecentConvenios(conveniosRecentes || []);
        
        // Otimização: Buscar todos os serviços de uma vez
        if (conveniosRecentes && conveniosRecentes.length > 0) {
          const contratoIds = conveniosRecentes.map(c => c.id_contrato);
          const { data: servicosData } = await supabase
            .from('servicos_oferecidos')
            .select(`
              id_contrato,
              desconto_concedido,
              servicos (
                nome
              )
            `)
            .in('id_contrato', contratoIds);
          
          // Agrupar serviços por contrato
          const servicosMap = {};
          if (servicosData) {
            servicosData.forEach(s => {
              if (!servicosMap[s.id_contrato]) {
                servicosMap[s.id_contrato] = [];
              }
              const nome = s.servicos?.nome;
              const desconto = s.desconto_concedido;
              if (nome) {
                servicosMap[s.id_contrato].push(
                  desconto > 0 ? `${nome} (${desconto}% desconto)` : nome
                );
              }
            });
            
            // Converter arrays em strings
            Object.keys(servicosMap).forEach(key => {
              servicosMap[key] = servicosMap[key].join(', ');
            });
          }
          setConveniosServicos(servicosMap);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do dashboard. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusColors = {
    EM_ANALISE: 'secondary',
    APROVADO: 'default',
    REJEITADO: 'destructive',
    ATIVO: 'default',
    INATIVO: 'secondary'
  };

  const statsCards = [
    {
      title: "Total de Convênios",
      value: stats.totalConvenios.toString(),
      subtitle: "Convênios cadastrados",
      icon: FileText,
    },
    {
      title: "Convênios Ativos", 
      value: stats.conveniosAtivos.toString(),
      subtitle: "Em funcionamento",
      icon: FileText,
    },
    {
      title: "Parceiros",
      value: stats.parceiros.toString(),
      subtitle: "Empresas parceiras",
      icon: Users,
    },
    {
      title: "Documentos Pendentes",
      value: stats.documentos.toString(),
      subtitle: "Aguardando análise",
      icon: FolderOpen,
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao CAAAM - Gestão de Convênios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-primary mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Convênios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentConvenios.length > 0 ? (
            <div className="space-y-4">
              {recentConvenios.map((convenio) => (
                <div key={convenio.id_contrato} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{convenio.parceiros?.nome || 'Parceiro não identificado'}</h4>
                    <p className="text-sm text-muted-foreground">
                      Contrato {convenio.numero || convenio.id_contrato} {conveniosServicos[convenio.id_contrato] ? `- ${conveniosServicos[convenio.id_contrato]}` : ''}
                    </p>
                  </div>
                   <div className="flex flex-col items-end gap-2">
                    <Badge variant={statusColors[convenio.status] || 'secondary'}>
                      {convenio.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(convenio.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">Nenhum convênio encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
