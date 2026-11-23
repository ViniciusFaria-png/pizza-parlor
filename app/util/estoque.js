export function obterStatusEstoque(estoque) {
    const qtd = Number(estoque ?? 0);

    if (qtd <= 0) {
        return { tipo: 'esgotado', texto: 'Esgotado', classe: 'badge-esgotado' };
    }

    if (qtd <= 5) {
        return { tipo: 'baixo', texto: `Estoque baixo (${qtd})`, classe: 'badge-baixo' };
    }

    return { tipo: 'disponivel', texto: `Disponível (${qtd})`, classe: 'badge-disponivel' };
}

export function calcularResumoEstoque(pizzas) {
    const lista = Array.isArray(pizzas) ? pizzas : [];
    let disponiveis = 0;
    let baixo = 0;
    let esgotadas = 0;

    lista.forEach((pizza) => {
        const { tipo } = obterStatusEstoque(pizza.estoque);
        if (tipo === 'disponivel') disponiveis += 1;
        else if (tipo === 'baixo') baixo += 1;
        else esgotadas += 1;
    });

    return {
        total: lista.length,
        disponiveis,
        baixo,
        esgotadas
    };
}
