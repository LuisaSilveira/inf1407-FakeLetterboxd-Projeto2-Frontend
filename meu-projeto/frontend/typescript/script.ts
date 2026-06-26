onload = function() {
    // configura ação dos botões
    (document.getElementById('insere') as HTMLButtonElement)
        .addEventListener('click', evento => { location.href = 'insereReview.html' });
    (document.getElementById('remove') as HTMLButtonElement)
        .addEventListener('click', apagaAvaliacoes);
    exibeListaDeAvaliacoes(); // exibe lista de avaliações ao carregar a página
}

let apagaAvaliacoes = async (evento: Event) => {
    evento.preventDefault();
    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[name="id"]:checked');
    const checkedValues: string[] = [];
    checkboxes.forEach(checkbox => {
        checkedValues.push(checkbox.value);
    });
    if (checkedValues.length === 0) {
        alert('Selecione ao menos uma avaliação para remover.');
        return;
    }
    try {
        // O backend suporta DELETE individual por pk, então enviamos uma requisição por ID
        for (const id of checkedValues) {
            await authFetch(backendAddress + 'midias/avaliacao/' + id + '/', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
        }
        alert('Avaliações excluídas com sucesso!');
    } catch (error) {
        // Nota: Em um ambiente de produção, você deve lidar com erros de forma mais robusta
        console.error('Erro ao enviar dados para o backend:', error);
    } finally {
        exibeListaDeAvaliacoes(); // Atualiza a lista após a exclusão
    }
};

async function exibeListaDeAvaliacoes() {
    try {
        const response = await authFetch(backendAddress + "midias/avaliacao/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error("Erro na resposta do servidor: " + response.status);
        }
        const avaliacoes = await response.json();
        let objTBody = document.getElementById("idtbody") as HTMLTableSectionElement;
        objTBody.innerHTML = "";
        avaliacoes.forEach((avaliacao: any) => {
            let objTr = document.createElement("tr");
            // Campos da mídia associada
            const midia = avaliacao['midia'] ?? {};
            const camposMidia = ['titulo', 'tipo'];
            camposMidia.forEach(campo => {
                let objTd = document.createElement("td");
                let href = document.createElement('a') as HTMLAnchorElement;
                href.href = 'update.html?id=' + avaliacao['id'];
                href.textContent = midia[campo] ?? '';
                objTd.appendChild(href);
                objTr.appendChild(objTd);
            });
            // Campos da avaliação
            const camposAvaliacao = ['nota', 'comentario', 'assistido_em', 'dt_avaliacao'];
            camposAvaliacao.forEach(campo => {
                let objTd = document.createElement("td");
                let href = document.createElement('a') as HTMLAnchorElement;
                href.href = 'update.html?id=' + avaliacao['id'];
                href.textContent = avaliacao[campo] ?? '';
                objTd.appendChild(href);
                objTr.appendChild(objTd);
            });
            // Coluna com checkbox para seleção de remoção
            let checkbox = document.createElement('input') as HTMLInputElement;
            checkbox.setAttribute('type', 'checkbox');
            checkbox.setAttribute('name', 'id');
            checkbox.setAttribute('value', avaliacao['id']);
            let tdCheck = document.createElement('td') as HTMLTableCellElement;
            tdCheck.appendChild(checkbox);
            objTr.appendChild(tdCheck);
            objTBody.appendChild(objTr);
        });
    } catch (error) {
        console.error("Erro ao buscar a lista de avaliações:", error);
    }
}