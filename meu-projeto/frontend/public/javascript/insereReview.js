"use strict";
/**
 * insereReview.ts — Criação de avaliação (insereReview.html).
 * Fluxo fiel ao projeto 1: busca OMDB → seleciona mídia → preenche form → envia.
 */
onload = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        location.href = "accounts/login.html";
        return;
    }
    document.getElementById("buscaOmdb").addEventListener("click", buscarOmdb);
    document.getElementById("trocar-midia").addEventListener("click", trocarMidia);
    document.getElementById("insere").addEventListener("click", inserirAvaliacao);
};
/**
 * Busca títulos na OMDB via backend e exibe os resultados.
 */
async function buscarOmdb() {
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
                lista.appendChild(criaResultadoItem(item));
            });
        }
        else {
            lista.innerHTML = `<div class="nenhum-resultado"><p>Nenhum resultado para "${query}"</p><p>Tente outro termo de busca</p></div>`;
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
/**
 * Cria um item de resultado de busca no estilo do projeto 1.
 * :param item: objeto retornado pela busca OMDB
 * :return: elemento div do resultado
 */
function criaResultadoItem(item) {
    var _a;
    const div = document.createElement("div");
    div.className = "resultado-item";
    const titulo = obterCampo(item, ["Title", "titulo"]);
    const posterSrc = obterCampo(item, ["Poster", "poster_url"]);
    const imdbID = obterCampo(item, ["imdbID", "imdb_id", "id", "pk"]);
    div.innerHTML = `
        ${posterSrc && posterSrc !== "N/A" ? `<img src="${posterSrc}" alt="${titulo !== null && titulo !== void 0 ? titulo : ""}" class="poster">` : `<div class="poster"></div>`}
        <div class="info-midia">
            <div class="titulo-midia">${titulo !== null && titulo !== void 0 ? titulo : "—"}</div>
            <div class="detalhes-midia">${(_a = obterCampo(item, ["Year", "ano_lancamento"])) !== null && _a !== void 0 ? _a : ""}</div>
        </div>
        <div class="actions">
            <button class="btn btn-primary">Selecionar</button>
        </div>`;
    div.querySelector("button").addEventListener("click", () => selecionarMidia(String(imdbID !== null && imdbID !== void 0 ? imdbID : "")));
    return div;
}
/**
 * Importa a mídia selecionada para o banco e exibe na seção de selecionada.
 * :param imdbID: ID da mídia no IMDB
 */
async function selecionarMidia(imdbID) {
    var _a, _b, _c;
    if (!imdbID) {
        console.error("Seleção de mídia sem identificador válido.");
        return;
    }
    try {
        const response = await authFetch(backendAddress + "midias/busca-omdb/?midia_selecionada=" + encodeURIComponent(imdbID));
        const data = await response.json();
        if (response.ok && data.midia_selecionada) {
            const midia = data.midia_selecionada;
            document.getElementById("midia_id").value = String(midia.id);
            document.getElementById("poster-selecionado").src = (_a = midia.poster_url) !== null && _a !== void 0 ? _a : "";
            document.getElementById("titulo-selecionado").textContent = midia.titulo;
            document.getElementById("detalhes-selecionado").textContent =
                `${midia.tipo ? midia.tipo.charAt(0).toUpperCase() + midia.tipo.slice(1) : ""} • ${(_b = midia.ano_lancamento) !== null && _b !== void 0 ? _b : ""}${midia.diretor ? " • " + midia.diretor : ""}`;
            document.getElementById("sinopse-selecionada").textContent = (_c = midia.sinopse) !== null && _c !== void 0 ? _c : "";
            // Esconde busca, mostra selecionada e form
            document.getElementById("secao-busca").classList.add("oculto");
            document.getElementById("secao-selecionada").classList.remove("oculto");
            document.getElementById("secao-form").classList.remove("oculto");
            document.getElementById("listaResultados").innerHTML = "";
        }
    }
    catch (error) {
        console.error("Erro ao selecionar mídia:", error);
    }
}
/**
 * Volta para a tela de busca, limpando a seleção atual.
 */
function trocarMidia() {
    document.getElementById("midia_id").value = "";
    document.getElementById("secao-busca").classList.remove("oculto");
    document.getElementById("secao-selecionada").classList.add("oculto");
    document.getElementById("secao-form").classList.add("oculto");
}
/**
 * Envia o formulário de avaliação para o backend.
 */
async function inserirAvaliacao() {
    const msg = document.getElementById("msg-feedback");
    const midiaId = document.getElementById("midia_id").value;
    if (!midiaId) {
        exibirMsgInsere(msg, "Busque e selecione uma mídia primeiro.", "error");
        return;
    }
    const body = {
        midia: parseInt(midiaId),
        nota: parseInt(document.getElementById("nota").value),
        comentario: document.getElementById("comentario").value,
        assistido_em: document.getElementById("assistido_em").value || null
    };
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            exibirMsgInsere(msg, "Avaliação publicada! Redirecionando…", "success");
            setTimeout(() => { location.href = "/"; }, 1500);
        }
        else {
            const err = await response.json();
            exibirMsgInsere(msg, "Erro: " + JSON.stringify(err), "error");
        }
    }
    catch (error) {
        exibirMsgInsere(msg, "Erro de rede.", "error");
        console.error(error);
    }
}
/**
 * Exibe mensagem de feedback.
 * :param el: elemento onde exibir
 * :param texto: texto da mensagem
 * :param tipo: "success" ou "error"
 */
function exibirMsgInsere(el, texto, tipo) {
    el.textContent = texto;
    el.className = `msg-feedback ${tipo}`;
}
function obterCampo(obj, chaves) {
    for (const chave of chaves) {
        const valor = obj === null || obj === void 0 ? void 0 : obj[chave];
        if (valor !== undefined && valor !== null && valor !== "") {
            return String(valor);
        }
    }
    return undefined;
}
//# sourceMappingURL=insereReview.js.map