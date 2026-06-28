"use strict";
/**
 * detalheAvaliacao.ts — Página de detalhes de uma avaliação (detalheAvaliacao.html).
 * Busca os dados pelo id da query string e renderiza na página.
 */
onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        location.href = "home.html";
        return;
    }
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) {
        location.href = "home.html";
        return;
    }
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
            main.innerHTML = `<div class="detalhe-erro"><p>Avaliação não encontrada.</p><a href="index.html" class="btn-back">← Voltar à lista</a></div>`;
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const m = (_a = av["midia_detalhes"]) !== null && _a !== void 0 ? _a : {};
    const posterSrc = (_b = m["poster_url"]) !== null && _b !== void 0 ? _b : "";
    const titulo = (_c = m["titulo"]) !== null && _c !== void 0 ? _c : "—";
    const tipo = (_d = m["tipo"]) !== null && _d !== void 0 ? _d : "";
    const genero = (_e = m["generos"]) !== null && _e !== void 0 ? _e : "";
    const sinopse = (_f = m["sinopse"]) !== null && _f !== void 0 ? _f : "";
    const diretor = (_g = m["diretor"]) !== null && _g !== void 0 ? _g : "";
    const ano = m["ano_lancamento"] ? String(m["ano_lancamento"]) : "";
    const duracao = (_h = m["duracao"]) !== null && _h !== void 0 ? _h : "";
    const idioma = (_j = m["idioma"]) !== null && _j !== void 0 ? _j : "";
    const pais = (_k = m["pais"]) !== null && _k !== void 0 ? _k : "";
    const elenco = (_l = m["elenco"]) !== null && _l !== void 0 ? _l : "";
    const classificacao = (_m = m["classificacao"]) !== null && _m !== void 0 ? _m : "";
    const mediaNotas = m["media_notas"] != null ? String(m["media_notas"]) : "";
    const totalAvaliacoes = m["total_avaliacoes"] != null ? String(m["total_avaliacoes"]) : "";
    const numTemporadas = m["num_temporadas"] ? String(m["num_temporadas"]) : "";
    const nota = av["nota"] != null ? String(av["nota"]) : "";
    const comentario = (_o = av["comentario"]) !== null && _o !== void 0 ? _o : "";
    const autor = (_p = av["username"]) !== null && _p !== void 0 ? _p : "";
    const assistido = av["assistido_em"] ? "Assistido em " + formatarDataDetalhe(av["assistido_em"]) : "";
    const avaliado = av["dt_avaliacao"] ? "Avaliado em " + formatarDataDetalhe(av["dt_avaliacao"].split("T")[0]) : "";
    const atualizado = av["dt_atualizacao"] ? "Atualizado em " + formatarDataDetalhe(av["dt_atualizacao"].split("T")[0]) : "";
    const ehDono = !!usuarioLogado && autor === usuarioLogado;
    // Poster
    const posterHtml = posterSrc
        ? `<img src="${posterSrc}" alt="${titulo}" class="det-poster">`
        : `<div class="det-poster-placeholder"></div>`;
    // Sinopse
    const sinopseHtml = sinopse
        ? `<div class="det-secao">
               <h3 class="det-secao-titulo">Sinopse</h3>
               <p class="det-sinopse">${sinopse}</p>
           </div>`
        : "";
    // Ficha técnica
    const fichaItens = [];
    if (diretor)
        fichaItens.push({ label: "Diretor", value: diretor });
    if (ano)
        fichaItens.push({ label: "Ano", value: ano });
    if (duracao)
        fichaItens.push({ label: "Duração", value: duracao });
    if (tipo === "serie" && numTemporadas)
        fichaItens.push({ label: "Temporadas", value: numTemporadas });
    if (idioma)
        fichaItens.push({ label: "Idioma", value: idioma });
    if (pais)
        fichaItens.push({ label: "País", value: pais });
    if (classificacao)
        fichaItens.push({ label: "Classificação", value: classificacao });
    if (mediaNotas)
        fichaItens.push({ label: "Nota média", value: mediaNotas });
    if (totalAvaliacoes)
        fichaItens.push({ label: "Total de avaliações", value: totalAvaliacoes });
    const fichaHtml = fichaItens.length > 0
        ? `<div class="det-secao">
               <h3 class="det-secao-titulo">Ficha Técnica</h3>
               <dl class="det-ficha">
                   ${fichaItens.map(item => `<div class="det-ficha-item"><dt>${item.label}</dt><dd>${item.value}</dd></div>`).join("")}
               </dl>
           </div>`
        : "";
    // Elenco
    const elencoHtml = elenco
        ? `<div class="det-secao">
               <h3 class="det-secao-titulo">Elenco</h3>
               <p class="det-elenco">${elenco}</p>
           </div>`
        : "";
    // Ações
    const acoesHtml = ehDono
        ? `<div class="det-acoes">
               <a href="update.html?id=${id}" class="btn-det-editar">Editar</a>
               <button class="btn-det-deletar" id="btn-deletar-detalhe">Excluir</button>
           </div>`
        : "";
    main.innerHTML = `
        <div class="detalhe-card">
            <div class="det-topo">
                <div class="det-poster-wrap">
                    ${posterHtml}
                </div>
                <div class="det-info">
                    <h1 class="det-titulo">${titulo}</h1>
                    <div class="det-meta">
                        ${tipo ? `<span class="det-badge det-badge-tipo">${tipo}</span>` : ""}
                        ${genero ? `<span class="det-badge">${genero}</span>` : ""}
                        ${nota ? `<span class="det-nota">${nota}</span>` : ""}
                    </div>
                    ${sinopseHtml}
                    ${fichaHtml}
                    ${elencoHtml}
                    <div class="det-secao">
                        <h3 class="det-secao-titulo">Avaliação${autor ? " de " + autor : ""}</h3>
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