/**
 * script.ts — Lista de avaliações (index.html).
 * Renderiza cards no estilo do projeto 1, com modal de confirmação de exclusão.
 */

let idParaApagar: number | null = null;

onload = () => {
    const token = localStorage.getItem("access_token");
    if (!token) { location.href = "accounts/login.html"; return; }
    exibeListaDeAvaliacoes();
    configurarModal();
};

/**
 * Configura o modal de confirmação de exclusão.
 */
function configurarModal(): void {
    const modal = document.getElementById("modal-apagar") as HTMLDivElement;
    document.getElementById("modal-cancelar")!.addEventListener("click", () => {
        modal.classList.remove("ativo");
        idParaApagar = null;
    });
    document.getElementById("modal-confirmar")!.addEventListener("click", async () => {
        if (idParaApagar === null) return;
        modal.classList.remove("ativo");
        await apagarAvaliacao(idParaApagar);
        idParaApagar = null;
    });
}

/**
 * Remove uma avaliação pelo ID.
 * :param id: ID da avaliação a ser removida
 */
async function apagarAvaliacao(id: number): Promise<void> {
    try {
        await authFetch(backendAddress + "midias/avaliacao/" + id + "/", { method: "DELETE" });
        await exibeListaDeAvaliacoes();
    } catch (error) {
        console.error("Erro ao apagar avaliação:", error);
    }
}

/**
 * Busca e renderiza os cards de avaliação no grid.
 */
async function exibeListaDeAvaliacoes(): Promise<void> {
    const grid = document.getElementById("avaliacoes-grid") as HTMLDivElement;
    grid.innerHTML = `<div class="empty-state" id="carregando"><p>Carregando avaliações…</p></div>`;

    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.status === 401) { location.href = "accounts/login.html"; return; }
        if (!response.ok) { grid.innerHTML = `<div class="empty-state"><p>Erro ao carregar avaliações.</p></div>`; return; }

        const avaliacoes: any[] = await response.json();
        grid.innerHTML = "";

        if (avaliacoes.length === 0) {
            grid.innerHTML = `<div class="empty-state"><p>Ainda não há avaliações cadastradas.</p></div>`;
            return;
        }

        avaliacoes.forEach((av: any) => {
            const card = criaCardLista(av);
            grid.appendChild(card);
        });

    } catch (error) {
        grid.innerHTML = `<div class="empty-state"><p>Erro de rede.</p></div>`;
        console.error(error);
    }
}

/**
 * Cria um elemento de card de avaliação no estilo do projeto 1.
 * :param av: objeto de avaliação retornado pela API
 * :return: elemento article do card
 */
function criaCardLista(av: any): HTMLElement {
    const article = document.createElement("article");
    article.className = "avaliacao-card";

    // Poster
    const posterHtml = av["poster_url"]
        ? `<div class="poster-container"><img src="${av["poster_url"]}" alt="${av["titulo_midia"] ?? ""}" class="midia-poster"></div>`
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
                <span class="pessoa-nome">${av["usuario"] ?? av["titulo_midia"] ?? ""}</span>
                <span class="nota">${av["nota"] ?? ""}</span>
            </div>
            <h2 class="midia-titulo">${av["titulo_midia"] ?? "—"}</h2>
            ${dataHtml}
            <p class="comentario">${av["comentario"] || "Sem comentário"}</p>
            ${acoesHtml}
        </div>`;

    // Botão de excluir abre o modal
    const btnApagar = article.querySelector(".btn-apagar") as HTMLButtonElement;
    btnApagar.addEventListener("click", (e: Event) => {
        e.stopPropagation();
        idParaApagar = Number(btnApagar.dataset["id"]);
        (document.getElementById("modal-apagar") as HTMLDivElement).classList.add("ativo");
    });

    return article;
}

/**
 * Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY.
 * :param data: string de data no formato ISO
 * :return: string formatada
 */
function formatarDataLista(data: string): string {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
