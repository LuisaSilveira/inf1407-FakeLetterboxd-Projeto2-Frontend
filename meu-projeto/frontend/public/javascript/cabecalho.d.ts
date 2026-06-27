/**
 * cabecalho.ts — Navbar do site.
 * Verifica autenticação via whoami e exibe menu adequado.
 */
/**
 * Função para identificar o usuário autenticado.
 * Exibe o nome do usuário autenticado
 * ou "visitante" se não houver um usuário autenticado.
 */
declare const identifica: () => Promise<void>;
/**
 * Função para realizar o logout do usuário.
 * Removendo os tokens do armazenamento local
 * e redireciona para a home page.
 * @param evento click de mouse
 */
declare const logout: (evento: MouseEvent) => void;
//# sourceMappingURL=cabecalho.d.ts.map