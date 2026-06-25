"use strict";
document.addEventListener("DOMContentLoaded", () => {
    // Para cada campo password, adiciona um ícone de olho para mostrar/ocultar a senha
    // cria um vetor de containers, cada um contendo um campo de senha e seu respectivo ícone de olho
    const containers = document.querySelectorAll(".password-container");
    // para cada container, adiciona um event listener ao ícone de olho para alternar entre mostrar e ocultar a senha
    containers.forEach(container => {
        const objInput = container.querySelector('input[type="password"]');
        const objImgEye = container.querySelector(".toggle-password");
        // verifica se o container está bem formado, ou seja, se contém um campo de senha e um ícone de olho
        if (!objInput || !objImgEye)
            return; // container mal formado
        // adiciona o event listener ao ícone de olho para alternar entre mostrar e ocultar a senha
        objImgEye.addEventListener("click", () => {
            if (objInput.type === "password") {
                objInput.type = "text";
                objImgEye.src = "img/eye.svg";
            }
            else {
                objInput.type = "password";
                objImgEye.src = "img/eye-off.svg";
            }
        });
    });
});
const decodeJWT = (token) => {
    const payload = token.split('.')[1];
    if (!payload)
        return null;
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
};
const isAccessTokenExpired = (token) => {
    const decoded = decodeJWT(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
};
const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        console.error('No refresh token available');
        return;
    }
    try {
        const response = await fetch(backendAddress + 'api/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });
        if (response.ok) {
            const token = await response.json();
            localStorage.setItem('access_token', token.access);
        }
        else {
            console.error('Failed to refresh access token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }
    catch (error) {
        console.error('Error refreshing access token:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};
const authFetch = async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token');
    if (accessToken && isAccessTokenExpired(accessToken)) {
        await refreshAccessToken();
        accessToken = localStorage.getItem('access_token');
    }
    if (accessToken) {
        options.headers = {
            ...(options.headers || {}),
            'Authorization': 'Bearer ' + accessToken
        };
    }
    return fetch(url, options);
};
//# sourceMappingURL=common.js.map