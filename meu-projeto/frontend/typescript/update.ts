let midiaId: number | null = null;

onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { location.href = "accounts/login.html"; return; }

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { location.href = "/"; return; }

    await carregarAvaliacao(id);
    document.getElementById("atualiza")!.addEventListener("click", () => atualizarAvaliacao(id));
    document.getElementById("trocar-midia")!.addEventListener("click", abrirBuscaMidia);
    document.getElementById("buscaOmdb")!.addEventListener("click", buscarOmdbUpdate);
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

        // av["midia"] é o ID numérico da mídia
        midiaId = av["midia"] ?? null;

        // Preenche info da mídia com os campos que o backend já retorna na avaliação
        const poster = document.getElementById("poster-midia") as HTMLImageElement;
        const posterSrc: string = av["poster_midia"] ?? "";
        if (posterSrc) { poster.src = posterSrc; } else { poster.style.display = "none"; }

        (document.getElementById("titulo-midia") as HTMLElement).textContent = av["titulo_midia"] ?? "—";

        const tipo: string = av["tipo_midia"] ?? "";
        const genero: string = av["genero_midia"] ?? "";
        const detalhes = [tipo, genero].filter(Boolean).join(" • ");
        (document.getElementById("detalhes-midia") as HTMLElement).textContent = detalhes;

        (document.getElementById("sinopse-midia") as HTMLElement).textContent = av["sinopse"] ?? av["sinopse_midia"] ?? "";

        // Preenche form
        (document.getElementById("nota") as HTMLSelectElement).value = String(av["nota"] ?? 3);
        (document.getElementById("comentario") as HTMLTextAreaElement).value = av["comentario"] ?? "";
        (document.getElementById("assistido_em") as HTMLInputElement).value = av["assistido_em"] ?? "";

    } catch (error) {
        console.error("Erro ao carregar avaliação:", error);
    }
}

/** Exibe a seção de busca e oculta a mídia atual. */
function abrirBuscaMidia(): void {
    document.getElementById("secao-midia-atual")!.classList.add("oculto");
    document.getElementById("secao-busca")!.classList.remove("oculto");
}

/** Busca títulos na OMDB via backend. */
async function buscarOmdbUpdate(): Promise<void> {
    const query = (document.getElementById("queryOmdb") as HTMLInputElement).value.trim();
    if (!query) return;

    const btn = document.getElementById("buscaOmdb") as HTMLButtonElement;
    btn.textContent = "Buscando…";
    btn.disabled = true;

    const lista = document.getElementById("listaResultados") as HTMLDivElement;
    lista.innerHTML = "";

    try {
        const response = await authFetch(backendAddress + "midias/busca-omdb/?busca_midia=" + encodeURIComponent(query));
        const data = await response.json();

        if (response.ok && data.midias_encontradas?.length > 0) {
            data.midias_encontradas.forEach((item: any) => {
                lista.appendChild(criaItemResultadoUpdate(item));
            });
        } else {
            lista.innerHTML = `<div class="nenhum-resultado"><p>Nenhum resultado para "${query}"</p></div>`;
        }
    } catch (error) {
        console.error("Erro na busca OMDB:", error);
    } finally {
        btn.textContent = "Buscar";
        btn.disabled = false;
    }
}

/** Cria um item de resultado de busca. */
function criaItemResultadoUpdate(item: any): HTMLElement {
    const div = document.createElement("div");
    div.className = "resultado-item";

    const titulo: string = item["Title"] ?? item["titulo"] ?? "—";
    const posterSrc: string = item["Poster"] ?? item["poster_url"] ?? "";
    const imdbID = item["imdbID"] ?? item["imdb_id"] ?? item["id"] ?? item["pk"];

    div.innerHTML = `
        ${posterSrc && posterSrc !== "N/A" ? `<img src="${posterSrc}" alt="${titulo}" class="poster">` : `<div class="poster"></div>`}
        <div class="info-midia">
            <div class="titulo-midia">${titulo}</div>
            <div class="detalhes-midia">${item["Year"] ?? item["ano_lancamento"] ?? ""}</div>
        </div>
        <div class="actions">
            <button class="btn btn-primary">Selecionar</button>
        </div>`;

    div.querySelector("button")!.addEventListener("click", () => selecionarMidiaUpdate(String(imdbID ?? "")));
    return div;
}

/** Importa a mídia selecionada e atualiza a exibição. */
async function selecionarMidiaUpdate(imdbID: string): Promise<void> {
    if (!imdbID) return;
    try {
        const response = await authFetch(backendAddress + "midias/busca-omdb/?midia_selecionada=" + encodeURIComponent(imdbID));
        const data = await response.json();

        if (response.ok && data.midia_selecionada) {
            const midia = data.midia_selecionada;
            midiaId = midia.id;

            const poster = document.getElementById("poster-midia") as HTMLImageElement;
            if (midia.poster_url) { poster.src = midia.poster_url; poster.style.display = ""; }
            (document.getElementById("titulo-midia") as HTMLElement).textContent = midia.titulo ?? "—";
            const tipo: string = midia.tipo ?? "";
            const detalhes = [tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : "", midia.ano_lancamento ?? ""].filter(Boolean).join(" • ");
            (document.getElementById("detalhes-midia") as HTMLElement).textContent = detalhes;
            (document.getElementById("sinopse-midia") as HTMLElement).textContent = midia.sinopse ?? "";

            document.getElementById("secao-busca")!.classList.add("oculto");
            document.getElementById("secao-midia-atual")!.classList.remove("oculto");
            (document.getElementById("listaResultados") as HTMLDivElement).innerHTML = "";
            (document.getElementById("queryOmdb") as HTMLInputElement).value = "";
        }
    } catch (error) {
        console.error("Erro ao selecionar mídia:", error);
    }
}

/**
 * Envia os dados atualizados ao backend via PUT.
 * :param id: ID da avaliação
 */
async function atualizarAvaliacao(id: string): Promise<void> {
    const msg = document.getElementById("msg-feedback") as HTMLDivElement;

    const body: Record<string, any> = {
        midia: midiaId,
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
            setTimeout(() => { location.href = "detalheAvaliacao.html?id=" + id; }, 1500);
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