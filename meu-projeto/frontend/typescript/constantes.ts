const backendAddress = "http://localhost:8000/";

interface JwtResposta {
    access: string; // token de acesso
    refresh: string; // token para obter novo token de acesso quando o atual expirar
}