const backendAddress = "https://luisas4.pythonanywhere.com/";

interface JwtResposta {
    access: string; // token de acesso
    refresh: string; // token para obter novo token de acesso quando o atual expirar
}