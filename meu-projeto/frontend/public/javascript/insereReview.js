"use strict";
onload = () => {
    const objBotao = document.getElementById('insere');
    objBotao.addEventListener('click', async (evento) => {
        evento.preventDefault();
        let data = {};
        const elements = document.getElementById('meuFormulario').elements;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
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
                document.getElementById('mensagem').textContent = "Carro inserido com sucesso!";
            }
            else {
                document.getElementById('mensagem').textContent = "Erro ao inserir o carro.";
            }
        }
        catch (error) {
            console.error("Erro ao enviar os dados do carro:", error);
        }
    });
};
//# sourceMappingURL=insereReview.js.map