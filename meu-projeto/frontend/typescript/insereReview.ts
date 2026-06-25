onload = () => {
    // Botão de busca OMDB: pesquisa a mídia e preenche o campo imdb_id
    const objBotaoBusca = document.getElementById('buscaOmdb') as HTMLButtonElement;
    objBotaoBusca.addEventListener('click', async (evento) => {
        evento.preventDefault();
        const query = (document.getElementById('queryOmdb') as HTMLInputElement).value;
        if (!query) return;
        try {
            const response = await authFetch(backendAddress + 'midias/busca-omdb/?q=' + encodeURIComponent(query));
            const resultado = await response.json();
            if (response.ok && resultado) {
                (document.getElementById('imdb_id') as HTMLInputElement).value = resultado['imdbID'] ?? '';
                (document.getElementById('resultadoBusca') as HTMLDivElement).textContent =
                    'Mídia encontrada: ' + (resultado['Title'] ?? '') + ' (' + (resultado['Year'] ?? '') + ')';
            } else {
                (document.getElementById('resultadoBusca') as HTMLDivElement).textContent = 'Mídia não encontrada.';
            }
        } catch (error) {
            console.error('Erro ao buscar no OMDB:', error);
        }
    });

    // Botão de inserir avaliação
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
            const response = await authFetch(backendAddress + "midias/avaliacao/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                (document.getElementById('mensagem') as HTMLDivElement).textContent = "Avaliação inserida com sucesso!";
            } else {
                const err = await response.json();
                (document.getElementById('mensagem') as HTMLDivElement).textContent = "Erro ao inserir a avaliação: " + JSON.stringify(err);
            }
        } catch (error) {
            console.error("Erro ao enviar os dados da avaliação:", error);
        }
    });
}