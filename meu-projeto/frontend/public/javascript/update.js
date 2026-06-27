"use strict";
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
};
/**
 * Carrega os dados da avaliação e preenche a tela.
 * :param id: ID da avaliação
 */
async function carregarAvaliacao(id) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/" + id + "/");
        if (!response.ok) {
            location.href = "/";
            return;
        }
        const av = await response.json();
        const midia = (_a = av["midia"]) !== null && _a !== void 0 ? _a : {};
        // Preenche info da mídia
        const poster = document.getElementById("poster-midia");
        if (midia["poster_url"]) {
            poster.src = midia["poster_url"];
        }
        else {
            poster.style.display = "none";
        }
        document.getElementById("titulo-midia").textContent = (_b = midia["titulo"]) !== null && _b !== void 0 ? _b : "—";
        document.getElementById("detalhes-midia").textContent =
            `${midia["tipo"] ? midia["tipo"].charAt(0).toUpperCase() + midia["tipo"].slice(1) : ""} • ${(_c = midia["ano_lancamento"]) !== null && _c !== void 0 ? _c : ""}${midia["diretor"] ? " • " + midia["diretor"] : ""}`;
        document.getElementById("sinopse-midia").textContent = (_d = midia["sinopse"]) !== null && _d !== void 0 ? _d : "";
        // Preenche form
        document.getElementById("nota").value = String((_e = av["nota"]) !== null && _e !== void 0 ? _e : 3);
        document.getElementById("comentario").value = (_f = av["comentario"]) !== null && _f !== void 0 ? _f : "";
        document.getElementById("assistido_em").value = (_g = av["assistido_em"]) !== null && _g !== void 0 ? _g : "";
    }
    catch (error) {
        console.error("Erro ao carregar avaliação:", error);
    }
}
/**
 * Envia os dados atualizados ao backend via PUT.
 * :param id: ID da avaliação
 */
async function atualizarAvaliacao(id) {
    const msg = document.getElementById("msg-feedback");
    const body = {
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
            setTimeout(() => { location.href = "/"; }, 1500);
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