/**
 * script.ts — Lista de avaliações (index.html).
 * Renderiza cards no estilo do projeto 1, com modal de confirmação de exclusão
 * e barra de filtros (busca_titulo, busca_pessoa, tipo_midia, genero_midia, ordem_nota).
 */

let idParaApagar: number | null = null;
let usuarioLogado: string | null = null;

onload = () => {
    const token = localStorage.getItem("access_token");
    if (!token) { location.href = "home.html"; return; }

    carregarUsuarioLogado()
        .then(() => exibeListaDeAvaliacoes())
        .catch((error) => {
            console.error("Erro ao identificar usuário logado:", error);
            return exibeListaDeAvaliacoes();
        });

    configurarModal();
    configurarFiltros();
};

async function carregarUsuarioLogado(): Promise<void> {
    const response = await authFetch(backendAddress + "accounts/whoami/");
    if (!response.ok) return;

    const dados = await response.json();
    usuarioLogado = dados.username ?? dados.usuario ?? null;
}

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
 * Configura os eventos dos botões de filtrar e limpar.
 */
function configurarFiltros(): void {
    const btnFiltrar = document.getElementById("btn-filtrar") as HTMLButtonElement | null;
    const btnLimpar = document.getElementById("btn-limpar") as HTMLButtonElement | null;

    btnFiltrar?.addEventListener("click", () => {
        exibeListaDeAvaliacoes(lerFiltros());
    });

    btnLimpar?.addEventListener("click", () => {
        limparCamposFiltro();
        exibeListaDeAvaliacoes();
    });

    // Permite filtrar ao pressionar Enter em qualquer input de texto do painel
    const inputs = document.querySelectorAll<HTMLInputElement>("#filtros-panel input[type='text']");
    inputs.forEach(input => {
        input.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                exibeListaDeAvaliacoes(lerFiltros());
            }
        });
    });
}

/**
 * Lê os valores atuais dos controles de filtro e retorna um objeto de parâmetros.
 * :return: objeto com chave=parâmetro, valor=string
 */
function lerFiltros(): Record<string, string> {
    const params: Record<string, string> = {};

    const buscaTitulo = (document.getElementById("filtro-titulo") as HTMLInputElement)?.value.trim();
    if (buscaTitulo) params["busca_titulo"] = buscaTitulo;

    const buscaPessoa = (document.getElementById("filtro-pessoa") as HTMLInputElement)?.value.trim();
    if (buscaPessoa) params["busca_pessoa"] = buscaPessoa;

    const tipoMidia = (document.getElementById("filtro-tipo") as HTMLSelectElement)?.value;
    if (tipoMidia) params["tipo_midia"] = tipoMidia;

    const generoMidia = (document.getElementById("filtro-genero") as HTMLSelectElement)?.value;
    if (generoMidia) params["genero_midia"] = generoMidia;

    const ordemNota = (document.getElementById("filtro-ordem") as HTMLSelectElement)?.value;
    if (ordemNota) params["ordem_nota"] = ordemNota;

    return params;
}

/**
 * Limpa todos os campos do painel de filtros.
 */
function limparCamposFiltro(): void {
    const titulo = document.getElementById("filtro-titulo") as HTMLInputElement | null;
    const pessoa = document.getElementById("filtro-pessoa") as HTMLInputElement | null;
    const tipo   = document.getElementById("filtro-tipo")   as HTMLSelectElement | null;
    const genero = document.getElementById("filtro-genero") as HTMLSelectElement | null;
    const ordem  = document.getElementById("filtro-ordem")  as HTMLSelectElement | null;

    if (titulo)  titulo.value  = "";
    if (pessoa)  pessoa.value  = "";
    if (tipo)    tipo.value    = "";
    if (genero)  genero.value  = "";
    if (ordem)   ordem.value   = "";

    atualizarBuscaInfo({});
}

/**
 * Atualiza o bloco de informações sobre os filtros ativos.
 * :param params: objeto de parâmetros ativos
 */
function atualizarBuscaInfo(params: Record<string, string>): void {
    const infoEl = document.getElementById("busca-info") as HTMLDivElement | null;
    if (!infoEl) return;

    const nomesTipo: Record<string, string> = { filme: "Filmes", serie: "Séries" };
    const nomesGenero: Record<string, string> = {
        acao: "Ação", comedia: "Comédia", terror: "Terror", romance: "Romance",
        drama: "Drama", ficcao: "Ficção Científica", aventura: "Aventura",
        suspense: "Suspense", animacao: "Animação", documentario: "Documentário",
    };
    const nomesOrdem: Record<string, string> = { maior: "Maior Nota", menor: "Menor Nota" };

    const partes: string[] = [];
    if (params["busca_titulo"]) partes.push(`Título: <strong>"${params["busca_titulo"]}"</strong>`);
    if (params["busca_pessoa"]) partes.push(`Usuário: <strong>"${params["busca_pessoa"]}"</strong>`);
    if (params["tipo_midia"])   partes.push(`Tipo: <strong>${nomesTipo[params["tipo_midia"]] ?? params["tipo_midia"]}</strong>`);
    if (params["genero_midia"]) partes.push(`Gênero: <strong>${nomesGenero[params["genero_midia"]] ?? params["genero_midia"]}</strong>`);
    if (params["ordem_nota"])   partes.push(`Ordem: <strong>${nomesOrdem[params["ordem_nota"]] ?? params["ordem_nota"]}</strong>`);

    if (partes.length > 0) {
        infoEl.innerHTML = partes.join(" &bull; ");
        infoEl.classList.remove("oculto");
    } else {
        infoEl.innerHTML = "";
        infoEl.classList.add("oculto");
    }
}

