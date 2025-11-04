export type UsuarioFormData = {
    nome: string;
    email: string;
    senha: string;
    perfil: "ADMIN" | "ANALISTA" | "ESTAGIARIO";
    ativo: boolean;
};
