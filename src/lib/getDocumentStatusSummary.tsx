import { Badge } from "@/components/ui/badge";

 export const getDocumentStatusSummary = (documentos) => {
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
  