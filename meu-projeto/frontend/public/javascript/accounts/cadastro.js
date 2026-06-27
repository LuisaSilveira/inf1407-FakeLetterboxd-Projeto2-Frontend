"use strict";
/**
 * cadastro.ts — Cadastro de novo usuário.
 * Endpoint: POST accounts/cadastro/
 * Envia dados do novo usuário e redireciona para login após sucesso.
 */
addEventListener("DOMContentLoaded", () => {
    document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = document.getElementById("msg");
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const firstName = document.getElementById("first_name").value;
        const lastName = document.getElementById("last_name").value;
        const password = document.getElementById("password").value;
        const password2 = document.getElementById("password2").value;
        if (password !== password2) {
            msg.textContent = "As senhas não coincidem.";
            msg.className = "msg-feedback error";
            return;
        }
        try {
            const response = await fetch(backendAddress + "accounts/cadastro/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    password
                })
            });
            if (response.ok) {
                msg.textContent = "Conta criada com sucesso! Redirecionando para o login...";
                msg.className = "msg-feedback success";
                setTimeout(() => { location.href = "login.html"; }, 2500);
            }
            else {
                const err = await response.json();
                const detalhe = Object.values(err)
                    .map((v) => Array.isArray(v) ? v.join(", ") : String(v))
                    .join(" ");
                msg.textContent = "Erro: " + detalhe;
                msg.className = "msg-feedback error";
            }
        }
        catch (error) {
            msg.textContent = `Erro de rede: ${error}`;
            msg.className = "msg-feedback error";
        }
    });
});
//# sourceMappingURL=cadastro.js.map