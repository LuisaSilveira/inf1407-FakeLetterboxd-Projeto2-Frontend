/**
 * insereReview.ts — Criação de avaliação (insereReview.html).
 * Fluxo fiel ao projeto 1: busca OMDB → seleciona mídia → preenche form → envia.
 */

onload = () => {
    const token = localStorage.getItem("access_token");
    if (!token) { location.href = "home.html"; return; }

    document.getElementById("buscaOmdb")!.addEventListener("click", buscarOmdb);
    document.getElementById("trocar-midia")!.addEventListener("click", trocarMidia);
    document.getElementById("insere")!.addEventListener("click", inserirAvaliacao);
};

/**
 * Busca títulos na OMDB via backend e exibe os resultados.
 */
async function buscarOmdb(): Promise<void> {
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
                lista.appendChild(criaResultadoItem(item));
            });
        } else {
            lista.innerHTML = `<div class="nenhum-resultado"><p>Nenhum resultado para "${query}"</p><p>Tente outro termo de busca</p></div>`;
        }
    } catch (error) {
        console.error("Erro na busca OMDB:", error);
    } finally {
        btn.textContent = "Buscar";
        btn.disabled = false;
    }
}

/**
 * Cria um item de resultado de busca no estilo do projeto 1.
 * :param item: objeto retornado pela busca OMDB
 * :return: elemento div do resultado
 */
function criaResultadoItem(item: any): HTMLElement {
    const div = document.createElement("div");
    div.className = "resultado-item";

    const titulo = obterCampo(item, ["Title", "titulo"]);
    const posterSrc = obterCampo(item, ["Poster", "poster_url"]);
    const imdbID = obterCampo(item, ["imdbID", "imdb_id", "id", "pk"]);
    div.innerHTML = `
        ${posterSrc && posterSrc !== "N/A" ? `<img src="${posterSrc}" alt="${titulo ?? ""}" class="poster">` : `<div class="poster"></div>`}
        <div class="info-midia">
            <div class="titulo-midia">${titulo ?? "—"}</div>
            <div class="detalhes-midia">${obterCampo(item, ["Year", "ano_lancamento"]) ?? ""}</div>
        </div>
        <div class="actions">
            <button class="btn btn-primary">Selecionar</button>
        </div>`;

    div.querySelector("button")!.addEventListener("click", () => selecionarMidia(String(imdbID ?? "")));
    return div;
}

/**
 * Importa a mídia selecionada para o banco e exibe na seção de selecionada.
 * :param imdbID: ID da mídia no IMDB
 */
async function selecionarMidia(imdbID: string): Promise<void> {
    if (!imdbID) {
        console.error("Seleção de mídia sem identificador válido.");
        return;
    }

    try {
        const response = await authFetch(backendAddress + "midias/busca-omdb/?midia_selecionada=" + encodeURIComponent(imdbID));
        const data = await response.json();

        if (response.ok && data.midia_selecionada) {
            const midia = data.midia_selecionada;
            (document.getElementById("midia_id") as HTMLInputElement).value = String(midia.id);
            (document.getElementById("poster-selecionado") as HTMLImageElement).src = midia.poster_url ?? "";
            (document.getElementById("titulo-selecionado") as HTMLElement).textContent = midia.titulo;
            (document.getElementById("detalhes-selecionado") as HTMLElement).textContent =
                `${midia.tipo ? midia.tipo.charAt(0).toUpperCase() + midia.tipo.slice(1) : ""} • ${midia.ano_lancamento ?? ""}${midia.diretor ? " • " + midia.diretor : ""}`;
            (document.getElementById("sinopse-selecionada") as HTMLElement).textContent = midia.sinopse ?? "";

            // Esconde busca, mostra selecionada e form
            document.getElementById("secao-busca")!.classList.add("oculto");
            document.getElementById("secao-selecionada")!.classList.remove("oculto");
            document.getElementById("secao-form")!.classList.remove("oculto");
            document.getElementById("listaResultados")!.innerHTML = "";
        }
    } catch (error) {
        console.error("Erro ao selecionar mídia:", error);
    }
}

/**
 * Volta para a tela de busca, limpando a seleção atual.
 */
function trocarMidia(): void {
    (document.getElementById("midia_id") as HTMLInputElement).value = "";
    document.getElementById("secao-busca")!.classList.remove("oculto");
    document.getElementById("secao-selecionada")!.classList.add("oculto");
    document.getElementById("secao-form")!.classList.add("oculto");
}

/**
 * Envia o formulário de avaliação para o backend.
 */
async function inserirAvaliacao(): Promise<void> {
    const msg = document.getElementById("msg-feedback") as HTMLDivElement;
    const midiaId = (document.getElementById("midia_id") as HTMLInputElement).value;

    if (!midiaId) {
        exibirMsgInsere(msg, "Busque e selecione uma mídia primeiro.", "error");
        return;
    }

    const body = {
        midia: parseInt(midiaId),
        nota: parseInt((document.getElementById("nota") as HTMLSelectElement).value),
        comentario: (document.getElementById("comentario") as HTMLTextAreaElement).value,
        assistido_em: (document.getElementById("assistido_em") as HTMLInputElement).value || null
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
        } else {
            const err = await response.json();
            exibirMsgInsere(msg, "Erro: " + JSON.stringify(err), "error");
        }
    } catch (error) {
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
function exibirMsgInsere(el: HTMLElement, texto: string, tipo: "success" | "error"): void {
    el.textContent = texto;
    el.className = `msg-feedback ${tipo}`;
}

function obterCampo(obj: any, chaves: string[]): string | undefined {
    for (const chave of chaves) {
        const valor = obj?.[chave];
        if (valor !== undefined && valor !== null && valor !== "") {
            return String(valor);
        }
    }
    return undefined;
}
