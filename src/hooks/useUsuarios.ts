import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    ativo: boolean;
    perfil: "ADMIN" | "ANALISTA" | "ESTAGIARIO";
    created_at: string;
}

export const useUsuarios = () => {
    const { toast } = useToast();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsuarios = async () => {
        try {
            const { data, error } = await supabase
                .from("usuarios")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            setUsuarios(
                (data || []).map((u) => ({
                    id: u.id_usuario,
                    nome: u.nome,
                    email: u.email,
                    senha: u.senha,
                    ativo: u.ativo,
                    perfil: u.perfil,
                    created_at: u.created_at,
                }))
            );
        } catch (err) {
            console.error(err);
            toast({
                title: "Erro",
                description: "Erro ao carregar usuários",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return { usuarios, setUsuarios, fetchUsuarios, loading };
};
