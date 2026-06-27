/**
 * detalheAvaliacao.ts — Página de detalhes de uma avaliação (detalheAvaliacao.html).
 * Busca os dados pelo id da query string e renderiza na página.
 */

onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { location.href = "accounts/login.html"; return; }

    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) { location.href = "/"; return; }

    document.getElementById("btn-voltar")!.addEventListener("click", () => history.back());

    const usuarioLogado = await buscarUsuarioLogado();
    await carregarDetalheAvaliacao(Number(id), usuarioLogado);
};

async function buscarUsuarioLogado(): Promise<string | null> {
    try {
        const r = await authFetch(backendAddress + "accounts/perfil/");
        if (!r.ok) return null;
        const d = await r.json();
        return d.username ?? null;
    } catch {
        return null;
    }
}

async function carregarDetalheAvaliacao(id: number, usuarioLogado: string | null): Promise<void> {
    const main = document.getElementById("detalhe-main") as HTMLElement;
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/" + id + "/");
        if (response.status === 401) { location.href = "accounts/login.html"; return; }
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
    } catch {
        main.innerHTML = `<div class="detalhe-erro"><p>Erro de rede.</p></div>`;
    }
}

function renderizarDetalhe(av: any, main: HTMLElement, usuarioLogado: string | null, id: number): void {
    const posterSrc: string = av["poster_midia"] ?? av["poster_url"] ?? "";
    const titulo: string = av["titulo_midia"] ?? "—";
    const tipo: string = av["tipo_midia"] ?? "";
    const genero: string = av["genero_midia"] ?? "";
    const nota: string = av["nota"] != null ? String(av["nota"]) : "";
    const comentario: string = av["comentario"] ?? "";
    const sinopse: string = av["sinopse"] ?? av["sinopse_midia"] ?? "";
    const autor: string = av["username"] ?? "";
    const assistido: string = av["assistido_em"] ? "Assistido em " + formatarDataDetalhe(av["assistido_em"]) : "";
    const avaliado: string = av["dt_avaliacao"] ? "Avaliado em " + formatarDataDetalhe(av["dt_avaliacao"].split("T")[0]) : "";
    const atualizado: string = av["dt_atualizacao"] ? "Atualizado em " + formatarDataDetalhe(av["dt_atualizacao"].split("T")[0]) : "";
    const ehDono: boolean = !!usuarioLogado && autor === usuarioLogado;

    const posterHtml: string = posterSrc
        ? `<img src="${posterSrc}" alt="${titulo}" class="det-poster">`
        : `<div class="det-poster-placeholder"></div>`;

    const sinopseHtml: string = sinopse
        ? `<div class="det-secao">
                <h3 class="det-secao-titulo">Sinopse</h3>
                <p class="det-sinopse">${sinopse}</p>
           </div>`
        : "";

    const acoesHtml: string = ehDono
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
                        ${tipo   ? `<span class="det-badge">${tipo}</span>`   : ""}
                        ${genero ? `<span class="det-badge">${genero}</span>` : ""}
                        ${nota   ? `<span class="det-nota">${nota}</span>`    : ""}
                    </div>
                    ${sinopseHtml}
                    <div class="det-secao">
                        <h3 class="det-secao-titulo">Comentário${autor ? " de " + autor : ""}</h3>
                        <p class="det-comentario">${comentario || "Sem comentário"}</p>
                    </div>
                    <div class="det-datas">
                        ${assistido  ? `<span>${assistido}</span>`  : ""}
                        ${avaliado   ? `<span>${avaliado}</span>`   : ""}
                        ${atualizado ? `<span>${atualizado}</span>` : ""}
                    </div>
                    ${acoesHtml}
                </div>
            </div>
        </div>`;

    document.title = titulo + " — FakeLetterboxd";

    if (ehDono) {
        document.getElementById("btn-deletar-detalhe")!.addEventListener("click", async () => {
            if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;
            try {
                const r = await authFetch(backendAddress + "midias/avaliacao/" + id + "/", { method: "DELETE" });
                if (r.ok || r.status === 204) {
                    history.back();
                }
            } catch {
                alert("Erro ao excluir avaliação.");
            }
        });
    }
}

function formatarDataDetalhe(data: string): string {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
