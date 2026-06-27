/**
 * insereReview.ts — Criação de avaliação (insereReview.html).
 * Fluxo fiel ao projeto 1: busca OMDB → seleciona mídia → preenche form → envia.
 */
/**
 * Busca títulos na OMDB via backend e exibe os resultados.
 */
declare function buscarOmdb(): Promise<void>;
/**
 * Cria um item de resultado de busca no estilo do projeto 1.
 * :param item: objeto retornado pela busca OMDB
 * :return: elemento div do resultado
 */
declare function criaResultadoItem(item: any): HTMLElement;
/**
 * Importa a mídia selecionada para o banco e exibe na seção de selecionada.
 * :param imdbID: ID da mídia no IMDB
 */
declare function selecionarMidia(imdbID: string): Promise<void>;
/**
 * Volta para a tela de busca, limpando a seleção atual.
 */
declare function trocarMidia(): void;
/**
 * Envia o formulário de avaliação para o backend.
 */
declare function inserirAvaliacao(): Promise<void>;
/**
 * Exibe mensagem de feedback.
 * :param el: elemento onde exibir
 * :param texto: texto da mensagem
 * :param tipo: "success" ou "error"
 */
declare function exibirMsgInsere(el: HTMLElement, texto: string, tipo: "success" | "error"): void;
declare function obterCampo(obj: any, chaves: string[]): string | undefined;
//# sourceMappingURL=insereReview.d.ts.map