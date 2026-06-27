"use strict";
addEventListener("load", function () {
    // Configura os ícones de olho para mostrar/ocultar senha
    document.getElementById('eyeIconNovaSenha').addEventListener('click', trocaOlho);
    document.getElementById('eyeIconConfirmarSenha').addEventListener('click', trocaOlho);
    // Configura o botão de envio
    document.getElementById("enviaNovaSenha").addEventListener("click", async function (evento) {
        evento.preventDefault();
        const token = document.getElementById("token").value;
        const senha = document.getElementById("novaSenha").value;
        const senha2 = document.getElementById("confirmarSenha").value;
        const message = document.getElementById("message");
        if (senha !== senha2) {
            message.textContent = "As senhas não coincidem.";
            message.className = "msg-feedback error";
            return;
        }
        let response = await fetch(backendAddress + 'accounts/password-reset/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: token,
                new_password: senha
            })
        });
        if (response.ok) {
            message.textContent = "Senha alterada com sucesso! Redirecionando para a página de login...";
            message.className = "msg-feedback success";
            setTimeout(() => {
                location.href = "login.html";
            }, 3000);
        }
        else {
            const data = await response.json();
            message.textContent = data.detail || "Ocorreu um erro ao alterar a senha.";
            message.className = "msg-feedback error";
        }
    });
});
/**
 * Função para alternar a visibilidade da senha e trocar o ícone do olho.
 * @param evento evento de mouse
 */
const trocaOlho = (evento) => {
    const target = evento.target;
    const inputId = target.id === 'eyeIconNovaSenha' ? 'novaSenha' : 'confirmarSenha';
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        target.src = "../img/eye.svg";
    }
    else {
        input.type = "password";
        target.src = "../img/eye-off.svg";
    }
};
//# sourceMappingURL=passwordResetDone.js.map