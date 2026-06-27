declare let midiaId: number | null;
/**
 * Carrega os dados da avaliação e preenche a tela.
 * :param id: ID da avaliação
 */
declare function carregarAvaliacao(id: string): Promise<void>;
/** Exibe a seção de busca e oculta a mídia atual. */
declare function abrirBuscaMidia(): void;
/** Busca títulos na OMDB via backend. */
declare function buscarOmdbUpdate(): Promise<void>;
/** Cria um item de resultado de busca. */
declare function criaItemResultadoUpdate(item: any): HTMLElement;
/** Importa a mídia selecionada e atualiza a exibição. */
declare function selecionarMidiaUpdate(imdbID: string): Promise<void>;
/**
 * Envia os dados atualizados ao backend via PUT.
 * :param id: ID da avaliação
 */
declare function atualizarAvaliacao(id: string): Promise<void>;
/**
 * Exibe mensagem de feedback.
 * :param el: elemento alvo
 * :param texto: texto a exibir
 * :param tipo: classe de estilo
 */
declare function exibirMsgUpdate(el: HTMLElement, texto: string, tipo: "success" | "error"): void;
//# sourceMappingURL=update.d.ts.map