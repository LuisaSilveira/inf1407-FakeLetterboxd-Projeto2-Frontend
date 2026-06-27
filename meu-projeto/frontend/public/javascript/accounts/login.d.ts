/**
 * Função para realizar o login do usuário, enviando as credenciais para o backend
 * e recebendo os tokens JWT em resposta.
 * @param username username
 * @param password senha
 * @returns promise JSON com tokens access e refresh
 */
declare function login(username: string, password: string): Promise<JwtResposta>;
//# sourceMappingURL=login.d.ts.map