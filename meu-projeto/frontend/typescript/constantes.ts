const backendAddress = "https://effective-space-waddle-xj5j5rx6rpj26wqg-8000.app.github.dev/";

interface JwtResposta {
    access: string; // token de acesso
    refresh: string; // token para obter novo token de acesso quando o atual expirar
}