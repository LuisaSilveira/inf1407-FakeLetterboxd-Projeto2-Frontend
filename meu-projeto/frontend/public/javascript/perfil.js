"use strict";
/**
 * perfil.ts — Página de perfil (perfil.html).
 * Carrega dados do usuário, lista avaliações, permite editar perfil e deletar conta.
 */
let usuarioPerfil = null;
onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        location.href = "home.html";
        return;
    }
    await carregarPerfil();
    await carregarAvaliacoesPerfil();
    configurarLogout();
    configurarEdicao();
    configurarModalPerfil();
    configurarDeletar();
    configurarFiltrosPerfil();
};
/** Carrega e exibe os dados do perfil do usuário. */
async function carregarPerfil() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const response = await authFetch(backendAddress + "accounts/perfil/");
        if (response.status === 401) {
            location.href = "accounts/login.html";
            return;
        }
        const dados = await response.json();
        usuarioPerfil = (_a = dados.username) !== null && _a !== void 0 ? _a : null;
        document.getElementById("perfil-username").textContent = (_b = dados.username) !== null && _b !== void 0 ? _b : "";
        document.getElementById("perfil-email").textContent = (_c = dados.email) !== null && _c !== void 0 ? _c : "";
        const nome = [dados.first_name, dados.last_name].filter(Boolean).join(" ");
        document.getElementById("perfil-nome").textContent = nome;
        document.getElementById("perfil-bio").textContent = (_d = dados.bio) !== null && _d !== void 0 ? _d : "";
        document.getElementById("email").value = (_e = dados.email) !== null && _e !== void 0 ? _e : "";
        document.getElementById("first_name").value = (_f = dados.first_name) !== null && _f !== void 0 ? _f : "";
        document.getElementById("last_name").value = (_g = dados.last_name) !== null && _g !== void 0 ? _g : "";
        document.getElementById("bio").value = (_h = dados.bio) !== null && _h !== void 0 ? _h : "";
    }
    catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}
/** Carrega e renderiza as avaliações do usuário no grid. */
async function carregarAvaliacoesPerfil(params = {}) {
    const grid = document.getElementById("avaliacoes-grid");
    grid.innerHTML = `<div class="empty-state" id="carregando-avaliacoes"><p>Carregando avaliações…</p></div>`;
    atualizarBuscaInfoPerfil(params);
    const queryString = new URLSearchParams(params).toString();
    const url = backendAddress + "midias/avaliacao/" + (queryString ? "?" + queryString : "");
    try {
        const response = await authFetch(url);
        if (!response.ok) {
            grid.innerHTML = `<div class="empty-state"><p>Erro ao carregar avaliações.</p></div>`;
            return;
        }
        const avaliacoes = await response.json();
        const avaliacoesDoUsuario = usuarioPerfil
            ? avaliacoes.filter((av) => obterAutorAvaliacaoPerfil(av) === usuarioPerfil)
            : avaliacoes;
        document.getElementById("perfil-total-avaliacoes").textContent = String(avaliacoesDoUsuario.length);
        grid.innerHTML = "";
        if (avaliacoesDoUsuario.length === 0) {
            const temFiltros = Object.keys(params).length > 0;
            grid.innerHTML = temFiltros
                ? `<div class="empty-state"><p>Nenhuma avaliação encontrada com os filtros aplicados.</p></div>`
                : `<div class="empty-state"><p>Você ainda não tem avaliações cadastradas.</p></div>`;
            return;
        }
        let idParaApagar = null;
        avaliacoesDoUsuario.forEach((av) => {
            const card = criaCardPerfilFnFn(av, (id) => {
                idParaApagar = id;
                document.getElementById("modal-apagar").classList.add("ativo");
            });
            grid.appendChild(card);
        });
        // Ensure we only add the event listener once, or replace the node to avoid duplicates
        const btnConfirmar = document.getElementById("modal-confirmar");
        const novoBtnConfirmar = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(novoBtnConfirmar, btnConfirmar);
        novoBtnConfirmar.addEventListener("click", async () => {
            if (idParaApagar === null)
                return;
            document.getElementById("modal-apagar").classList.remove("ativo");
            await authFetch(backendAddress + "midias/avaliacao/" + idParaApagar + "/", { method: "DELETE" });
            idParaApagar = null;
            await carregarAvaliacoesPerfil(lerFiltrosPerfil());
        });
    }
    catch (error) {
        grid.innerHTML = `<div class="empty-state"><p>Erro de rede.</p></div>`;
        console.error("Erro ao carregar avaliações:", error);
    }
}
/**
 * Cria um card de avaliação para a página de perfil.
 * :param av: objeto de avaliação
 * :param onApagar: callback chamado ao clicar em Excluir
 */
