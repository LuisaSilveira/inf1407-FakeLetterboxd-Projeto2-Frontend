"use strict";
/**
 * script.ts — Lista de avaliações (index.html).
 * Renderiza cards no estilo do projeto 1, com modal de confirmação de exclusão
 * e barra de filtros (busca_titulo, busca_pessoa, tipo_midia, genero_midia, ordem_nota).
 */
let idParaApagar = null;
let usuarioLogado = null;
onload = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        location.href = "accounts/login.html";
        return;
    }
    carregarUsuarioLogado()
        .then(() => exibeListaDeAvaliacoes())
        .catch((error) => {
        console.error("Erro ao identificar usuário logado:", error);
        return exibeListaDeAvaliacoes();
    });
    configurarModal();
    configurarFiltros();
};
async function carregarUsuarioLogado() {
    var _a, _b;
    const response = await authFetch(backendAddress + "accounts/whoami/");
    if (!response.ok)
        return;
    const dados = await response.json();
    usuarioLogado = (_b = (_a = dados.username) !== null && _a !== void 0 ? _a : dados.usuario) !== null && _b !== void 0 ? _b : null;
}
/**
 * Configura o modal de confirmação de exclusão.
 */
function configurarModal() {
    const modal = document.getElementById("modal-apagar");
    document.getElementById("modal-cancelar").addEventListener("click", () => {
        modal.classList.remove("ativo");
        idParaApagar = null;
    });
    document.getElementById("modal-confirmar").addEventListener("click", async () => {
        if (idParaApagar === null)
            return;
        modal.classList.remove("ativo");
        await apagarAvaliacao(idParaApagar);
        idParaApagar = null;
    });
}
/**
 * Configura os eventos dos botões de filtrar e limpar.
 */
function configurarFiltros() {
    const btnFiltrar = document.getElementById("btn-filtrar");
    const btnLimpar = document.getElementById("btn-limpar");
    btnFiltrar === null || btnFiltrar === void 0 ? void 0 : btnFiltrar.addEventListener("click", () => {
        exibeListaDeAvaliacoes(lerFiltros());
    });
    btnLimpar === null || btnLimpar === void 0 ? void 0 : btnLimpar.addEventListener("click", () => {
        limparCamposFiltro();
        exibeListaDeAvaliacoes();
    });
    // Permite filtrar ao pressionar Enter em qualquer input de texto do painel
    const inputs = document.querySelectorAll("#filtros-panel input[type='text']");
    inputs.forEach(input => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                exibeListaDeAvaliacoes(lerFiltros());
            }
        });
    });
}
/**
 * Lê os valores atuais dos controles de filtro e retorna um objeto de parâmetros.
 * :return: objeto com chave=parâmetro, valor=string
 */
function lerFiltros() {
    var _a, _b, _c, _d, _e;
    const params = {};
    const buscaTitulo = (_a = document.getElementById("filtro-titulo")) === null || _a === void 0 ? void 0 : _a.value.trim();
    if (buscaTitulo)
        params["busca_titulo"] = buscaTitulo;
    const buscaPessoa = (_b = document.getElementById("filtro-pessoa")) === null || _b === void 0 ? void 0 : _b.value.trim();
    if (buscaPessoa)
        params["busca_pessoa"] = buscaPessoa;
    const tipoMidia = (_c = document.getElementById("filtro-tipo")) === null || _c === void 0 ? void 0 : _c.value;
    if (tipoMidia)
        params["tipo_midia"] = tipoMidia;
    const generoMidia = (_d = document.getElementById("filtro-genero")) === null || _d === void 0 ? void 0 : _d.value;
    if (generoMidia)
        params["genero_midia"] = generoMidia;
    const ordemNota = (_e = document.getElementById("filtro-ordem")) === null || _e === void 0 ? void 0 : _e.value;
    if (ordemNota)
        params["ordem_nota"] = ordemNota;
    return params;
}
/**
 * Limpa todos os campos do painel de filtros.
 */
