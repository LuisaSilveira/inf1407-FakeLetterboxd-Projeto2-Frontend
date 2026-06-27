/**
 * perfil.ts — Página de perfil (perfil.html).
 * Carrega dados do usuário, lista avaliações, permite editar perfil e deletar conta.
 */

let usuarioPerfil: string | null = null;

onload = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { location.href = "accounts/login.html"; return; }

    await carregarPerfil();
    await carregarAvaliacoesPerfil();
    configurarLogout();
    configurarEdicao();
    configurarModalPerfil();
    configurarDeletar();
    configurarFiltrosPerfil();
};

/** Carrega e exibe os dados do perfil do usuário. */
async function carregarPerfil(): Promise<void> {
    try {
        const response = await authFetch(backendAddress + "accounts/perfil/");
        if (response.status === 401) { location.href = "accounts/login.html"; return; }
        const dados = await response.json();
        usuarioPerfil = dados.username ?? null;

        (document.getElementById("perfil-username") as HTMLElement).textContent = dados.username ?? "";
        (document.getElementById("perfil-email") as HTMLElement).textContent = dados.email ?? "";
        const nome = [dados.first_name, dados.last_name].filter(Boolean).join(" ");
        (document.getElementById("perfil-nome") as HTMLElement).textContent = nome;
        (document.getElementById("perfil-bio") as HTMLElement).textContent = dados.bio ?? "";

        (document.getElementById("email") as HTMLInputElement).value = dados.email ?? "";
        (document.getElementById("first_name") as HTMLInputElement).value = dados.first_name ?? "";
        (document.getElementById("last_name") as HTMLInputElement).value = dados.last_name ?? "";
        (document.getElementById("bio") as HTMLTextAreaElement).value = dados.bio ?? "";
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}

/** Carrega e renderiza as avaliações do usuário no grid. */
async function carregarAvaliacoesPerfil(params: Record<string, string> = {}): Promise<void> {
    const grid = document.getElementById("avaliacoes-grid") as HTMLDivElement;
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

        const avaliacoes: any[] = await response.json();
        const avaliacoesDoUsuario = usuarioPerfil
            ? avaliacoes.filter((av: any) => obterAutorAvaliacaoPerfil(av) === usuarioPerfil)
            : avaliacoes;

        (document.getElementById("perfil-total-avaliacoes") as HTMLElement).textContent = String(avaliacoesDoUsuario.length);
        grid.innerHTML = "";

        if (avaliacoesDoUsuario.length === 0) {
            const temFiltros = Object.keys(params).length > 0;
            grid.innerHTML = temFiltros
                ? `<div class="empty-state"><p>Nenhuma avaliação encontrada com os filtros aplicados.</p></div>`
                : `<div class="empty-state"><p>Você ainda não tem avaliações cadastradas.</p></div>`;
            return;
        }

        let idParaApagar: number | null = null;
        avaliacoesDoUsuario.forEach((av: any) => {
            const card = criaCardPerfilFnFn(av, (id: number) => {
                idParaApagar = id;
                (document.getElementById("modal-apagar") as HTMLDivElement).classList.add("ativo");
            });
            grid.appendChild(card);
        });

        // Ensure we only add the event listener once, or replace the node to avoid duplicates
        const btnConfirmar = document.getElementById("modal-confirmar")!;
        const novoBtnConfirmar = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode!.replaceChild(novoBtnConfirmar, btnConfirmar);

        novoBtnConfirmar.addEventListener("click", async () => {
            if (idParaApagar === null) return;
            (document.getElementById("modal-apagar") as HTMLDivElement).classList.remove("ativo");
            await authFetch(backendAddress + "midias/avaliacao/" + idParaApagar + "/", { method: "DELETE" });
            idParaApagar = null;
            await carregarAvaliacoesPerfil(lerFiltrosPerfil());
        });

    } catch (error) {
        grid.innerHTML = `<div class="empty-state"><p>Erro de rede.</p></div>`;
        console.error("Erro ao carregar avaliações:", error);
    }
}

/**
 * Cria um card de avaliação para a página de perfil.
 * :param av: objeto de avaliação
 * :param onApagar: callback chamado ao clicar em Excluir
 */
