"use strict";
/**
 * script.ts — Lista de avaliações (index.html).
 * Renderiza cards no estilo do projeto 1, com modal de confirmação de exclusão.
 */
let idParaApagar = null;
onload = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        location.href = "accounts/login.html";
        return;
    }
    exibeListaDeAvaliacoes();
    configurarModal();
};
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
    var _a, _b, _c, _d, _e;
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
    // Ações (apenas para o próprio usuário — o backend já filtra, mas mostramos sempre pois é a lista do próprio user)
    const acoesHtml = `
        <div class="card-actions">
            <a href="update.html?id=${av["id"]}" class="btn btn-atualizar">Editar</a>
            <button class="btn btn-apagar" data-id="${av["id"]}">Excluir</button>
        </div>`;
    article.innerHTML = `
        ${posterHtml}
        <div class="card-content">
            <div class="card-header">
                <span class="pessoa-nome">${(_c = (_b = av["usuario"]) !== null && _b !== void 0 ? _b : av["titulo_midia"]) !== null && _c !== void 0 ? _c : ""}</span>
                <span class="nota">${(_d = av["nota"]) !== null && _d !== void 0 ? _d : ""}</span>
            </div>
            <h2 class="midia-titulo">${(_e = av["titulo_midia"]) !== null && _e !== void 0 ? _e : "—"}</h2>
            ${dataHtml}
            <p class="comentario">${av["comentario"] || "Sem comentário"}</p>
            ${acoesHtml}
        </div>`;
    // Botão de excluir abre o modal
    const btnApagar = article.querySelector(".btn-apagar");
    btnApagar.addEventListener("click", (e) => {
        e.stopPropagation();
        idParaApagar = Number(btnApagar.dataset["id"]);
        document.getElementById("modal-apagar").classList.add("ativo");
    });
    return article;
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