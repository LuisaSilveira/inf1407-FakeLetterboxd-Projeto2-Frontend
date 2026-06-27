/**
 * perfil.ts — Página de perfil (perfil.html).
 * Carrega dados do usuário, lista avaliações, permite editar perfil e deletar conta.
 */
/** Carrega e exibe os dados do perfil do usuário. */
declare function carregarPerfil(): Promise<void>;
/** Carrega e renderiza as avaliações do usuário no grid. */
declare function carregarAvaliacoesPerfil(): Promise<void>;
/**
 * Cria um card de avaliação para a página de perfil.
 * :param av: objeto de avaliação
 * :param onApagar: callback chamado ao clicar em Excluir
 */
declare function criaCardPerfilFnFn(av: any, onApagar: (id: number) => void): HTMLElement;
declare function obterAutorAvaliacaoPerfil(av: any): string | null;
/** Configura os botões de logout (modal). */
declare function configurarLogout(): void;
/** Configura botão de editar perfil e cancelar edição. */
declare function configurarEdicao(): void;
/** Salva as alterações do perfil via PATCH. */
declare function salvarPerfilFn(): Promise<void>;
/** Configura o modal de cancelar exclusão de avaliação. */
declare function configurarModalPerfil(): void;
/** Configura o botão de deletar conta. */
declare function configurarDeletar(): void;
/**
 * Formata data ISO para DD/MM/YYYY.
 * :param data: string no formato YYYY-MM-DD
 */
declare function formatarDataPerfil(data: string): string;
//# sourceMappingURL=perfil.d.ts.map