function criaCardPerfilFnFn(av: any, onApagar: (id: number) => void): HTMLElement {
    const article = document.createElement("article");
    article.className = "avaliacao-card";
    article.style.cursor = "pointer";

    // Registra o click ANTES de qualquer manipulação de innerHTML para garantir
    // que a navegação funcione mesmo que ocorra algum erro nos listeners dos botões.
    article.addEventListener("click", () => {
        location.href = "detalheAvaliacao.html?id=" + av["id"];
    });

    const autor = obterAutorAvaliacaoPerfil(av) ?? "";

    const posterHtml = av["poster_midia"]
        ? `<div class="poster-container"><img src="${av["poster_midia"]}" alt="${av["titulo_midia"] ?? ""}" class="midia-poster"></div>` : "";

    const dataHtml = av["assistido_em"]
        ? `<div class="assistido-em">Assistido em ${formatarDataPerfil(av["assistido_em"])}</div>` : "";

    article.innerHTML = `
        ${posterHtml}
        <div class="card-content">
            <div class="card-header">
                <span class="pessoa-nome">${autor}</span>
                <span class="nota">${av["nota"] ?? ""}</span>
            </div>
            <h2 class="midia-titulo">${av["titulo_midia"] ?? "—"}</h2>
            ${dataHtml}
            <p class="comentario">${av["comentario"] || "Sem comentário"}</p>
            <div class="card-actions">
                <a href="update.html?id=${av["id"]}" class="btn btn-atualizar">Editar</a>
                <button class="btn btn-apagar" data-id="${av["id"]}">Excluir</button>
            </div>
        </div>`;

    const btnApagar = article.querySelector(".btn-apagar") as HTMLButtonElement | null;
    if (btnApagar) {
        btnApagar.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            onApagar(Number(av["id"]));
        });
    }

    const btnAtualizar = article.querySelector(".btn-atualizar") as HTMLAnchorElement | null;
    if (btnAtualizar) {
        btnAtualizar.addEventListener("click", (e: Event) => e.stopPropagation());
    }

    return article;
}

function obterAutorAvaliacaoPerfil(av: any): string | null {
    const candidato = av["usuario"] ?? av["username"] ?? av["user"] ?? av["autor"] ?? av["owner"];
    if (typeof candidato === "string" && candidato.trim()) return candidato;

    const candidatoObjeto = av["usuario"]?.username ?? av["user"]?.username ?? av["autor"]?.username ?? av["owner"]?.username;
    if (typeof candidatoObjeto === "string" && candidatoObjeto.trim()) return candidatoObjeto;

    return null;
}

/** Configura os botões de logout (modal). */
function configurarLogout(): void {
    const modal = document.getElementById("modal-logout") as HTMLDivElement;
    document.getElementById("btn-abrir-modal-logout")!.addEventListener("click", () => modal.classList.add("ativo"));
    document.getElementById("cancelar-logout")!.addEventListener("click", () => modal.classList.remove("ativo"));
    document.getElementById("confirmar-logout")!.addEventListener("click", () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        location.href = "home.html";
    });
}

/** Configura botão de editar perfil e cancelar edição. */
function configurarEdicao(): void {
    const formEdicao = document.getElementById("form-edicao") as HTMLDivElement;
    document.getElementById("btn-editar-perfil")!.addEventListener("click", (e: Event) => {
        e.preventDefault();
        formEdicao.classList.toggle("oculto");
    });
    document.getElementById("btn-cancelar-edicao")!.addEventListener("click", () => {
        formEdicao.classList.add("oculto");
    });
    document.getElementById("salvar-perfil")!.addEventListener("click", salvarPerfilFn);
}

