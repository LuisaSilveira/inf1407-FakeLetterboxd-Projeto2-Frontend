"use strict";
onload = async () => {
    var _a, _b, _c, _d;
    // Parte 1: carregar dados da avaliação a ser editada e preencher o formulário
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const idPlace = document.getElementById('idAvaliacao');
    if (id) {
        idPlace.textContent = id;
        try {
            const response = await authFetch(backendAddress + 'midias/avaliacao/' + id + '/');
            if (response.ok) {
                const avaliacao = await response.json();
                // Preenche campos da avaliação
                const camposAvaliacao = ['nota', 'comentario', 'assistido_em'];
                camposAvaliacao.forEach(campo => {
                    var _a;
                    const el = document.getElementById(campo);
                    if (el)
                        el.value = (_a = avaliacao[campo]) !== null && _a !== void 0 ? _a : '';
                });
                // Exibe info da mídia (somente leitura)
                const midia = (_a = avaliacao['midia']) !== null && _a !== void 0 ? _a : {};
                const infoMidia = document.getElementById('infoMidia');
                if (infoMidia) {
                    infoMidia.textContent = ((_b = midia['titulo']) !== null && _b !== void 0 ? _b : '') + ' (' + ((_c = midia['tipo']) !== null && _c !== void 0 ? _c : '') + ', ' + ((_d = midia['ano_lancamento']) !== null && _d !== void 0 ? _d : '') + ')';
                }
            }
            else {
                console.error('Erro ao buscar dados da avaliação:', response.status);
            }
        }
        catch (error) {
            console.error('Erro ao buscar dados da avaliação:', error);
        }
    }
    else {
        idPlace.textContent = 'URL mal formada: ' + window.location;
        return;
    }
    // Parte 2: configurar o evento de clique do botão "Atualizar"
    const objBotao = document.getElementById('atualiza');
    objBotao.addEventListener('click', atualizaAvaliacao);
};
async function atualizaAvaliacao(evento) {
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
        const response = await authFetch(backendAddress + 'midias/avaliacao/' + id + '/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (response.ok) {
            document.getElementById('mensagem').textContent = 'Avaliação atualizada com sucesso!';
        }
        else {
            const err = await response.json();
            document.getElementById('mensagem').textContent = 'Erro ao atualizar: ' + JSON.stringify(err);
        }
    }
    catch (error) {
        console.error('Erro ao enviar dados para o backend:', error);
    }
}
//# sourceMappingURL=update.js.map