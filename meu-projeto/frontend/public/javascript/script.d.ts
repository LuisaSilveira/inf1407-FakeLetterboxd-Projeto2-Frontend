/**
 * script.ts — Lista de avaliações (index.html).
 * Renderiza cards no estilo do projeto 1, com modal de confirmação de exclusão
 * e barra de filtros (busca_titulo, busca_pessoa, tipo_midia, genero_midia, ordem_nota).
 */
declare let idParaApagar: number | null;
declare let usuarioLogado: string | null;
declare function carregarUsuarioLogado(): Promise<void>;
/**
 * Configura o modal de confirmação de exclusão.
 */
declare function configurarModal(): void;
/**
 * Configura os eventos dos botões de filtrar e limpar.
 */
declare function configurarFiltros(): void;
/**
 * Lê os valores atuais dos controles de filtro e retorna um objeto de parâmetros.
 * :return: objeto com chave=parâmetro, valor=string
 */
declare function lerFiltros(): Record<string, string>;
/**
 * Limpa todos os campos do painel de filtros.
 */
declare function limparCamposFiltro(): void;
/**
 * Atualiza o bloco de informações sobre os filtros ativos.
 * :param params: objeto de parâmetros ativos
 */
declare function atualizarBuscaInfo(params: Record<string, string>): void;
/**
 * Remove uma avaliação pelo ID.
 * :param id: ID da avaliação a ser removida
 */
declare function apagarAvaliacao(id: number): Promise<void>;
/**
 * Busca e renderiza os cards de avaliação no grid, aplicando filtros opcionais.
 * :param params: objeto de parâmetros de filtro (opcional)
 */
declare function exibeListaDeAvaliacoes(params?: Record<string, string>): Promise<void>;
/**
 * Cria um elemento de card de avaliação no estilo do projeto 1.
 * :param av: objeto de avaliação retornado pela API
 * :return: elemento article do card
 */
declare function criaCardLista(av: any): HTMLElement;
declare function obterAutorAvaliacaoLista(av: any): string | null;
/**
 * Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY.
 * :param data: string de data no formato ISO
 * :return: string formatada
 */
declare function formatarDataLista(data: string): string;
//# sourceMappingURL=script.d.ts.map