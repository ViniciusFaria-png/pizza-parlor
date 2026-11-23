'use strict'

import { formatarPreco } from './util/formataPreco.js'
import { obterStatusEstoque, calcularResumoEstoque } from './util/estoque.js'
import { configurarImagem, ehUrlImagemValida, configurarPreviewArquivo, resolverImagemPizza } from './util/image.js'
import { normalizarTexto } from './util/normalizarTexto.js'
import { fecharModalAoClicarFora } from './util/modal.js'

const tabVitrine = document.getElementById('tab-vitrine');
const tabAdmin = document.getElementById('tab-admin');
const secVitrine = document.getElementById('sec-vitrine');
const secAdmin = document.getElementById('sec-admin');

const filtroVitrine = document.getElementById('filtro-vitrine');
const buscaPizza = document.getElementById('busca-pizza');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroEstoque = document.getElementById('filtro-estoque');
const btnLimparFiltros = document.getElementById('btn-limpar-filtros');

const vitrineContainer = document.getElementById('vitrine-container');

const statTotal = document.getElementById('stat-total');
const statDisponiveis = document.getElementById('stat-disponiveis');
const statBaixo = document.getElementById('stat-baixo');
const statEsgotadas = document.getElementById('stat-esgotadas');

const formCadastro = document.getElementById('pizza-form');
const inputNome = document.getElementById('nome');
const inputCategoria = document.getElementById('categoria');
const inputTamanho = document.getElementById('tamanho');
const inputPreco = document.getElementById('preco');
const inputEstoque = document.getElementById('estoque');
const inputImagem = document.getElementById('imagem');
const inputImagemFile = document.getElementById('imagem-file');
const previewImagem = document.getElementById('preview-imagem');
const inputIngredientes = document.getElementById('ingredientes');
const btnSalvar = document.getElementById('btn-salvar');

const pizzasTableBody = document.getElementById('pizzas-table-body');
const adminSearchInput = document.getElementById('admin-search-input');

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

const modalEditar = document.getElementById('modal-editar');
const formEditar = document.getElementById('form-editar');
const editId = document.getElementById('edit-id');
const editNome = document.getElementById('edit-nome');
const editCategoria = document.getElementById('edit-categoria');
const editTamanho = document.getElementById('edit-tamanho');
const editPreco = document.getElementById('edit-preco');
const editEstoque = document.getElementById('edit-estoque');
const editImagem = document.getElementById('edit-imagem');
const editImagemFile = document.getElementById('edit-imagem-file');
const editPreviewImagem = document.getElementById('edit-preview-imagem');
const editIngredientes = document.getElementById('edit-ingredientes');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const btnSalvarModal = document.getElementById('btn-salvar-modal');

const dialogExcluir = document.getElementById('delete-confirmation-dialog');
const deleteMessage = document.getElementById('delete-message');
const btnCancelarDelete = document.getElementById('cancel-delete');
const btnConfirmarDelete = document.getElementById('confirm-delete');

let listaPizzas = [];
let pizzaIdParaExcluir = null;

const alternarAba = (aba) => {
    const mostrarVitrine = aba === 'vitrine';
    tabVitrine.classList.toggle('active', mostrarVitrine);
    tabAdmin.classList.toggle('active', !mostrarVitrine);
    secVitrine.classList.toggle('hidden', !mostrarVitrine);
    secAdmin.classList.toggle('hidden', mostrarVitrine);
};

const montarDadosPizza = (campos, imagemUrl) => ({
    nome: campos.nome.value.trim(),
    categoria: campos.categoria.value,
    tamanho: campos.tamanho.value,
    preco: Number(campos.preco.value),
    estoque: parseInt(campos.estoque.value, 10),
    imagem: imagemUrl,
    ingredientes: campos.ingredientes.value.trim()
});

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

const filtrarVitrine = () => {
    const termo = normalizarTexto(buscaPizza.value);
    const categoriaSelecionada = filtroCategoria.value;
    const estoqueSelecionado = filtroEstoque.value;

    const filtradas = listaPizzas.filter((pizza) => {
        const bateuTexto =
            termo === '' ||
            normalizarTexto(pizza.nome).includes(termo) ||
            normalizarTexto(pizza.ingredientes).includes(termo) ||
            normalizarTexto(pizza.categoria).includes(termo);

        const bateuCategoria =
            categoriaSelecionada === '' || pizza.categoria === categoriaSelecionada;

        const bateuEstoque =
            estoqueSelecionado === '' ||
            obterStatusEstoque(pizza.estoque).tipo === estoqueSelecionado;

        return bateuTexto && bateuCategoria && bateuEstoque;
    });

    renderizarVitrine(filtradas);
};

const limparFiltros = () => {
    buscaPizza.value = '';
    filtroCategoria.value = '';
    filtroEstoque.value = '';
    filtrarVitrine();
};

const atualizarResumoEstoque = () => {
    const resumo = calcularResumoEstoque(listaPizzas);

    statTotal.textContent = resumo.total;
    statDisponiveis.textContent = resumo.disponiveis;
    statBaixo.textContent = resumo.baixo;
    statEsgotadas.textContent = resumo.esgotadas;
};

