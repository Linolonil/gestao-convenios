import LoadingSkeleton from "@/components/layout/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { FileText, FolderOpen, Users } from "lucide-react";

const Dashboard = () => {
  const { loading, stats, recentConvenios, conveniosServicos } = useDashboardData();

  const statusColors = {
    EM_ANALISE: "secondary",
    APROVADO: "default",
    REJEITADO: "destructive",
    ATIVO: "default",
    INATIVO: "secondary",
  };

  const statsCards = [
    {
      title: "Total de Convênios",
      value: stats.totalConvenios?.toString() || "0",
      subtitle: "Convênios cadastrados",
      icon: FileText,
    },
    {
      title: "Convênios Ativos",
      value: stats.conveniosAtivos?.toString() || "0",
      subtitle: "Em funcionamento",
      icon: FileText,
    },
    {
      title: "Parceiros",
      value: stats.parceiros?.toString() || "0",
      subtitle: "Empresas parceiras",
      icon: Users,
    },
    {
      title: "Documentos Pendentes",
      value: stats.documentos?.toString() || "0",
      subtitle: "Aguardando análise",
      icon: FolderOpen,
    },
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao CAAAM - Gestão de Convênios
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-primary mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Convênios Recentes */}
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
                <div
                  key={convenio.id_contrato}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {convenio.parceiros?.nome || "Parceiro não identificado"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Contrato {convenio.numero || convenio.id_contrato}{" "}
                      {conveniosServicos[convenio.id_contrato]
                        ? `- ${conveniosServicos[convenio.id_contrato]}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={statusColors[convenio.status] || "secondary"}
                    >
                      {convenio.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(convenio.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">
                Nenhum convênio encontrado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
