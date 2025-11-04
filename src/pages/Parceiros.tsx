import { DialogEditarParceiro } from "@/components/parceiros/DialogEditarParceiro";
import { DialogInativarParceiro } from "@/components/parceiros/DialogInativarParceiro";
import { DialogNovoParceiro } from "@/components/parceiros/DialogNovoParceiro";
import { DialogVisualizarParceiro } from "@/components/parceiros/DialogVisualizarParceiro";
import { ParceirosFilters } from "@/components/parceiros/ParceirosFilters";
import { ParceirosHeader } from "@/components/parceiros/ParceirosHeader";
import { ParceirosTable } from "@/components/parceiros/ParceirosTable";
import { useToast } from "@/hooks/use-toast";
import { useParceiros } from "@/hooks/useParceiros";
import { useState } from "react";



const ParceirosPage = () => {
  const { listQuery, createMutation, updateMutation, inativarMutation } = useParceiros();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openNew, setOpenNew] = useState(false);
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogs, setDialogs] = useState({
    view: false,
    edit: false,
    inativar: false,
  });

  const parceiros = listQuery.data || [];

  const filteredParceiros = parceiros.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf_cnpj.includes(searchTerm) ||
      p.categorias?.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "ativo" && p.ativo) ||
      (statusFilter === "inativo" && !p.ativo);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <ParceirosHeader onAdd={() => setOpenNew(true)} />

      <ParceirosFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <ParceirosTable
        parceiros={filteredParceiros}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onView={(p) => {
          setSelectedParceiro(p);
          setDialogs((d) => ({ ...d, view: true }));
        }}
        onEdit={(p) => {
          setSelectedParceiro(p);
          setDialogs((d) => ({ ...d, edit: true }));
        }}
        onInativar={(p) => {
          setSelectedParceiro(p);
          setDialogs((d) => ({ ...d, inativar: true }));
        }}
      />

      <DialogNovoParceiro
        open={openNew}
        onOpenChange={setOpenNew}
        onCreate={async (values) => {
          try {
            await createMutation.mutateAsync(values);
            toast({ title: "Parceiro criado com sucesso" });
            setOpenNew(false);
          } catch (error) {
            toast({ title: "Erro", description: error?.message, variant: "destructive" });
          }
        }}
        loading={createMutation.isPending}
      />

      <DialogEditarParceiro
        open={dialogs.edit}
        onOpenChange={(v) => setDialogs((d) => ({ ...d, edit: v }))}
        parceiro={selectedParceiro}
        onUpdate={async (id, values) => {
          try {
            await updateMutation.mutateAsync({ id, input: values });
            toast({ title: "Parceiro atualizado com sucesso" });
            setDialogs((d) => ({ ...d, edit: false }));
          } catch (error) {
            toast({ title: "Erro", description: error?.message, variant: "destructive" });
          }
        }}
        loading={updateMutation.isPending}
      />

      <DialogVisualizarParceiro
        open={dialogs.view}
        onOpenChange={(v) => setDialogs((d) => ({ ...d, view: v }))}
        parceiro={selectedParceiro}
      />

      <DialogInativarParceiro
        open={dialogs.inativar}
        onOpenChange={(v) => setDialogs((d) => ({ ...d, inativar: v }))}
        parceiro={selectedParceiro}
        onConfirm={async () => {
          try {
            await inativarMutation.mutateAsync(selectedParceiro.id);
            toast({ title: "Parceiro inativado com sucesso" });
          } catch {
            toast({ title: "Erro ao inativar parceiro", variant: "destructive" });
          }
          setDialogs((d) => ({ ...d, inativar: false }));
        }}
      />
    </div>
  );
};

export default ParceirosPage;