const criarLinhaAdmin = (pizza) => {
    const status = obterStatusEstoque(pizza.estoque);

    const tr = document.createElement('tr');

    const tdFoto = document.createElement('td');
    const img = document.createElement('img');
    img.className = 'table-thumb';
    img.loading = 'lazy';
    configurarImagem(img, pizza.imagem, pizza.nome);
    tdFoto.appendChild(img);

    const tdNome = document.createElement('td');
    const strongNome = document.createElement('strong');
    strongNome.textContent = pizza.nome || 'Sem nome';
    tdNome.appendChild(strongNome);

    const tdCategoria = document.createElement('td');
    const badgeCategoria = document.createElement('span');
    badgeCategoria.className = 'badge badge-categoria';
    badgeCategoria.textContent = pizza.categoria || '-';
    tdCategoria.appendChild(badgeCategoria);

    const tdTamanho = document.createElement('td');
    tdTamanho.textContent = pizza.tamanho || '-';

    const tdPreco = document.createElement('td');
    tdPreco.textContent = formatarPreco(pizza.preco);

    const tdEstoque = document.createElement('td');
    const badgeStatus = document.createElement('span');
    badgeStatus.className = `badge ${status.classe}`;
    badgeStatus.textContent = status.texto;
    tdEstoque.appendChild(badgeStatus);

    const tdAcoes = document.createElement('td');
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.className = 'btn-action edit';
    btnEditar.dataset.id = pizza.id;
    btnEditar.textContent = 'Editar';

    const btnExcluir = document.createElement('button');
    btnExcluir.type = 'button';
    btnExcluir.className = 'btn-action delete';
    btnExcluir.dataset.id = pizza.id;
    btnExcluir.textContent = 'Excluir';

    actionButtons.append(btnEditar, btnExcluir);
    tdAcoes.appendChild(actionButtons);

    tr.append(tdFoto, tdNome, tdCategoria, tdTamanho, tdPreco, tdEstoque, tdAcoes);
    return tr;
};

const renderizarTabelaAdmin = (pizzas) => {
    if (!pizzas || pizzas.length === 0) {
        pizzasTableBody.innerHTML = '<tr><td colspan="7" class="empty">Nenhuma pizza encontrada.</td></tr>';
        return;
    }

    const linhas = pizzas.map(criarLinhaAdmin);
    pizzasTableBody.replaceChildren(...linhas);
};

const filtrarAdmin = () => {
    const termo = normalizarTexto(adminSearchInput ? adminSearchInput.value : '');
    if (!termo) {
        renderizarTabelaAdmin(listaPizzas);
        return;
    }

    const filtradas = listaPizzas.filter(
        (pizza) =>
            normalizarTexto(pizza.nome).includes(termo) ||
            normalizarTexto(pizza.categoria).includes(termo) ||
            normalizarTexto(pizza.tamanho).includes(termo)
    );

    renderizarTabelaAdmin(filtradas);
};

const carregarPizzas = async () => {
    vitrineContainer.innerHTML = '<p class="loading">Carregando cardápio de pizzas...</p>';
    pizzasTableBody.innerHTML = '<tr><td colspan="7" class="loading">Carregando pizzas...</td></tr>';

    try {
        const dados = await getPizzas();
        listaPizzas = Array.isArray(dados) ? dados : [];
        filtrarVitrine();
        atualizarResumoEstoque();
        filtrarAdmin();
    } catch (error) {
        vitrineContainer.innerHTML = '<p class="error">Erro ao carregar dados da API. Tente novamente em instantes.</p>';
        pizzasTableBody.innerHTML = '<tr><td colspan="7" class="error">Erro ao carregar dados da API.</td></tr>';
        console.error('Erro ao carregar pizzas:', error);
    }
};

const abrirModalEditar = async (id) => {
    try {
        let pizza = listaPizzas.find((p) => String(p.id) === String(id));
        if (!pizza) {
            pizza = await getPizza(id);
        }

        editId.value = pizza.id;
        editNome.value = pizza.nome || '';
        editCategoria.value = pizza.categoria || 'Salgada';
        editTamanho.value = pizza.tamanho || 'Grande (8 fatias)';
        editPreco.value = pizza.preco ?? '';
        editEstoque.value = pizza.estoque ?? 0;
        editImagem.value = pizza.imagem || '';
        editIngredientes.value = pizza.ingredientes || '';
        editImagemFile.value = '';

        if (ehUrlImagemValida(pizza.imagem)) {
            configurarImagem(editPreviewImagem, pizza.imagem, pizza.nome);
            editPreviewImagem.classList.remove('hidden');
        } else {
            editPreviewImagem.classList.add('hidden');
            editPreviewImagem.removeAttribute('src');
        }

        modalEditar.showModal();
    } catch (error) {
        alert('Erro ao carregar dados da pizza para edição.');
        console.error('Erro ao abrir edição:', error);
    }
};

