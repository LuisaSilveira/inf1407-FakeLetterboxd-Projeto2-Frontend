/**
 * Carrega os dados da avaliação e preenche a tela.
 * :param id: ID da avaliação
 */
declare function carregarAvaliacao(id: string): Promise<void>;
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