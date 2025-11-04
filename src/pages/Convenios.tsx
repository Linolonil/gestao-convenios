import { ConveniosCards } from "@/components/convenio/ConveniosCards";
import { ConveniosHeader } from "@/components/convenio/ConveniosHeader";
import ConveniosPanel from "@/components/convenio/ConveniosPanel";
import { useConvenioActions } from "@/hooks/useConvenioActions";
import { useConvenios } from "@/hooks/useConvenios";
import { formatDataCadastro, formatDataExpiracao, formatDataHora } from "@/utils/formatters";
import { statusConfig } from "@/utils/statusConfig";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


const Convenios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
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
    fetchConvenios
  } = useConvenios();

  const {
    handleAprovarConvenio,
    handleReprovarConvenio,
    handleAtivarConvenio,
  } = useConvenioActions({
    fetchConvenios,
    setConvenioToReprove,
    convenioToReprove,
    convenioToActivate,
    setConvenioToActivate,
    numeroContrato,
    setNumeroContrato,
    setSelectedStatus,
  });

  useEffect(() => {
    if (location.state?.selectedStatus) {
      setSelectedStatus(location.state.selectedStatus);
    }
  }, [location.state]);

  // Filtro e paginação
  const filteredConvenios = convenios.filter(c => {
    if (selectedStatus && c.status !== selectedStatus) return false;
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const nome = c.parceiro?.nome?.toLowerCase() || '';
    const numero = (c.numero || `#${c.id_contrato}`).toLowerCase();
    const cpfCnpj = (c.parceiro?.cpf || c.parceiro?.cnpj || '').toLowerCase();
    return nome.includes(search) || numero.includes(search) || cpfCnpj.includes(search);
  });

  const totalPages = Math.ceil(filteredConvenios.length / itemsPerPage);
  const paginatedConvenios = filteredConvenios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => setCurrentPage(1), [searchTerm, selectedStatus]);

  if (isLoading)
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );



  if (selectedStatus)
    return (
      <ConveniosPanel
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        paginatedConvenios={paginatedConvenios}
        filteredConvenios={filteredConvenios}
        conveniosServicos={conveniosServicos}
        conveniosDescontos={conveniosDescontos}
        statusConfig={statusConfig}
        navigate={navigate}
        formatDataHora={formatDataHora}
        formatDataCadastro={formatDataCadastro}
        formatDataExpiracao={formatDataExpiracao}
        fetchConvenios={fetchConvenios}
        setConvenioToReprove={setConvenioToReprove}
        setConvenioToActivate={setConvenioToActivate}
        numeroContrato={numeroContrato}
        setNumeroContrato={setNumeroContrato}
        convenioToReprove={convenioToReprove}
        convenioToActivate={convenioToActivate}
        handleAprovarConvenio={handleAprovarConvenio}
        handleReprovarConvenio={handleReprovarConvenio}
        handleAtivarConvenio={handleAtivarConvenio}
      />
    );

  return (
    <div className="p-6 space-y-6">
      <ConveniosHeader navigate={navigate} />
      <ConveniosCards
        statusConfig={statusConfig}
        convenios={convenios}
        setSelectedStatus={setSelectedStatus}
      />
    </div>
  );
};

export default Convenios;