/**
 * Remove uma avaliação pelo ID.
 * :param id: ID da avaliação a ser removida
 */
async function apagarAvaliacao(id: number): Promise<void> {
    try {
        await authFetch(backendAddress + "midias/avaliacao/" + id + "/", { method: "DELETE" });
        await exibeListaDeAvaliacoes(lerFiltros());
    } catch (error) {
        console.error("Erro ao apagar avaliação:", error);
    }
}

/**
 * Busca e renderiza os cards de avaliação no grid, aplicando filtros opcionais.
 * :param params: objeto de parâmetros de filtro (opcional)
 */
async function exibeListaDeAvaliacoes(params: Record<string, string> = {}): Promise<void> {
    const grid = document.getElementById("avaliacoes-grid") as HTMLDivElement;
    grid.innerHTML = `<div class="empty-state" id="carregando"><p>Carregando avaliações…</p></div>`;

    atualizarBuscaInfo(params);

    const queryString = new URLSearchParams(params).toString();
    const url = backendAddress + "midias/avaliacao/" + (queryString ? "?" + queryString : "");

    try {
        const response = await authFetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.status === 401) { location.href = "accounts/login.html"; return; }
        if (!response.ok) { grid.innerHTML = `<div class="empty-state"><p>Erro ao carregar avaliações.</p></div>`; return; }

        const avaliacoes: any[] = await response.json();
        grid.innerHTML = "";

        if (avaliacoes.length === 0) {
            const temFiltros = Object.keys(params).length > 0;
            grid.innerHTML = temFiltros
                ? `<div class="empty-state"><p>Nenhuma avaliação encontrada com os filtros aplicados.</p></div>`
                : `<div class="empty-state"><p>Ainda não há avaliações cadastradas.</p></div>`;
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
    const m = av["midia_detalhes"] ?? {};
    const posterHtml = m["poster_url"]
        ? `<div class="poster-container"><img src="${m["poster_url"]}" alt="${m["titulo"] ?? ""}" class="midia-poster"></div>`
        : "";

    // Data
    const dataHtml = av["assistido_em"]
        ? `<div class="assistido-em">Assistido em ${formatarDataLista(av["assistido_em"])}</div>`
        : "";

    const autor = obterAutorAvaliacaoLista(av);
    const podeEditar = !!usuarioLogado && autor === usuarioLogado;
    const acoesHtml = podeEditar
        ? `
        <div class="card-actions">
            <a href="update.html?id=${av["id"]}" class="btn btn-atualizar">Editar</a>
            <button class="btn btn-apagar" data-id="${av["id"]}">Excluir</button>
        </div>`
        : "";

    article.innerHTML = `
        ${posterHtml}
        <div class="card-content">
            <div class="card-header">
                <span class="pessoa-nome">${autor ?? ""}</span>
                <span class="nota">${av["nota"] ?? ""}</span>
            </div>
            <h2 class="midia-titulo">${m["titulo"] ?? "—"}</h2>
            ${dataHtml}
            <p class="comentario">${av["comentario"] || "Sem comentário"}</p>
            ${acoesHtml}
        </div>`;

    const btnApagar = article.querySelector(".btn-apagar") as HTMLButtonElement | null;
    if (btnApagar) {
        btnApagar.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            idParaApagar = Number(btnApagar.dataset["id"]);
            (document.getElementById("modal-apagar") as HTMLDivElement).classList.add("ativo");
        });
    }

    const btnAtualizar = article.querySelector(".btn-atualizar") as HTMLAnchorElement | null;
    if (btnAtualizar) {
        btnAtualizar.addEventListener("click", (e: Event) => e.stopPropagation());
    }

    article.style.cursor = "pointer";
    article.addEventListener("click", () => {
        location.href = "detalheAvaliacao.html?id=" + av["id"];
    });

    return article;
}

function obterAutorAvaliacaoLista(av: any): string | null {
    return typeof av["username"] === "string" && av["username"].trim() ? av["username"] : null;
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
