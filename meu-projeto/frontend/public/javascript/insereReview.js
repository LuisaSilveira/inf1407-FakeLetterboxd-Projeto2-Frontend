"use strict";
onload = () => {
    // Passo 1: busca por título — retorna lista de resultados da OMDB
    const objBotaoBusca = document.getElementById('buscaOmdb');
    objBotaoBusca.addEventListener('click', async (evento) => {
        var _a;
        evento.preventDefault();
        const query = document.getElementById('queryOmdb').value;
        if (!query)
            return;
        try {
            const response = await authFetch(backendAddress + 'midias/busca-omdb/?busca_midia=' + encodeURIComponent(query));
            const resultado = await response.json();
            const listaEl = document.getElementById('listaResultados');
            listaEl.innerHTML = '';
            document.getElementById('resultadoBusca').textContent = '';
            if (response.ok && ((_a = resultado.midias_encontradas) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                resultado.midias_encontradas.forEach((item) => {
                    const li = document.createElement('li');
                    li.textContent = item.Title + ' (' + item.Year + ')';
                    li.style.cursor = 'pointer';
                    // Passo 2: ao clicar no resultado, importa a mídia para o banco
                    li.addEventListener('click', async () => {
                        try {
                            const selResp = await authFetch(backendAddress + 'midias/busca-omdb/?midia_selecionada=' + encodeURIComponent(item.imdbID));
                            const selData = await selResp.json();
                            if (selResp.ok && selData.midia_selecionada) {
                                const midia = selData.midia_selecionada;
                                // Guarda o ID interno da mídia no campo hidden
                                document.getElementById('midia_id').value = String(midia.id);
                                document.getElementById('resultadoBusca').textContent =
                                    'Mídia selecionada: ' + midia.titulo + ' (' + midia.tipo + ', ' + midia.ano_lancamento + ')';
                                listaEl.innerHTML = '';
                            }
                            else {
                                document.getElementById('resultadoBusca').textContent =
                                    'Erro ao importar a mídia.';
                            }
                        }
                        catch (error) {
                            console.error('Erro ao selecionar mídia:', error);
                        }
                    });
                    listaEl.appendChild(li);
                });
            }
            else {
                document.getElementById('resultadoBusca').textContent = 'Nenhuma mídia encontrada.';
            }
        }
        catch (error) {
            console.error('Erro ao buscar no OMDB:', error);
        }
    });
    // Botão de inserir avaliação
    const objBotao = document.getElementById('insere');
    objBotao.addEventListener('click', async (evento) => {
        evento.preventDefault();
        const midia_id = document.getElementById('midia_id').value;
        const nota = document.getElementById('nota').value;
        const comentario = document.getElementById('comentario').value;
        const assistido_em = document.getElementById('assistido_em').value;
        if (!midia_id) {
            document.getElementById('mensagem').textContent =
                'Por favor, busque e selecione uma mídia antes de inserir.';
            return;
        }
        const data = {
            midia: parseInt(midia_id),
            nota: parseInt(nota),
            comentario: comentario,
            assistido_em: assistido_em || null
        };
        try {
            const response = await authFetch(backendAddress + "midias/avaliacao/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                document.getElementById('mensagem').textContent = "Avaliação inserida com sucesso!";
            }
            else {
                const err = await response.json();
                document.getElementById('mensagem').textContent =
                    "Erro ao inserir a avaliação: " + JSON.stringify(err);
            }
        }
        catch (error) {
            console.error("Erro ao enviar os dados da avaliação:", error);
        }
    });
};
//# sourceMappingURL=insereReview.js.map