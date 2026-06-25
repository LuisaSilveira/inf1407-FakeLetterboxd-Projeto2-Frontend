"use strict";
onload = function () {
    document.getElementById('insere').addEventListener('click', evento => { location.href = 'insereCarro.html'; });
    exibeListaDeCarros();
};
async function exibeListaDeCarros() {
    try {
        const response = await fetch(backendAddress + "carros/lista/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*'
            }
        });
        if (!response.ok) {
            throw new Error("Erro na resposta do servidor: " + response.status);
        }
        const carros = await response.json();
        let campos = ['name', 'mpg', 'cyl', 'disp', 'hp', 'wt', 'qsec', 'vsec', 'vs', 'am', 'gear'];
        let objTBody = document.getElementById("idtbody");
        objTBody.innerHTML = "";
        carros.forEach((carro) => {
            let objTr = document.createElement("tr");
            campos.forEach(campo => {
                let objTd = document.createElement("td");
                let href = document.createElement('a');
                href.href = 'update.html?id=' + carro['id'];
                href.textContent = carro[campo];
                objTd.appendChild(href);
                //objTd.textContent = carro[campo];
                objTr.appendChild(objTd);
            });
            objTBody.appendChild(objTr);
        });
    }
    catch (error) {
        console.error("Erro ao buscar a lista de carros:", error);
    }
}
//# sourceMappingURL=script.js.map