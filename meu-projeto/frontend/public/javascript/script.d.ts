/**
 * script.ts — Lista de avaliações (index.html).
 * Renderiza cards no estilo do projeto 1, com modal de confirmação de exclusão.
 */
declare let idParaApagar: number | null;
/**
 * Configura o modal de confirmação de exclusão.
 */
declare function configurarModal(): void;
/**
 * Remove uma avaliação pelo ID.
 * :param id: ID da avaliação a ser removida
 */
declare function apagarAvaliacao(id: number): Promise<void>;
/**
 * Busca e renderiza os cards de avaliação no grid.
 */
declare function exibeListaDeAvaliacoes(): Promise<void>;
/**
 * Cria um elemento de card de avaliação no estilo do projeto 1.
 * :param av: objeto de avaliação retornado pela API
 * :return: elemento article do card
 */
declare function criaCardLista(av: any): HTMLElement;
/**
 * Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY.
 * :param data: string de data no formato ISO
 * :return: string formatada
 */
declare function formatarDataLista(data: string): string;
//# sourceMappingURL=script.d.ts.map