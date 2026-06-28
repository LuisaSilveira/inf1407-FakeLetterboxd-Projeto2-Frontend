/**
 * detalheAvaliacao.ts — Página de detalhes de uma avaliação (detalheAvaliacao.html).
 * Busca os dados pelo id da query string e renderiza na página.
 */

onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { location.href = "home.html"; return; }

    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) { location.href = "home.html"; return; }

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
            main.innerHTML = `<div class="detalhe-erro"><p>Avaliação não encontrada.</p><a href="index.html" class="btn-back">← Voltar à lista</a></div>`;
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
    const m = av["midia_detalhes"] ?? {};

    const posterSrc: string      = m["poster_url"]      ?? "";
    const titulo: string         = m["titulo"]           ?? "—";
    const tipo: string           = m["tipo"]             ?? "";
    const genero: string         = m["generos"]          ?? "";
    const sinopse: string        = m["sinopse"]           ?? "";
    const diretor: string        = m["diretor"]           ?? "";
    const ano: string            = m["ano_lancamento"]    ? String(m["ano_lancamento"]) : "";
    const duracao: string        = m["duracao"]           ?? "";
    const idioma: string         = m["idioma"]            ?? "";
    const pais: string           = m["pais"]              ?? "";
    const elenco: string         = m["elenco"]            ?? "";
    const classificacao: string  = m["classificacao"]     ?? "";
    const mediaNotas: string      = m["media_notas"]      != null ? String(m["media_notas"])      : "";
    const totalAvaliacoes: string = m["total_avaliacoes"] != null ? String(m["total_avaliacoes"]) : "";
    const numTemporadas: string  = m["num_temporadas"]    ? String(m["num_temporadas"]) : "";

    const nota: string       = av["nota"] != null ? String(av["nota"]) : "";
    const comentario: string = av["comentario"] ?? "";
    const autor: string      = av["username"] ?? "";
    const assistido: string  = av["assistido_em"]   ? "Assistido em "  + formatarDataDetalhe(av["assistido_em"]) : "";
    const avaliado: string   = av["dt_avaliacao"]   ? "Avaliado em "   + formatarDataDetalhe(av["dt_avaliacao"].split("T")[0])   : "";
    const atualizado: string = av["dt_atualizacao"] ? "Atualizado em " + formatarDataDetalhe(av["dt_atualizacao"].split("T")[0]) : "";
    const ehDono: boolean    = !!usuarioLogado && autor === usuarioLogado;

    // Poster
    const posterHtml: string = posterSrc
        ? `<img src="${posterSrc}" alt="${titulo}" class="det-poster">`
        : `<div class="det-poster-placeholder"></div>`;

    // Sinopse
    const sinopseHtml: string = sinopse
        ? `<div class="det-secao">
               <h3 class="det-secao-titulo">Sinopse</h3>
               <p class="det-sinopse">${sinopse}</p>
           </div>`
        : "";

    // Ficha técnica
    const fichaItens: Array<{ label: string; value: string }> = [];
    if (diretor)         fichaItens.push({ label: "Diretor",              value: diretor });
    if (ano)             fichaItens.push({ label: "Ano",                  value: ano });
    if (duracao)         fichaItens.push({ label: "Duração",              value: duracao });
    if (tipo === "serie" && numTemporadas)
                         fichaItens.push({ label: "Temporadas",           value: numTemporadas });
    if (idioma)          fichaItens.push({ label: "Idioma",               value: idioma });
    if (pais)            fichaItens.push({ label: "País",                 value: pais });
    if (classificacao)   fichaItens.push({ label: "Classificação",        value: classificacao });
    if (mediaNotas)      fichaItens.push({ label: "Nota média",           value: mediaNotas });
    if (totalAvaliacoes) fichaItens.push({ label: "Total de avaliações",  value: totalAvaliacoes });

    const fichaHtml: string = fichaItens.length > 0
        ? `<div class="det-secao">
               <h3 class="det-secao-titulo">Ficha Técnica</h3>
               <dl class="det-ficha">
                   ${fichaItens.map(item =>
                       `<div class="det-ficha-item"><dt>${item.label}</dt><dd>${item.value}</dd></div>`
                   ).join("")}
               </dl>
           </div>`
        : "";

    // Elenco
    const elencoHtml: string = elenco
        ? `<div class="det-secao">
               <h3 class="det-secao-titulo">Elenco</h3>
               <p class="det-elenco">${elenco}</p>
           </div>`
        : "";

    // Ações
    const acoesHtml: string = ehDono
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
                        ${tipo        ? `<span class="det-badge det-badge-tipo">${tipo}</span>`   : ""}
                        ${genero      ? `<span class="det-badge">${genero}</span>`                : ""}
                        ${nota        ? `<span class="det-nota">${nota}</span>`                   : ""}
                    </div>
                    ${sinopseHtml}
                    ${fichaHtml}
                    ${elencoHtml}
                    <div class="det-secao">
                        <h3 class="det-secao-titulo">Avaliação${autor ? " de " + autor : ""}</h3>
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
