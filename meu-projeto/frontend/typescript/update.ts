onload = async () => {
    // Parte 1: carregar dados da avaliação a ser editada e preencher o formulário
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const idPlace = document.getElementById('idAvaliacao') as HTMLSpanElement;
    if (id) {
        idPlace.textContent = id;
        try {
            const response = await authFetch(backendAddress + 'midias/avaliacao/' + id + '/');
            if (response.ok) {
                const avaliacao = await response.json();
                // Preenche campos da avaliação
                const camposAvaliacao = ['nota', 'comentario', 'assistido_em'];
                camposAvaliacao.forEach(campo => {
                    const el = document.getElementById(campo) as HTMLInputElement;
                    if (el) el.value = avaliacao[campo] ?? '';
                });
                // Exibe info da mídia (somente leitura)
                const midia = avaliacao['midia'] ?? {};
                const infoMidia = document.getElementById('infoMidia') as HTMLParagraphElement;
                if (infoMidia) {
                    infoMidia.textContent = (midia['titulo'] ?? '') + ' (' + (midia['tipo'] ?? '') + ', ' + (midia['ano_lancamento'] ?? '') + ')';
                }
            } else {
                console.error('Erro ao buscar dados da avaliação:', response.status);
            }
        } catch (error) {
            console.error('Erro ao buscar dados da avaliação:', error);
        }
    } else {
        idPlace.textContent = 'URL mal formada: ' + window.location;
        return;
    }
    // Parte 2: configurar o evento de clique do botão "Atualizar"
    const objBotao = document.getElementById('atualiza') as HTMLButtonElement;
    objBotao.addEventListener('click', atualizaAvaliacao);
}

async function atualizaAvaliacao(evento: MouseEvent) {
    evento.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const form = document.getElementById('meuFormulario') as HTMLFormElement;
    const elements = form.elements;
    const dados = {} as Record<string, string>;
    // Coleta os dados do formulário
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLInputElement;
        if (element.name) { dados[element.name] = element.value; }
    }

    try {
        const response = await authFetch(backendAddress + 'midias/avaliacao/' + id + '/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (response.ok) {
            (document.getElementById('mensagem') as HTMLDivElement).textContent = 'Avaliação atualizada com sucesso!';
        } else {
            const err = await response.json();
            (document.getElementById('mensagem') as HTMLDivElement).textContent = 'Erro ao atualizar: ' + JSON.stringify(err);
        }
    } catch (error) {
        console.error('Erro ao enviar dados para o backend:', error);
    }
}