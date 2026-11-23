'use strict'

import { formatarPreco } from './util/formataPreco.js'
import { obterStatusEstoque } from './util/estoque.js'
import { configurarImagem } from './util/image.js'

const tabVitrine = document.getElementById('tab-vitrine');
const tabAdmin = document.getElementById('tab-admin');
const secVitrine = document.getElementById('sec-vitrine');
const secAdmin = document.getElementById('sec-admin');

const vitrineContainer = document.getElementById('vitrine-container');

const modalDetalhes = document.getElementById('modal-detalhes');
const detalheNome = document.getElementById('detalhe-nome');
const detalheImagem = document.getElementById('detalhe-imagem');
const detalheCategoria = document.getElementById('detalhe-categoria');
const detalheStatus = document.getElementById('detalhe-status');
const detalheTamanho = document.getElementById('detalhe-tamanho');
const detalheEstoque = document.getElementById('detalhe-estoque');
const detalhePreco = document.getElementById('detalhe-preco');
const detalheIngredientes = document.getElementById('detalhe-ingredientes');
const btnFecharDetalhes = document.getElementById('btn-fechar-detalhes');
const btnOkDetalhes = document.getElementById('btn-ok-detalhes');

let listaPizzas = [];

const alternarAba = (aba) => {
    const mostrarVitrine = aba === 'vitrine';
    tabVitrine.classList.toggle('active', mostrarVitrine);
    tabAdmin.classList.toggle('active', !mostrarVitrine);
    secVitrine.classList.toggle('hidden', !mostrarVitrine);
    secAdmin.classList.toggle('hidden', mostrarVitrine);
};

const abrirModalDetalhes = (pizza) => {
    const qtd = Number(pizza.estoque ?? 0);
    const status = obterStatusEstoque(qtd);

    detalheNome.textContent = pizza.nome || 'Detalhes da Pizza';
    configurarImagem(detalheImagem, pizza.imagem, pizza.nome);

    detalheCategoria.textContent = pizza.categoria || '-';
    detalheStatus.className = `badge ${status.classe}`;
    detalheStatus.textContent = status.texto;

    detalheTamanho.textContent = pizza.tamanho || '-';
    detalheEstoque.textContent =
        qtd === 0
            ? '0 unidades (Esgotado)'
            : qtd === 1
                ? '1 unidade'
                : `${qtd} unidades`;

    detalhePreco.textContent = formatarPreco(pizza.preco);
    detalheIngredientes.textContent = pizza.ingredientes || '-';

    modalDetalhes.showModal();
};

const criarCardPizza = (pizza) => {
    const status = obterStatusEstoque(pizza.estoque);

    const card = document.createElement('article');
    card.className = 'pizza-card';
    if (status.tipo === 'esgotado') {
        card.classList.add('esgotado');
    }

    const img = document.createElement('img');
    img.className = 'pizza-card-img';
    img.loading = 'lazy';
    configurarImagem(img, pizza.imagem, pizza.nome);

    const body = document.createElement('div');
    body.className = 'pizza-card-body';

    const badges = document.createElement('div');
    badges.className = 'pizza-card-badges';

    const badgeCategoria = document.createElement('span');
    badgeCategoria.className = 'badge badge-categoria';
    badgeCategoria.textContent = pizza.categoria || 'Pizza';

    const badgeStatus = document.createElement('span');
    badgeStatus.className = `badge ${status.classe}`;
    badgeStatus.textContent = status.texto;

    badges.append(badgeCategoria, badgeStatus);

    const titulo = document.createElement('h3');
    titulo.className = 'pizza-card-title';
    titulo.textContent = pizza.nome || 'Sem nome';

    const tamanho = document.createElement('span');
    tamanho.className = 'pizza-card-tamanho';
    tamanho.textContent = pizza.tamanho || '-';

    const ingredientes = document.createElement('p');
    ingredientes.className = 'pizza-card-ingredientes';
    ingredientes.textContent = pizza.ingredientes || '';

    const footer = document.createElement('div');
    footer.className = 'pizza-card-footer';

    const preco = document.createElement('strong');
    preco.className = 'pizza-card-preco';
    preco.textContent = formatarPreco(pizza.preco);

    const verDetalhes = document.createElement('span');
    verDetalhes.className = 'pizza-card-tamanho';
    verDetalhes.textContent = 'Ver detalhes';

    footer.append(preco, verDetalhes);
    body.append(badges, titulo, tamanho, ingredientes, footer);
    card.append(img, body);

    card.addEventListener('click', () => abrirModalDetalhes(pizza));

    return card;
};

const renderizarVitrine = (pizzas) => {
    if (!pizzas || pizzas.length === 0) {
        vitrineContainer.innerHTML = '<p class="empty">Nenhuma pizza encontrada no cardápio.</p>';
        return;
    }

    const cards = pizzas.map(criarCardPizza);
    vitrineContainer.replaceChildren(...cards);
};

const carregarPizzas = async () => {
    vitrineContainer.innerHTML = '<p class="loading">Carregando cardápio de pizzas...</p>';
    try {
        const dados = await getPizzas();
        listaPizzas = Array.isArray(dados) ? dados : [];
        renderizarVitrine(listaPizzas);
    } catch (error) {
        vitrineContainer.innerHTML = '<p class="error">Erro ao carregar dados da API. Tente novamente em instantes.</p>';
        console.error('Erro ao carregar pizzas:', error);
    }
};

tabVitrine.addEventListener('click', () => alternarAba('vitrine'));
tabAdmin.addEventListener('click', () => alternarAba('admin'));

if (btnFecharDetalhes) {
    btnFecharDetalhes.addEventListener('click', () => modalDetalhes.close());
}

if (btnOkDetalhes) {
    btnOkDetalhes.addEventListener('click', () => modalDetalhes.close());
}

if (modalDetalhes) {
    modalDetalhes.addEventListener('click', (e) => {
        if (e.target === modalDetalhes) {
            modalDetalhes.close();
        }
    });
}

carregarPizzas();
