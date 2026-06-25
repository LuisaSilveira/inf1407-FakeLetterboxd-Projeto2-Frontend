onload = () => {
    const objBotao = document.getElementById('insere') as HTMLButtonElement;
    objBotao.addEventListener('click', async (evento) => {
        evento.preventDefault();
        let data: Record<string, string> = {};
        const elements = (document.getElementById('meuFormulario') as HTMLFormElement).elements;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLInputElement;
            if (element.name) {
                data[element.name] = element.value;
            }
        }
        try {
            const response = await fetch(backendAddress + "carros/criar/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                (document.getElementById('mensagem') as HTMLDivElement).textContent = "Carro inserido com sucesso!";
            }
            else {
                (document.getElementById('mensagem') as HTMLDivElement).textContent = "Erro ao inserir o carro.";
            }
        } catch (error) {
            console.error("Erro ao enviar os dados do carro:", error);
        }
    });
}