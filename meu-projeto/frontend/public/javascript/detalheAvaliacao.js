"use strict";
/**
 * detalheAvaliacao.ts — Página de detalhes de uma avaliação (detalheAvaliacao.html).
 * Busca os dados pelo id da query string e renderiza na página.
 */
onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        location.href = "accounts/login.html";
        return;
    }
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) {
        location.href = "/";
        return;
    }
    document.getElementById("btn-voltar").addEventListener("click", () => history.back());
    const usuarioLogado = await buscarUsuarioLogado();
    await carregarDetalheAvaliacao(Number(id), usuarioLogado);
};
async function buscarUsuarioLogado() {
    var _a;
    try {
        const r = await authFetch(backendAddress + "accounts/perfil/");
        if (!r.ok)
            return null;
        const d = await r.json();
        return (_a = d.username) !== null && _a !== void 0 ? _a : null;
    }
    catch (_b) {
        return null;
    }
}
async function carregarDetalheAvaliacao(id, usuarioLogado) {
    const main = document.getElementById("detalhe-main");
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/" + id + "/");
        if (response.status === 401) {
            location.href = "accounts/login.html";
            return;
        }
        if (response.status === 404) {
            main.innerHTML = `<div class="detalhe-erro"><p>Avaliação não encontrada.</p><a href="/" class="btn-back">← Voltar à lista</a></div>`;
            return;
        }
        if (!response.ok) {
            main.innerHTML = `<div class="detalhe-erro"><p>Erro ao carregar avaliação.</p></div>`;
            return;
        }
        const av = await response.json();
        renderizarDetalhe(av, main, usuarioLogado, id);
    }
    catch (_a) {
        main.innerHTML = `<div class="detalhe-erro"><p>Erro de rede.</p></div>`;
    }
}
function renderizarDetalhe(av, main, usuarioLogado, id) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const posterSrc = (_b = (_a = av["poster_midia"]) !== null && _a !== void 0 ? _a : av["poster_url"]) !== null && _b !== void 0 ? _b : "";
    const titulo = (_c = av["titulo_midia"]) !== null && _c !== void 0 ? _c : "—";
    const tipo = (_d = av["tipo_midia"]) !== null && _d !== void 0 ? _d : "";
    const genero = (_e = av["genero_midia"]) !== null && _e !== void 0 ? _e : "";
    const nota = av["nota"] != null ? String(av["nota"]) : "";
    const comentario = (_f = av["comentario"]) !== null && _f !== void 0 ? _f : "";
    const sinopse = (_h = (_g = av["sinopse"]) !== null && _g !== void 0 ? _g : av["sinopse_midia"]) !== null && _h !== void 0 ? _h : "";
    const autor = (_j = av["username"]) !== null && _j !== void 0 ? _j : "";
    const assistido = av["assistido_em"] ? "Assistido em " + formatarDataDetalhe(av["assistido_em"]) : "";
    const avaliado = av["dt_avaliacao"] ? "Avaliado em " + formatarDataDetalhe(av["dt_avaliacao"].split("T")[0]) : "";
    const atualizado = av["dt_atualizacao"] ? "Atualizado em " + formatarDataDetalhe(av["dt_atualizacao"].split("T")[0]) : "";
    const ehDono = !!usuarioLogado && autor === usuarioLogado;
    const posterHtml = posterSrc
        ? `<img src="${posterSrc}" alt="${titulo}" class="det-poster">`
        : `<div class="det-poster-placeholder"></div>`;
    const sinopseHtml = sinopse
        ? `<div class="det-secao">
                <h3 class="det-secao-titulo">Sinopse</h3>
                <p class="det-sinopse">${sinopse}</p>
           </div>`
        : "";
    const acoesHtml = ehDono
        ? `<div class="det-acoes">
                <a href="update.html?id=${id}" class="btn-det-editar">Editar</a>
                <button class="btn-det-deletar" id="btn-deletar-detalhe">Excluir</button>
           </div>`
        : "";
    main.innerHTML = `
        <div class="detalhe-card">
            <div class="det-topo">
                <div class="det-poster-wrap">${posterHtml}</div>
                <div class="det-info">
                    <h1 class="det-titulo">${titulo}</h1>
                    <div class="det-meta">
                        ${tipo ? `<span class="det-badge">${tipo}</span>` : ""}
                        ${genero ? `<span class="det-badge">${genero}</span>` : ""}
                        ${nota ? `<span class="det-nota">${nota}</span>` : ""}
                    </div>
                    ${sinopseHtml}
                    <div class="det-secao">
                        <h3 class="det-secao-titulo">Comentário${autor ? " de " + autor : ""}</h3>
                        <p class="det-comentario">${comentario || "Sem comentário"}</p>
                    </div>
                    <div class="det-datas">
                        ${assistido ? `<span>${assistido}</span>` : ""}
                        ${avaliado ? `<span>${avaliado}</span>` : ""}
                        ${atualizado ? `<span>${atualizado}</span>` : ""}
                    </div>
                    ${acoesHtml}
                </div>
            </div>
        </div>`;
    document.title = titulo + " — FakeLetterboxd";
    if (ehDono) {
        document.getElementById("btn-deletar-detalhe").addEventListener("click", async () => {
            if (!confirm("Tem certeza que deseja excluir esta avaliação?"))
                return;
            try {
                const r = await authFetch(backendAddress + "midias/avaliacao/" + id + "/", { method: "DELETE" });
                if (r.ok || r.status === 204) {
                    history.back();
                }
            }
            catch (_a) {
                alert("Erro ao excluir avaliação.");
            }
        });
    }
}
function formatarDataDetalhe(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
//# sourceMappingURL=detalheAvaliacao.js.map