onload = function() {
    (document.getElementById('insere') as HTMLButtonElement).addEventListener('click', evento => { location.href = 'insereReview.html' });
    exibeListaDeAvaliacoes();
}

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
            objTBody.appendChild(objTr);
        });
    } catch (error) {
        console.error("Erro ao buscar a lista de avaliações:", error);
    }
}