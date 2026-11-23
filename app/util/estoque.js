export function obterStatusEstoque(estoque) {
    const qtd = Number(estoque ?? 0);

    if (qtd <= 0) {
        return { tipo: 'esgotado', texto: 'Esgotado', classe: 'badge-esgotado' };
    }

    if (qtd <= 5) {
        return { tipo: 'baixo', texto: `Estoque baixo (${qtd})`, classe: 'badge-baixo' };
    }

    return { tipo: 'disponivel', texto: `Disponível (${qtd})`, classe: 'badge-disponivel' };
};