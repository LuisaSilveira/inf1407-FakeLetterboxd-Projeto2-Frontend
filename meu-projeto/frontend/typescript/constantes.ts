const backendAddress = "https://literate-space-telegram-4xjxjq64g7x27qw-8000.app.github.dev/";

interface JwtResposta {
    access: string; // token de acesso
    refresh: string; // token para obter novo token de acesso quando o atual expirar
}