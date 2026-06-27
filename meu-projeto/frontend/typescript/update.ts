onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { location.href = "accounts/login.html"; return; }

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { location.href = "/"; return; }

    await carregarAvaliacao(id);
    document.getElementById("atualiza")!.addEventListener("click", () => atualizarAvaliacao(id));
};

/**
 * Carrega os dados da avaliação e preenche a tela.
 * :param id: ID da avaliação
 */
async function carregarAvaliacao(id: string): Promise<void> {
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/" + id + "/");
        if (!response.ok) { location.href = "/"; return; }

        const av = await response.json();
        const midia = av["midia"] ?? {};

        // Preenche info da mídia
        const poster = document.getElementById("poster-midia") as HTMLImageElement;
        if (midia["poster_url"]) { poster.src = midia["poster_url"]; } else { poster.style.display = "none"; }
        (document.getElementById("titulo-midia") as HTMLElement).textContent = midia["titulo"] ?? "—";
        (document.getElementById("detalhes-midia") as HTMLElement).textContent =
            `${midia["tipo"] ? midia["tipo"].charAt(0).toUpperCase() + midia["tipo"].slice(1) : ""} • ${midia["ano_lancamento"] ?? ""}${midia["diretor"] ? " • " + midia["diretor"] : ""}`;
        (document.getElementById("sinopse-midia") as HTMLElement).textContent = midia["sinopse"] ?? "";

        // Preenche form
        (document.getElementById("nota") as HTMLSelectElement).value = String(av["nota"] ?? 3);
        (document.getElementById("comentario") as HTMLTextAreaElement).value = av["comentario"] ?? "";
        (document.getElementById("assistido_em") as HTMLInputElement).value = av["assistido_em"] ?? "";

    } catch (error) {
        console.error("Erro ao carregar avaliação:", error);
    }
}

/**
 * Envia os dados atualizados ao backend via PUT.
 * :param id: ID da avaliação
 */
async function atualizarAvaliacao(id: string): Promise<void> {
    const msg = document.getElementById("msg-feedback") as HTMLDivElement;

    const body = {
        nota: parseInt((document.getElementById("nota") as HTMLSelectElement).value),
        comentario: (document.getElementById("comentario") as HTMLTextAreaElement).value,
        assistido_em: (document.getElementById("assistido_em") as HTMLInputElement).value || null
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
        } else {
            const err = await response.json();
            exibirMsgUpdate(msg, "Erro: " + JSON.stringify(err), "error");
        }
    } catch (error) {
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
function exibirMsgUpdate(el: HTMLElement, texto: string, tipo: "success" | "error"): void {
    el.textContent = texto;
    el.className = `msg-feedback ${tipo}`;
}