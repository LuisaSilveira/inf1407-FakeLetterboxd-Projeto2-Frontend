addEventListener("load", function() {
    // Configura os ícones de olho para mostrar/ocultar senha
    (document.getElementById('eyeIconNovaSenha')     as HTMLImageElement).addEventListener('click', trocaOlho);
    (document.getElementById('eyeIconConfirmarSenha') as HTMLImageElement).addEventListener('click', trocaOlho);

    // Configura o botão de envio
    (document.getElementById("enviaNovaSenha") as HTMLButtonElement).addEventListener("click", async function(evento) {
        evento.preventDefault();
        const token = (document.getElementById("token") as HTMLInputElement).value;
        const senha = (document.getElementById("novaSenha") as HTMLInputElement).value;
        const senha2 = (document.getElementById("confirmarSenha") as HTMLInputElement).value;
        const message = document.getElementById("message") as HTMLDivElement;
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
        } else {
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
const trocaOlho = (evento: MouseEvent) => {
    const target = evento.target as HTMLImageElement;
    const inputId = target.id === 'eyeIconNovaSenha' ? 'novaSenha' : 'confirmarSenha';
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input.type === "password") {
        input.type = "text";
        target.src = "../img/eye.svg";
    } else {
        input.type = "password";
        target.src = "../img/eye-off.svg";
    }
};
