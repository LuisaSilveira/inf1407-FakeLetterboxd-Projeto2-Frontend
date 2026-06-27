/**
 * detalheAvaliacao.ts — Página de detalhes de uma avaliação (detalheAvaliacao.html).
 * Busca os dados pelo id da query string e renderiza na página.
 */
declare function buscarUsuarioLogado(): Promise<string | null>;
declare function carregarDetalheAvaliacao(id: number, usuarioLogado: string | null): Promise<void>;
declare function renderizarDetalhe(av: any, main: HTMLElement, usuarioLogado: string | null, id: number): void;
declare function formatarDataDetalhe(data: string): string;
//# sourceMappingURL=detalheAvaliacao.d.ts.map