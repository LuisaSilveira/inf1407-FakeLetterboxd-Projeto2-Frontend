const backendAddress = "https://studious-space-goldfish-76x547g9rggfrpwp-8000.app.github.dev/";

interface JwtResposta {
    access: string; // token de acesso
    refresh: string; // token para obter novo token de acesso quando o atual expirar
}