/** Salva as alterações do perfil via PATCH. */
async function salvarPerfilFn(): Promise<void> {
    const msg = document.getElementById("msg-perfil") as HTMLDivElement;
    
    const body = {
        email:      (document.getElementById("email")      as HTMLInputElement).value,
        first_name: (document.getElementById("first_name") as HTMLInputElement).value,
        last_name:  (document.getElementById("last_name")  as HTMLInputElement).value,
        bio:        (document.getElementById("bio")        as HTMLTextAreaElement).value,
    };

    try {
        const response = await authFetch(backendAddress + "accounts/perfil/", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            location.reload();
        } else {
            const err = await response.json();
            msg.textContent = "Erro: " + Object.values(err).map((v: unknown) => Array.isArray(v) ? (v as string[]).join(", ") : String(v)).join(" ");
            msg.className = "msg-perfil error";
        }
    } catch {
        msg.textContent = "Erro de rede.";
        msg.className = "msg-perfil error";
    }
}

/** Configura o modal de cancelar exclusão de avaliação. */
function configurarModalPerfil(): void {
    document.getElementById("modal-cancelar")!.addEventListener("click", () => {
        (document.getElementById("modal-apagar") as HTMLDivElement).classList.remove("ativo");
    });
}

/** Configura o botão de deletar conta. */
function configurarDeletar(): void {
    document.getElementById("btn-deletar-conta")!.addEventListener("click", async () => {
        if (!confirm("Tem certeza? Todos os seus dados serão removidos permanentemente.")) return;
        try {
            const response = await authFetch(backendAddress + "accounts/perfil/", { method: "DELETE" });
            if (response.ok || response.status === 204) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                location.href = "/";
            }
        } catch (error) { console.error("Erro ao deletar conta:", error); }
    });
}

/**
 * Formata data ISO para DD/MM/YYYY.
 * :param data: string no formato YYYY-MM-DD
 */
function formatarDataPerfil(data: string): string {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

/** Configura os botões de filtrar e limpar. */
function configurarFiltrosPerfil(): void {
    const btnFiltrar = document.getElementById("btn-filtrar") as HTMLButtonElement | null;
    const btnLimpar = document.getElementById("btn-limpar") as HTMLButtonElement | null;

    btnFiltrar?.addEventListener("click", () => {
        carregarAvaliacoesPerfil(lerFiltrosPerfil());
    });

    btnLimpar?.addEventListener("click", () => {
        limparCamposFiltroPerfil();
        carregarAvaliacoesPerfil();
    });

    // Permite filtrar ao pressionar Enter em qualquer input de texto do painel
    const inputs = document.querySelectorAll<HTMLInputElement>("#filtros-panel input[type='text']");
    inputs.forEach(input => {
        input.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                carregarAvaliacoesPerfil(lerFiltrosPerfil());
            }
        });
    });
}

/** Lê os valores dos filtros atuais */
function lerFiltrosPerfil(): Record<string, string> {
    const params: Record<string, string> = {};

    const buscaTitulo = (document.getElementById("filtro-titulo") as HTMLInputElement)?.value.trim();
    if (buscaTitulo) params["busca_titulo"] = buscaTitulo;

    const tipoMidia = (document.getElementById("filtro-tipo") as HTMLSelectElement)?.value;
    if (tipoMidia) params["tipo_midia"] = tipoMidia;

    const generoMidia = (document.getElementById("filtro-genero") as HTMLSelectElement)?.value;
    if (generoMidia) params["genero_midia"] = generoMidia;

    const ordemNota = (document.getElementById("filtro-ordem") as HTMLSelectElement)?.value;
    if (ordemNota) params["ordem_nota"] = ordemNota;

    return params;
}

/** Limpa os filtros no UI */
function limparCamposFiltroPerfil(): void {
    const titulo = document.getElementById("filtro-titulo") as HTMLInputElement | null;
    const tipo   = document.getElementById("filtro-tipo")   as HTMLSelectElement | null;
    const genero = document.getElementById("filtro-genero") as HTMLSelectElement | null;
    const ordem  = document.getElementById("filtro-ordem")  as HTMLSelectElement | null;

    if (titulo)  titulo.value  = "";
    if (tipo)    tipo.value    = "";
    if (genero)  genero.value  = "";
    if (ordem)   ordem.value   = "";

    atualizarBuscaInfoPerfil({});
}

/** Atualiza a div visual com as tags de filtros ativos */
function atualizarBuscaInfoPerfil(params: Record<string, string>): void {
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