function limparCamposFiltro() {
    const titulo = document.getElementById("filtro-titulo");
    const pessoa = document.getElementById("filtro-pessoa");
    const tipo = document.getElementById("filtro-tipo");
    const genero = document.getElementById("filtro-genero");
    const ordem = document.getElementById("filtro-ordem");
    if (titulo)
        titulo.value = "";
    if (pessoa)
        pessoa.value = "";
    if (tipo)
        tipo.value = "";
    if (genero)
        genero.value = "";
    if (ordem)
        ordem.value = "";
    atualizarBuscaInfo({});
}
/**
 * Atualiza o bloco de informações sobre os filtros ativos.
 * :param params: objeto de parâmetros ativos
 */
function atualizarBuscaInfo(params) {
    var _a, _b, _c;
    const infoEl = document.getElementById("busca-info");
    if (!infoEl)
        return;
    const nomesTipo = { filme: "Filmes", serie: "Séries" };
    const nomesGenero = {
        acao: "Ação", comedia: "Comédia", terror: "Terror", romance: "Romance",
        drama: "Drama", ficcao: "Ficção Científica", aventura: "Aventura",
        suspense: "Suspense", animacao: "Animação", documentario: "Documentário",
    };
    const nomesOrdem = { maior: "Maior Nota", menor: "Menor Nota" };
    const partes = [];
    if (params["busca_titulo"])
        partes.push(`Título: <strong>"${params["busca_titulo"]}"</strong>`);
    if (params["busca_pessoa"])
        partes.push(`Usuário: <strong>"${params["busca_pessoa"]}"</strong>`);
    if (params["tipo_midia"])
        partes.push(`Tipo: <strong>${(_a = nomesTipo[params["tipo_midia"]]) !== null && _a !== void 0 ? _a : params["tipo_midia"]}</strong>`);
    if (params["genero_midia"])
        partes.push(`Gênero: <strong>${(_b = nomesGenero[params["genero_midia"]]) !== null && _b !== void 0 ? _b : params["genero_midia"]}</strong>`);
    if (params["ordem_nota"])
        partes.push(`Ordem: <strong>${(_c = nomesOrdem[params["ordem_nota"]]) !== null && _c !== void 0 ? _c : params["ordem_nota"]}</strong>`);
    if (partes.length > 0) {
        infoEl.innerHTML = partes.join(" &bull; ");
        infoEl.classList.remove("oculto");
    }
    else {
        infoEl.innerHTML = "";
        infoEl.classList.add("oculto");
    }
}
/**
 * Remove uma avaliação pelo ID.
 * :param id: ID da avaliação a ser removida
 */
async function apagarAvaliacao(id) {
    try {
        await authFetch(backendAddress + "midias/avaliacao/" + id + "/", { method: "DELETE" });
        await exibeListaDeAvaliacoes(lerFiltros());
    }
    catch (error) {
        console.error("Erro ao apagar avaliação:", error);
    }
}
/**
 * Busca e renderiza os cards de avaliação no grid, aplicando filtros opcionais.
 * :param params: objeto de parâmetros de filtro (opcional)
 */
async function exibeListaDeAvaliacoes(params = {}) {
    const grid = document.getElementById("avaliacoes-grid");
    grid.innerHTML = `<div class="empty-state" id="carregando"><p>Carregando avaliações…</p></div>`;
    atualizarBuscaInfo(params);
    const queryString = new URLSearchParams(params).toString();
    const url = backendAddress + "midias/avaliacao/" + (queryString ? "?" + queryString : "");
    try {
        const response = await authFetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (response.status === 401) {
            location.href = "accounts/login.html";
            return;
        }
        if (!response.ok) {
            grid.innerHTML = `<div class="empty-state"><p>Erro ao carregar avaliações.</p></div>`;
            return;
        }
        const avaliacoes = await response.json();
        grid.innerHTML = "";
        if (avaliacoes.length === 0) {
            const temFiltros = Object.keys(params).length > 0;
            grid.innerHTML = temFiltros
                ? `<div class="empty-state"><p>Nenhuma avaliação encontrada com os filtros aplicados.</p></div>`
                : `<div class="empty-state"><p>Ainda não há avaliações cadastradas.</p></div>`;
            return;
        }
        avaliacoes.forEach((av) => {
            const card = criaCardLista(av);
            grid.appendChild(card);
        });
    }
    catch (error) {
        grid.innerHTML = `<div class="empty-state"><p>Erro de rede.</p></div>`;
        console.error(error);
    }
}
/**
 * Cria um elemento de card de avaliação no estilo do projeto 1.
 * :param av: objeto de avaliação retornado pela API
 * :return: elemento article do card
 */
