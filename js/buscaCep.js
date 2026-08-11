//#region importações

//#endregion

//#region captura do input
let buscaCepDisplay = document.querySelector("#displayCep");//area que vai mostrar os dados
let buscaCepSearch = document.querySelector(".buscaCep_search");//onde está as ferramentas de pesquisa
let buscaCepTable = document.querySelector("#tableCeps");

//#region local dos inputs do buscaCep_search

/*
vamos usar o .trim() na hora de capturar os valoes.
Permite a captura atualizada e sem espacos em branco,
só nas pontas, mas tá bom.
*/
let inputCep = document.querySelector("#InputUserCep");
let inputUf = document.querySelector("#searchState");
let inputCity = document.querySelector("#InputUserCity");
let inputLog = document.querySelector("#InputUserLog");


//#endregion

//#endregion

//#region botão de envio
let buscaCepBtn = document.querySelector("#searchEnviate");

if (buscaCepDisplay) {
    buscaCepSearch.addEventListener('input', () => {
        //#region inpedindo o user de fazer bosta
        const input_notCep = [inputCity, inputLog, inputUf];

        if (inputCep.value !== "") {
            inputCep.disabled = false;

            input_notCep.forEach((element) => {
                element.disabled = true;
                element.value = "";
            });

        } else if (input_notCep.some(element => element.value.trim() !== "")) {
            inputCep.disabled = true;
            inputCep.value = "";

            input_notCep.forEach((element) => {
                element.disabled = false;
            });

        } else {
            // Se TUDO estiver vazio: destrava todos para o usuário escolher por onde começar
            inputCep.disabled = false;

            input_notCep.forEach((element) => {
                element.disabled = false;
            });
        }
        //#endregion
    });

    buscaCepSearch.addEventListener('input', () => {
        const botao = buscaCepBtn.classList.toggle("deletar", false);
        buscaCepBtn.innerHTML = "Buscar";
    });

    buscaCepBtn.addEventListener('click', () => {
        let btn_state = buscaCepBtn.classList.toggle("deletar");//add true

        if (btn_state) { //se tem o deletar
            buscaCepBtn.innerHTML = "Limpar";
            viaCep();
        } else {
            buscaCepBtn.innerHTML = "Buscar";
            window.location.reload();
        }
    });
}
//#endregion

//#region criação da tabela

//#region cabeçalho dinamico
const titles = ["Cep", "UF", "Cidade", "Bairro", "Logradouro"]; //titulo dinamico para o futuro

titles.forEach((element) => {
    const th = document.createElement('th');
    th.classList.add("titleTable");

    th.innerHTML = element;

    buscaCepTable.appendChild(th);
})

//select dinâmico tambem
const ufs = await statesSelect();

for (let uf of ufs) {
    const opt = document.createElement('option');
    opt.value = uf;
    opt.textContent = uf;

    inputUf.appendChild(opt);
}

//#endregion

async function viaCep() {
    let cep = inputCep.value.trim().replace(/\D/g, ''); // Remove caracteres não numéricos

    let uf = inputUf.value.trim();
    let city = inputCity.value.trim();
    let log = inputLog.value.trim();

    let url = '';

    if (cep !== '') {
        
        // Pega a lista de histórico ou inicia um objeto vazio
        const historicoCeps = JSON.parse(localStorage.getItem('cepsBuscados')) || {};

        // Verifica se o CEP já foi buscado anteriormente
        if (historicoCeps[cep]) {
            historicoCeps[cep] += 1;
            localStorage.setItem('cepsBuscados', JSON.stringify(historicoCeps));

            alert(`Você já buscou o CEP ${cep} ${historicoCeps[cep]} vezes. A busca foi bloqueada para evitar repetições.`);
            return;
        }

        // URL de busca por CEP único
        url = `https://viacep.com.br/ws/${cep}/json/`;
    } else {
        // URL de busca por Endereço (Retorna vários)
        url = `https://viacep.com.br/ws/${uf}/${city}/${log}/json/`;
    }

    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (dados.erro) {
            throw new Error('CEP não encontrado.');
        }

        // Cadastra o CEP no LocalStorage
        if (cep !== '') {
            const historicoCeps = JSON.parse(localStorage.getItem('cepsBuscados')) || {};
            historicoCeps[cep] = 1; // Marca que foi buscado 1 vez
            localStorage.setItem('cepsBuscados', JSON.stringify(historicoCeps));
        }

        const listaEnderecos = Array.isArray(dados) ? dados : [dados];
        const dados_info = ['cep', 'uf', 'localidade', 'bairro', 'logradouro']; 

        //#region criando a tabela
        // Limpa a tabela antes de adicionar novas linhas
        buscaCepTable.innerHTML = '';

        listaEnderecos.forEach((adress) => {
            const tr = document.createElement('tr');
            tr.classList.add("linTable");

            dados_info.forEach((info) => {
                const td = document.createElement('td');
                td.classList.add("colTable");

                td.innerHTML = adress[info] || ''; 

                tr.appendChild(td);
            });

            buscaCepTable.appendChild(tr);
        });
        //#endregion

    } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        buscaCepTable.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}