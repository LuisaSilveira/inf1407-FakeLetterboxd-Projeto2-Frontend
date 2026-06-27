/**
 * common.ts — Funções auxiliares para gerência de usuário.
 * Conforme slides 55-61 da aula de Controle de Acesso.
 * Funções:
 *   - Mostrar/ocultar conteúdo do campo senha (toggle-password)
 *   - Decodificar payload do token JWT
 *   - Verificar se o token expirou
 *   - Atualizar token de acesso pelo token de refresh
 *   - Função genérica de acesso HTTP com cabeçalho de autenticação (authFetch)
 */
/**
 * Função para decodificar um token JWT e extrair seu payload.
 * Conforme slide 56 da aula de Controle de Acesso.
 * @param token token a ser decodificado
 * @returns retorna o token decodificado
 */
declare const decodeJWT: (token: string) => any;
/**
 * Verifica se um token de acesso JWT expirou,
 * comparando a data de expiração do token com a data atual.
 * Conforme slide 57 da aula de Controle de Acesso.
 * @param token token cuja validade deve ser verificada
 * @returns verdadeiro se o token expirou, falso, caso contrário
 */
declare const isAccessTokenExpired: (token: string) => boolean;
/**
 * Função para atualizar o token de acesso usando o token de refresh.
 * Se o token de refresh for inválido ou expirado, ambos os tokens são removidos do localStorage.
 * Conforme slides 58-59 da aula de Controle de Acesso.
 */
declare const refreshAccessToken: () => Promise<void>;
/**
 * Função para fazer requisições HTTP autenticadas usando o token de acesso.
 * Antes de fazer a requisição, verifica se o token de acesso expirou.
 * Se o token de acesso expirou, tenta atualizar o token usando o token de refresh.
 * Se a atualização do token for bem-sucedida, a requisição é feita com o novo token de acesso.
 * Se a atualização do token falhar, a requisição é feita sem o token de acesso.
 * Conforme slides 60-61 da aula de Controle de Acesso.
 * @param url endereço do endpoint
 * @param options cabeçalhos da requisição http
 * @returns o resultado da requisição http feita usando fetch
 */
declare const authFetch: (url: string, options?: RequestInit) => Promise<Response>;
//# sourceMappingURL=common.d.ts.map