const executarExclusao = async (id) => {
    try {
        await deletePizza(id);
        alert('Pizza excluída com sucesso!');
        await carregarPizzas();
    } catch (error) {
        alert('Erro ao excluir pizza.');
        console.error('Erro ao excluir pizza:', error);
    }
};

tabVitrine.addEventListener('click', () => alternarAba('vitrine'));
tabAdmin.addEventListener('click', () => alternarAba('admin'));

if (filtroVitrine) {
    filtroVitrine.addEventListener('submit', (e) => {
        e.preventDefault();
        filtrarVitrine();
    });
}

if (buscaPizza) buscaPizza.addEventListener('input', filtrarVitrine);
if (filtroCategoria) filtroCategoria.addEventListener('change', filtrarVitrine);
if (filtroEstoque) filtroEstoque.addEventListener('change', filtrarVitrine);
if (btnLimparFiltros) btnLimparFiltros.addEventListener('click', limparFiltros);
if (adminSearchInput) adminSearchInput.addEventListener('input', filtrarAdmin);

configurarPreviewArquivo(inputImagemFile, previewImagem);
configurarPreviewArquivo(editImagemFile, editPreviewImagem);

formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const temArquivo = inputImagemFile.files && inputImagemFile.files[0];

    btnSalvar.disabled = true;
    btnSalvar.textContent = temArquivo ? 'Enviando imagem...' : 'Salvando...';

    try {
        const imagemUrl = await resolverImagemPizza(inputImagemFile, inputImagem);
        const novaPizza = montarDadosPizza(
            {
                nome: inputNome,
                categoria: inputCategoria,
                tamanho: inputTamanho,
                preco: inputPreco,
                estoque: inputEstoque,
                ingredientes: inputIngredientes
            },
            imagemUrl
        );

        await postPizza(novaPizza);
        alert('Pizza cadastrada com sucesso!');
        formCadastro.reset();
        await carregarPizzas();
    } catch (error) {
        alert('Erro ao cadastrar pizza.');
        console.error('Erro ao cadastrar pizza:', error);
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar Pizza';
    }
});

formCadastro.addEventListener('reset', () => {
    previewImagem.classList.add('hidden');
    previewImagem.removeAttribute('src');
});

pizzasTableBody.addEventListener('click', (e) => {
    const botao = e.target.closest('.btn-action');
    if (!botao) return;

    const id = botao.dataset.id;
    if (!id) return;

    if (botao.classList.contains('edit')) {
        abrirModalEditar(id);
    } else if (botao.classList.contains('delete')) {
        pizzaIdParaExcluir = id;
        const pizza = listaPizzas.find((p) => String(p.id) === String(id));
        deleteMessage.textContent = pizza
            ? `Tem certeza de que deseja excluir a pizza "${pizza.nome}"?`
            : 'Tem certeza de que deseja excluir esta pizza?';
        dialogExcluir.showModal();
    }
});

formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const temArquivo = editImagemFile.files && editImagemFile.files[0];

    btnSalvarModal.disabled = true;
    btnSalvarModal.textContent = temArquivo ? 'Enviando imagem...' : 'Salvando...';

    try {
        const imagemUrl = await resolverImagemPizza(editImagemFile, editImagem);
        const pizzaAtualizada = {
            id: editId.value,
            ...montarDadosPizza(
                {
                    nome: editNome,
                    categoria: editCategoria,
                    tamanho: editTamanho,
                    preco: editPreco,
                    estoque: editEstoque,
                    ingredientes: editIngredientes
                },
                imagemUrl
            )
        };

        await putPizza(pizzaAtualizada);
        alert('Pizza atualizada com sucesso!');
        modalEditar.close();
        await carregarPizzas();
    } catch (error) {
        alert('Erro ao atualizar pizza.');
        console.error('Erro ao atualizar pizza:', error);
    } finally {
        btnSalvarModal.disabled = false;
        btnSalvarModal.textContent = 'Salvar Alterações';
    }
});

if (btnFecharDetalhes) btnFecharDetalhes.addEventListener('click', () => modalDetalhes.close());
if (btnOkDetalhes) btnOkDetalhes.addEventListener('click', () => modalDetalhes.close());
fecharModalAoClicarFora(modalDetalhes);

if (btnFecharModal) btnFecharModal.addEventListener('click', () => modalEditar.close());
if (btnCancelarModal) btnCancelarModal.addEventListener('click', () => modalEditar.close());
fecharModalAoClicarFora(modalEditar);

if (btnConfirmarDelete) {
    btnConfirmarDelete.addEventListener('click', async () => {
        if (!pizzaIdParaExcluir) return;
        const id = pizzaIdParaExcluir;
        pizzaIdParaExcluir = null;
        dialogExcluir.close();
        await executarExclusao(id);
    });
}

if (btnCancelarDelete) {
    btnCancelarDelete.addEventListener('click', () => {
        dialogExcluir.close();
        pizzaIdParaExcluir = null;
    });
}

fecharModalAoClicarFora(dialogExcluir, () => {
    pizzaIdParaExcluir = null;
});

carregarPizzas();