function criaCardPerfilFnFn(av, onApagar) {
    var _a, _b, _c, _d, _e;
    const article = document.createElement("article");
    article.className = "avaliacao-card";
    article.style.cursor = "pointer";
    // Registra o click ANTES de qualquer manipulação de innerHTML para garantir
    // que a navegação funcione mesmo que ocorra algum erro nos listeners dos botões.
    article.addEventListener("click", () => {
        location.href = "detalheAvaliacao.html?id=" + av["id"];
    });
    const autor = (_a = obterAutorAvaliacaoPerfil(av)) !== null && _a !== void 0 ? _a : "";
    const m = (_b = av["midia_detalhes"]) !== null && _b !== void 0 ? _b : {};
    const posterHtml = m["poster_url"]
        ? `<div class="poster-container"><img src="${m["poster_url"]}" alt="${(_c = m["titulo"]) !== null && _c !== void 0 ? _c : ""}" class="midia-poster"></div>` : "";
    const dataHtml = av["assistido_em"]
        ? `<div class="assistido-em">Assistido em ${formatarDataPerfil(av["assistido_em"])}</div>` : "";
    article.innerHTML = `
        ${posterHtml}
        <div class="card-content">
            <div class="card-header">
                <span class="pessoa-nome">${autor}</span>
                <span class="nota">${(_d = av["nota"]) !== null && _d !== void 0 ? _d : ""}</span>
            </div>
            <h2 class="midia-titulo">${(_e = m["titulo"]) !== null && _e !== void 0 ? _e : "—"}</h2>
            ${dataHtml}
            <p class="comentario">${av["comentario"] || "Sem comentário"}</p>
            <div class="card-actions">
                <a href="update.html?id=${av["id"]}" class="btn btn-atualizar">Editar</a>
                <button class="btn btn-apagar" data-id="${av["id"]}">Excluir</button>
            </div>
        </div>`;
    const btnApagar = article.querySelector(".btn-apagar");
    if (btnApagar) {
        btnApagar.addEventListener("click", (e) => {
            e.stopPropagation();
            onApagar(Number(av["id"]));
        });
    }
    const btnAtualizar = article.querySelector(".btn-atualizar");
    if (btnAtualizar) {
        btnAtualizar.addEventListener("click", (e) => e.stopPropagation());
    }
    return article;
}
function obterAutorAvaliacaoPerfil(av) {
    return typeof av["username"] === "string" && av["username"].trim() ? av["username"] : null;
}
/** Configura os botões de logout (modal). */
function configurarLogout() {
    const modal = document.getElementById("modal-logout");
    document.getElementById("btn-abrir-modal-logout").addEventListener("click", () => modal.classList.add("ativo"));
    document.getElementById("cancelar-logout").addEventListener("click", () => modal.classList.remove("ativo"));
    document.getElementById("confirmar-logout").addEventListener("click", () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        location.href = "home.html";
    });
}
/** Configura botão de editar perfil e cancelar edição. */
function configurarEdicao() {
    const formEdicao = document.getElementById("form-edicao");
    document.getElementById("btn-editar-perfil").addEventListener("click", (e) => {
        e.preventDefault();
        formEdicao.classList.toggle("oculto");
    });
    document.getElementById("btn-cancelar-edicao").addEventListener("click", () => {
        formEdicao.classList.add("oculto");
    });
    document.getElementById("salvar-perfil").addEventListener("click", salvarPerfilFn);
}
/** Salva as alterações do perfil via PATCH. */
async function salvarPerfilFn() {
    const msg = document.getElementById("msg-perfil");
    const body = {
        email: document.getElementById("email").value,
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        bio: document.getElementById("bio").value,
    };
    try {
        const response = await authFetch(backendAddress + "accounts/perfil/", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            location.reload();
        }
        else {
            const err = await response.json();
            msg.textContent = "Erro: " + Object.values(err).map((v) => Array.isArray(v) ? v.join(", ") : String(v)).join(" ");
            msg.className = "msg-perfil error";
        }
    }
    catch (_a) {
        msg.textContent = "Erro de rede.";
        msg.className = "msg-perfil error";
    }
}
/** Configura o modal de cancelar exclusão de avaliação. */
function configurarModalPerfil() {
    document.getElementById("modal-cancelar").addEventListener("click", () => {
        document.getElementById("modal-apagar").classList.remove("ativo");
    });
}
/** Configura o botão de deletar conta. */
function configurarDeletar() {
    document.getElementById("btn-deletar-conta").addEventListener("click", async () => {
        if (!confirm("Tem certeza? Todos os seus dados serão removidos permanentemente."))
            return;
        try {
            const response = await authFetch(backendAddress + "accounts/perfil/", { method: "DELETE" });
            if (response.ok || response.status === 204) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                location.href = "home.html";
            }
        }
        catch (error) {
            console.error("Erro ao deletar conta:", error);
        }
    });
}
/**
 * Formata data ISO para DD/MM/YYYY.
 * :param data: string no formato YYYY-MM-DD
 */
