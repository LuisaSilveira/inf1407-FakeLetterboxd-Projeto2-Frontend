"use strict";
/**
 * script.ts — Lista de avaliações (index.html).
 * Renderiza cards no estilo do projeto 1, com modal de confirmação de exclusão.
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
 * Remove uma avaliação pelo ID.
 * :param id: ID da avaliação a ser removida
 */
async function apagarAvaliacao(id) {
    try {
        await authFetch(backendAddress + "midias/avaliacao/" + id + "/", { method: "DELETE" });
        await exibeListaDeAvaliacoes();
    }
    catch (error) {
        console.error("Erro ao apagar avaliação:", error);
    }
}
/**
 * Busca e renderiza os cards de avaliação no grid.
 */
async function exibeListaDeAvaliacoes() {
    const grid = document.getElementById("avaliacoes-grid");
    grid.innerHTML = `<div class="empty-state" id="carregando"><p>Carregando avaliações…</p></div>`;
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/", {
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
            grid.innerHTML = `<div class="empty-state"><p>Ainda não há avaliações cadastradas.</p></div>`;
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
    const posterHtml = av["poster_url"]
        ? `<div class="poster-container"><img src="${av["poster_url"]}" alt="${(_a = av["titulo_midia"]) !== null && _a !== void 0 ? _a : ""}" class="midia-poster"></div>`
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