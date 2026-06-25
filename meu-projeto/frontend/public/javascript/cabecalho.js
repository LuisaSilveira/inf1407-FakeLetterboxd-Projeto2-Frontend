"use strict";
addEventListener('load', async () => {
    var _a;
    (_a = document.getElementById('logout')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', logout);
    identifica();
});
const identifica = async () => {
    var _a;
    const spanElement = document.getElementById('identificacao');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    };
    const response = await authFetch(backendAddress + 'accounts/whoami/', {
        method: 'GET',
        headers: headers
    });
    let objDivlogged = document.getElementById('logged');
    let objDivunlogged = document.getElementById('unlogged');
    if (response.ok) {
        // token enviado no cabeçalho foi aceito pelo servidor
        const data = await response.json();
        objDivlogged.classList.remove('invisivel');
        objDivlogged.classList.add('visivel');
        objDivunlogged.classList.remove('visivel');
        objDivunlogged.classList.add('invisivel');
        spanElement.textContent = (_a = data.username) !== null && _a !== void 0 ? _a : 'visitante';
    }
    else {
        // token enviado no cabeçalho foi rejeitado pelo servidor
        objDivlogged.classList.remove('visivel');
        objDivlogged.classList.add('invisivel');
        objDivunlogged.classList.remove('invisivel');
        objDivunlogged.classList.add('visivel');
        spanElement.textContent = 'visitante';
    }
};
const logout = (evento) => {
    evento.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
};
//# sourceMappingURL=cabecalho.js.map