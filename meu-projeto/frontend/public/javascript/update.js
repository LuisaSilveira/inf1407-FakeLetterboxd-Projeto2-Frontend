"use strict";
let midiaId = null;
onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        location.href = "accounts/login.html";
        return;
    }
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        location.href = "/";
        return;
    }
    await carregarAvaliacao(id);
    document.getElementById("atualiza").addEventListener("click", () => atualizarAvaliacao(id));
    document.getElementById("trocar-midia").addEventListener("click", abrirBuscaMidia);
    document.getElementById("buscaOmdb").addEventListener("click", buscarOmdbUpdate);
};
/**
 * Carrega os dados da avaliação e preenche a tela.
 * :param id: ID da avaliação
 */
async function carregarAvaliacao(id) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/" + id + "/");
        if (!response.ok) {
            location.href = "/";
            return;
        }
        const av = await response.json();
        // av["midia"] é o ID numérico da mídia
        midiaId = (_a = av["midia"]) !== null && _a !== void 0 ? _a : null;
        // Preenche info da mídia com os campos que o backend já retorna na avaliação
        const poster = document.getElementById("poster-midia");
        const posterSrc = (_c = (_b = av["poster_midia"]) !== null && _b !== void 0 ? _b : av["poster_url"]) !== null && _c !== void 0 ? _c : "";
        if (posterSrc) {
            poster.src = posterSrc;
        }
        else {
            poster.style.display = "none";
        }
        document.getElementById("titulo-midia").textContent = (_d = av["titulo_midia"]) !== null && _d !== void 0 ? _d : "—";
        const tipo = (_e = av["tipo_midia"]) !== null && _e !== void 0 ? _e : "";
        const genero = (_f = av["genero_midia"]) !== null && _f !== void 0 ? _f : "";
        const detalhes = [tipo, genero].filter(Boolean).join(" • ");
        document.getElementById("detalhes-midia").textContent = detalhes;
        document.getElementById("sinopse-midia").textContent = (_h = (_g = av["sinopse"]) !== null && _g !== void 0 ? _g : av["sinopse_midia"]) !== null && _h !== void 0 ? _h : "";
        // Preenche form
        document.getElementById("nota").value = String((_j = av["nota"]) !== null && _j !== void 0 ? _j : 3);
        document.getElementById("comentario").value = (_k = av["comentario"]) !== null && _k !== void 0 ? _k : "";
        document.getElementById("assistido_em").value = (_l = av["assistido_em"]) !== null && _l !== void 0 ? _l : "";
    }
    catch (error) {
        console.error("Erro ao carregar avaliação:", error);
    }
}
/** Exibe a seção de busca e oculta a mídia atual. */
function abrirBuscaMidia() {
    document.getElementById("secao-midia-atual").classList.add("oculto");
    document.getElementById("secao-busca").classList.remove("oculto");
}
/** Busca títulos na OMDB via backend. */
async function buscarOmdbUpdate() {
    var _a;
    const query = document.getElementById("queryOmdb").value.trim();
    if (!query)
        return;
    const btn = document.getElementById("buscaOmdb");
    btn.textContent = "Buscando…";
    btn.disabled = true;
    const lista = document.getElementById("listaResultados");
    lista.innerHTML = "";
    try {
        const response = await authFetch(backendAddress + "midias/busca-omdb/?busca_midia=" + encodeURIComponent(query));
        const data = await response.json();
        if (response.ok && ((_a = data.midias_encontradas) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            data.midias_encontradas.forEach((item) => {
                lista.appendChild(criaItemResultadoUpdate(item));
            });
        }
        else {
            lista.innerHTML = `<div class="nenhum-resultado"><p>Nenhum resultado para "${query}"</p></div>`;
        }
    }
    catch (error) {
        console.error("Erro na busca OMDB:", error);
    }
    finally {
        btn.textContent = "Buscar";
        btn.disabled = false;
    }
}
/** Cria um item de resultado de busca. */
function criaItemResultadoUpdate(item) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const div = document.createElement("div");
    div.className = "resultado-item";
    const titulo = (_b = (_a = item["Title"]) !== null && _a !== void 0 ? _a : item["titulo"]) !== null && _b !== void 0 ? _b : "—";
    const posterSrc = (_d = (_c = item["Poster"]) !== null && _c !== void 0 ? _c : item["poster_url"]) !== null && _d !== void 0 ? _d : "";
    const imdbID = (_g = (_f = (_e = item["imdbID"]) !== null && _e !== void 0 ? _e : item["imdb_id"]) !== null && _f !== void 0 ? _f : item["id"]) !== null && _g !== void 0 ? _g : item["pk"];
    div.innerHTML = `
        ${posterSrc && posterSrc !== "N/A" ? `<img src="${posterSrc}" alt="${titulo}" class="poster">` : `<div class="poster"></div>`}
        <div class="info-midia">
            <div class="titulo-midia">${titulo}</div>
            <div class="detalhes-midia">${(_j = (_h = item["Year"]) !== null && _h !== void 0 ? _h : item["ano_lancamento"]) !== null && _j !== void 0 ? _j : ""}</div>
        </div>
        <div class="actions">
            <button class="btn btn-primary">Selecionar</button>
        </div>`;
    div.querySelector("button").addEventListener("click", () => selecionarMidiaUpdate(String(imdbID !== null && imdbID !== void 0 ? imdbID : "")));
    return div;
}
/** Importa a mídia selecionada e atualiza a exibição. */
async function selecionarMidiaUpdate(imdbID) {
    var _a, _b, _c, _d;
    if (!imdbID)
        return;
    try {
        const response = await authFetch(backendAddress + "midias/busca-omdb/?midia_selecionada=" + encodeURIComponent(imdbID));
        const data = await response.json();
        if (response.ok && data.midia_selecionada) {
            const midia = data.midia_selecionada;
            midiaId = midia.id;
            const poster = document.getElementById("poster-midia");
            if (midia.poster_url) {
                poster.src = midia.poster_url;
                poster.style.display = "";
            }
            document.getElementById("titulo-midia").textContent = (_a = midia.titulo) !== null && _a !== void 0 ? _a : "—";
            const tipo = (_b = midia.tipo) !== null && _b !== void 0 ? _b : "";
            const detalhes = [tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : "", (_c = midia.ano_lancamento) !== null && _c !== void 0 ? _c : ""].filter(Boolean).join(" • ");
            document.getElementById("detalhes-midia").textContent = detalhes;
            document.getElementById("sinopse-midia").textContent = (_d = midia.sinopse) !== null && _d !== void 0 ? _d : "";
            document.getElementById("secao-busca").classList.add("oculto");
            document.getElementById("secao-midia-atual").classList.remove("oculto");
            document.getElementById("listaResultados").innerHTML = "";
            document.getElementById("queryOmdb").value = "";
        }
    }
    catch (error) {
        console.error("Erro ao selecionar mídia:", error);
    }
}
/**
 * Envia os dados atualizados ao backend via PUT.
 * :param id: ID da avaliação
 */
async function atualizarAvaliacao(id) {
    const msg = document.getElementById("msg-feedback");
    const body = {
        midia: midiaId,
        nota: parseInt(document.getElementById("nota").value),
        comentario: document.getElementById("comentario").value,
        assistido_em: document.getElementById("assistido_em").value || null
    };
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/" + id + "/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            exibirMsgUpdate(msg, "Avaliação atualizada! Redirecionando…", "success");
            setTimeout(() => { location.href = "detalheAvaliacao.html?id=" + id; }, 1500);
        }
        else {
            const err = await response.json();
            exibirMsgUpdate(msg, "Erro: " + JSON.stringify(err), "error");
        }
    }
    catch (error) {
        exibirMsgUpdate(msg, "Erro de rede.", "error");
        console.error(error);
    }
}
/**
 * Exibe mensagem de feedback.
 * :param el: elemento alvo
 * :param texto: texto a exibir
 * :param tipo: classe de estilo
 */
function exibirMsgUpdate(el, texto, tipo) {
    el.textContent = texto;
    el.className = `msg-feedback ${tipo}`;
}
//# sourceMappingURL=update.js.map