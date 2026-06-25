"use strict";
onload = async () => {
    // Parte 1: carregar dados do carro a ser editado e preencher o formulário
    // Carrega os dados do carro a ser editado do banco de dados
    // Preenche o formulário com os dados do carro
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const idPlace = document.getElementById('id');
    if (id) {
        idPlace.textContent = id;
        try {
            const response = await fetch(backendAddress + 'carros/umcarro/' + id + '/');
            if (response.ok) {
                const carro = await response.json();
                let campos = ['id', 'name', 'mpg', 'cyl', 'disp', 'hp', 'wt', 'qsec', 'vs', 'am', 'gear'];
                campos.forEach(campo => {
                    document.getElementById(campo).value = carro[campo];
                });
            }
            else {
                console.error('Erro ao buscar dados do carro:', response.status);
            }
        }
        catch (error) {
            console.error('Erro ao buscar dados do carro:', error);
        }
    }
    else {
        idPlace.textContent = 'URL mal formada: ' + window.location;
        return;
    }
    // Parte 2: configurar o evento de clique do botão "Atualizar"
    const objBotao = document.getElementById('atualiza');
    objBotao.addEventListener('click', atualizaCarro);
};
async function atualizaCarro(evento) {
    evento.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const form = document.getElementById('meuFormulario');
    const elements = form.elements;
    const dados = {};
    // Coleta os dados do formulário
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.name) {
            dados[element.name] = element.value;
        }
    }
    try {
        const response = await fetch(backendAddress + 'carros/umcarro/' + id + '/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (response.ok) {
            document.getElementById('mensagem').textContent = 'Carro atualizado';
        }
        else {
            document.getElementById('mensagem').textContent = 'Erro ao atualizar';
        }
    }
    catch (error) {
        console.error('Erro ao enviar dados para o backend:', error);
    }
}
//# sourceMappingURL=update.js.map