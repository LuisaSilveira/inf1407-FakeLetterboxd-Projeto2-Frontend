/**
 * @param token token a ser decodificado
 * @returns retorna o token decodificado
 */
declare const decodeJWT: (token: string) => any;
/**
 * Verifica se um token de acesso JWT expirou,
 * comparando a data de expiração do token com a data atual.
 * @param token token cuja validade deve ser verificada
 * @returns verdadeiro se o token expirou, falso, caso contrário
 */
declare const isAccessTokenExpired: (token: string) => boolean;
/**
 * Função para atualizar o token de acesso usando o token de refresh.
 * Se o token de refresh for inválido ou expirado, ambos os tokens são removidos do localStorage.
 */
declare const refreshAccessToken: () => Promise<void>;
/**
 * Função para fazer requisições HTTP autenticadas usando o token de acesso.
 * Antes de fazer a requisição, verifica se o token de acesso expirou.
 * Se o token de acesso expirou, tenta atualizar o token usando o token de refresh.
 * Se a atualização do token for bem-sucedida, a requisição é feita com o novo token de acesso.
 * Se a atualização do token falhar, a requisição é feita sem o token de acesso.
 * @param url endereço do endpoint
 * @param options cabeçalhos da requisição http
 * @returns o resultado da requisição http feita usando fetch
 */
declare const authFetch: (url: string, options?: RequestInit) => Promise<Response>;
//# sourceMappingURL=common.d.ts.map