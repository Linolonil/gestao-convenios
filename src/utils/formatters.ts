export const formatDataCadastro = (createdAt?: string) => {
    if (!createdAt) return '-';
    return new Date(createdAt).toLocaleDateString('pt-BR');
};

export const formatDataHora = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const formatDataExpiracao = (dateString?: string) => {
    if (!dateString) return { text: '-', isExpired: false };
    const date = new Date(dateString);
    const now = new Date();
    const isExpired = date < now;

    const formatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return { text: formatted, isExpired };
};
