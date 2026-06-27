"use strict";
/**
 * perfil.ts — Página de perfil (perfil.html).
 * Carrega dados do usuário, lista avaliações, permite editar perfil e deletar conta.
 */
onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        location.href = "accounts/login.html";
        return;
    }
    await carregarPerfil();
    await carregarAvaliacoesPerfil();
    configurarLogout();
    configurarEdicao();
    configurarModalPerfil();
    configurarDeletar();
};
/** Carrega e exibe os dados do perfil do usuário. */
async function carregarPerfil() {
    var _a, _b, _c, _d, _e, _f;
    try {
        const response = await authFetch(backendAddress + "accounts/perfil/");
        if (response.status === 401) {
            location.href = "accounts/login.html";
            return;
        }
        const dados = await response.json();
        document.getElementById("perfil-username").textContent = (_a = dados.username) !== null && _a !== void 0 ? _a : "";
        document.getElementById("perfil-email").textContent = (_b = dados.email) !== null && _b !== void 0 ? _b : "";
        const nome = [dados.first_name, dados.last_name].filter(Boolean).join(" ");
        document.getElementById("perfil-nome").textContent = nome;
        // Preenche form de edição
        document.getElementById("username").value = (_c = dados.username) !== null && _c !== void 0 ? _c : "";
        document.getElementById("email").value = (_d = dados.email) !== null && _d !== void 0 ? _d : "";
        document.getElementById("first_name").value = (_e = dados.first_name) !== null && _e !== void 0 ? _e : "";
        document.getElementById("last_name").value = (_f = dados.last_name) !== null && _f !== void 0 ? _f : "";
    }
    catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}
/** Carrega e renderiza as avaliações do usuário no grid. */
async function carregarAvaliacoesPerfil() {
    const grid = document.getElementById("avaliacoes-grid");
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/");
        if (!response.ok)
            return;
        const avaliacoes = await response.json();
        document.getElementById("perfil-total-avaliacoes").textContent = String(avaliacoes.length);
        grid.innerHTML = "";
        if (avaliacoes.length === 0) {
            grid.innerHTML = `<div class="empty-state"><p>Você ainda não tem avaliações cadastradas.</p></div>`;
            return;
        }
        let idParaApagar = null;
        avaliacoes.forEach((av) => {
            const card = criaCardPerfilFnFn(av, (id) => {
                idParaApagar = id;
                document.getElementById("modal-apagar").classList.add("ativo");
            });
            grid.appendChild(card);
        });
        document.getElementById("modal-confirmar").addEventListener("click", async () => {
            if (idParaApagar === null)
                return;
            document.getElementById("modal-apagar").classList.remove("ativo");
            await authFetch(backendAddress + "midias/avaliacao/" + idParaApagar + "/", { method: "DELETE" });
            idParaApagar = null;
            await carregarAvaliacoesPerfil();
        });
    }
    catch (error) {
        console.error("Erro ao carregar avaliações:", error);
    }
}
/**
 * Cria um card de avaliação para a página de perfil.
 * :param av: objeto de avaliação
 * :param onApagar: callback chamado ao clicar em Excluir
 */
function criaCardPerfilFnFn(av, onApagar) {
    var _a, _b, _c, _d;
    const article = document.createElement("article");
    article.className = "avaliacao-card";
    const autor = (_a = obterAutorAvaliacaoPerfil(av)) !== null && _a !== void 0 ? _a : "";
    const posterHtml = av["poster_url"]
        ? `<div class="poster-container"><img src="${av["poster_url"]}" alt="${(_b = av["titulo_midia"]) !== null && _b !== void 0 ? _b : ""}" class="midia-poster"></div>` : "";
    const dataHtml = av["assistido_em"]
        ? `<div class="assistido-em">Assistido em ${formatarDataPerfil(av["assistido_em"])}</div>` : "";
    article.innerHTML = `
        ${posterHtml}
        <div class="card-content">
            <div class="card-header">
                <span class="pessoa-nome">${autor}</span>
                <span class="nota">${(_c = av["nota"]) !== null && _c !== void 0 ? _c : ""}</span>
            </div>
            <h2 class="midia-titulo">${(_d = av["titulo_midia"]) !== null && _d !== void 0 ? _d : "—"}</h2>
            ${dataHtml}
            <p class="comentario">${av["comentario"] || "Sem comentário"}</p>
            <div class="card-actions">
                <a href="update.html?id=${av["id"]}" class="btn btn-atualizar">Editar</a>
                <button class="btn btn-apagar" data-id="${av["id"]}">Excluir</button>
            </div>
        </div>`;
    article.querySelector(".btn-apagar").addEventListener("click", () => {
        onApagar(Number(av["id"]));
    });
    return article;
}
function obterAutorAvaliacaoPerfil(av) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const candidato = (_d = (_c = (_b = (_a = av["usuario"]) !== null && _a !== void 0 ? _a : av["username"]) !== null && _b !== void 0 ? _b : av["user"]) !== null && _c !== void 0 ? _c : av["autor"]) !== null && _d !== void 0 ? _d : av["owner"];
    if (typeof candidato === "string" && candidato.trim())
        return candidato;
    const candidatoObjeto = (_k = (_h = (_f = (_e = av["usuario"]) === null || _e === void 0 ? void 0 : _e.username) !== null && _f !== void 0 ? _f : (_g = av["user"]) === null || _g === void 0 ? void 0 : _g.username) !== null && _h !== void 0 ? _h : (_j = av["autor"]) === null || _j === void 0 ? void 0 : _j.username) !== null && _k !== void 0 ? _k : (_l = av["owner"]) === null || _l === void 0 ? void 0 : _l.username;
    if (typeof candidatoObjeto === "string" && candidatoObjeto.trim())
        return candidatoObjeto;
    return null;
}
/** Configura os botões de logout (modal). */
function configurarLogout() {
    const modal = document.getElementById("modal-logout");
    document.getElementById("btn-abrir-modal-logout").addEventListener("click", () => modal.classList.add("ativo"));
    document.getElementById("cancelar-logout").addEventListener("click", () => modal.classList.remove("ativo"));
    document.getElementById("confirmar-logout").addEventListener("click", () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        location.href = "/";
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
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
    };
    try {
        const response = await authFetch(backendAddress + "accounts/perfil/", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            msg.textContent = "Perfil atualizado com sucesso!";
            msg.className = "msg-perfil success";
            await carregarPerfil();
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
                location.href = "/";
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
//# sourceMappingURL=perfil.js.map