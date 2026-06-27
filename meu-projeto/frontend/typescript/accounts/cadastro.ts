addEventListener("DOMContentLoaded", () => {
    document.getElementById("cadastroForm")!.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        const msg       = document.getElementById("msg") as HTMLDivElement;
        const username  = (document.getElementById("username")   as HTMLInputElement).value;
        const email     = (document.getElementById("email")      as HTMLInputElement).value;
        const firstName = (document.getElementById("first_name") as HTMLInputElement).value;
        const lastName  = (document.getElementById("last_name")  as HTMLInputElement).value;
        const password  = (document.getElementById("password")   as HTMLInputElement).value;
        const password2 = (document.getElementById("password2")  as HTMLInputElement).value;

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
                    last_name:  lastName,
                    password,
                    password2
                })
            });
            if (response.ok) {
                msg.textContent = "Conta criada com sucesso! Redirecionando para o login...";
                msg.className = "msg-feedback success";
                setTimeout(() => { location.href = "login.html"; }, 2500);
            } else {
                const err = await response.json();
                const detalhe = Object.values(err)
                    .map((v: unknown) => Array.isArray(v) ? (v as string[]).join(", ") : String(v))
                    .join(" ");
                msg.textContent = "Erro: " + detalhe;
                msg.className = "msg-feedback error";
            }
        } catch (error) {
            msg.textContent = `Erro de rede: ${error}`;
            msg.className = "msg-feedback error";
        }
    });
});