function formatarDataPerfil(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
/** Configura os botões de filtrar e limpar. */
function configurarFiltrosPerfil() {
    const btnFiltrar = document.getElementById("btn-filtrar");
    const btnLimpar = document.getElementById("btn-limpar");
    btnFiltrar === null || btnFiltrar === void 0 ? void 0 : btnFiltrar.addEventListener("click", () => {
        carregarAvaliacoesPerfil(lerFiltrosPerfil());
    });
    btnLimpar === null || btnLimpar === void 0 ? void 0 : btnLimpar.addEventListener("click", () => {
        limparCamposFiltroPerfil();
        carregarAvaliacoesPerfil();
    });
    // Permite filtrar ao pressionar Enter em qualquer input de texto do painel
    const inputs = document.querySelectorAll("#filtros-panel input[type='text']");
    inputs.forEach(input => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                carregarAvaliacoesPerfil(lerFiltrosPerfil());
            }
        });
    });
}
/** Lê os valores dos filtros atuais */
function lerFiltrosPerfil() {
    var _a, _b, _c, _d;
    const params = {};
    const buscaTitulo = (_a = document.getElementById("filtro-titulo")) === null || _a === void 0 ? void 0 : _a.value.trim();
    if (buscaTitulo)
        params["busca_titulo"] = buscaTitulo;
    const tipoMidia = (_b = document.getElementById("filtro-tipo")) === null || _b === void 0 ? void 0 : _b.value;
    if (tipoMidia)
        params["tipo_midia"] = tipoMidia;
    const generoMidia = (_c = document.getElementById("filtro-genero")) === null || _c === void 0 ? void 0 : _c.value;
    if (generoMidia)
        params["genero_midia"] = generoMidia;
    const ordemNota = (_d = document.getElementById("filtro-ordem")) === null || _d === void 0 ? void 0 : _d.value;
    if (ordemNota)
        params["ordem_nota"] = ordemNota;
    return params;
}
/** Limpa os filtros no UI */
function limparCamposFiltroPerfil() {
    const titulo = document.getElementById("filtro-titulo");
    const tipo = document.getElementById("filtro-tipo");
    const genero = document.getElementById("filtro-genero");
    const ordem = document.getElementById("filtro-ordem");
    if (titulo)
        titulo.value = "";
    if (tipo)
        tipo.value = "";
    if (genero)
        genero.value = "";
    if (ordem)
        ordem.value = "";
    atualizarBuscaInfoPerfil({});
}
/** Atualiza a div visual com as tags de filtros ativos */
function atualizarBuscaInfoPerfil(params) {
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
//# sourceMappingURL=perfil.js.map