function criaCardLista(av) {
    var _a, _b, _c;
    const article = document.createElement("article");
    article.className = "avaliacao-card";
    // Poster
    const posterHtml = av["poster_midia"]
        ? `<div class="poster-container"><img src="${av["poster_midia"]}" alt="${(_a = av["titulo_midia"]) !== null && _a !== void 0 ? _a : ""}" class="midia-poster"></div>`
        : "";
    // Data
    const dataHtml = av["assistido_em"]
        ? `<div class="assistido-em">Assistido em ${formatarDataLista(av["assistido_em"])}</div>`
        : "";
    const autor = obterAutorAvaliacaoLista(av);
    const podeEditar = !!usuarioLogado && autor === usuarioLogado;
    const acoesHtml = podeEditar
        ? `
        <div class="card-actions">
            <a href="update.html?id=${av["id"]}" class="btn btn-atualizar">Editar</a>
            <button class="btn btn-apagar" data-id="${av["id"]}">Excluir</button>
        </div>`
        : "";
    article.innerHTML = `
        ${posterHtml}
        <div class="card-content">
            <div class="card-header">
                <span class="pessoa-nome">${autor !== null && autor !== void 0 ? autor : ""}</span>
                <span class="nota">${(_b = av["nota"]) !== null && _b !== void 0 ? _b : ""}</span>
            </div>
            <h2 class="midia-titulo">${(_c = av["titulo_midia"]) !== null && _c !== void 0 ? _c : "—"}</h2>
            ${dataHtml}
            <p class="comentario">${av["comentario"] || "Sem comentário"}</p>
            ${acoesHtml}
        </div>`;
    const btnApagar = article.querySelector(".btn-apagar");
    if (btnApagar) {
        btnApagar.addEventListener("click", (e) => {
            e.stopPropagation();
            idParaApagar = Number(btnApagar.dataset["id"]);
            document.getElementById("modal-apagar").classList.add("ativo");
        });
    }
    const btnAtualizar = article.querySelector(".btn-atualizar");
    if (btnAtualizar) {
        btnAtualizar.addEventListener("click", (e) => e.stopPropagation());
    }
    article.style.cursor = "pointer";
    article.addEventListener("click", () => {
        location.href = "detalheAvaliacao.html?id=" + av["id"];
    });
    return article;
}
function obterAutorAvaliacaoLista(av) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const candidato = (_d = (_c = (_b = (_a = av["usuario"]) !== null && _a !== void 0 ? _a : av["username"]) !== null && _b !== void 0 ? _b : av["user"]) !== null && _c !== void 0 ? _c : av["autor"]) !== null && _d !== void 0 ? _d : av["owner"];
    if (typeof candidato === "string" && candidato.trim())
        return candidato;
    const candidatoObjeto = (_k = (_h = (_f = (_e = av["usuario"]) === null || _e === void 0 ? void 0 : _e.username) !== null && _f !== void 0 ? _f : (_g = av["user"]) === null || _g === void 0 ? void 0 : _g.username) !== null && _h !== void 0 ? _h : (_j = av["autor"]) === null || _j === void 0 ? void 0 : _j.username) !== null && _k !== void 0 ? _k : (_l = av["owner"]) === null || _l === void 0 ? void 0 : _l.username;
    if (typeof candidatoObjeto === "string" && candidatoObjeto.trim())
        return candidatoObjeto;
    return null;
}
/**
 * Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY.
 * :param data: string de data no formato ISO
 * :return: string formatada
 */
function formatarDataLista(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
//# sourceMappingURL=script.js.map