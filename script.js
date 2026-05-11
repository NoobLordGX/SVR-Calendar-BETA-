// =========================================================================
// BANCO DE DADOS DE PREVISÕES (Adicione novos meses e anos aqui quando quiser!)
// =========================================================================
const bancoDeDadosPrevisoes = `
2026(05/12)
1-N3
2-N1
3-N1
4-N1
5-N1
6-N1
7-N3
8-N1
9-N1
10-T
11-T
- FUTURO -
15-N1,SVR
16-N2,SVR,HAIL1
17-N3,SVR,HAIL2
18-N2,SVR,HAIL1
19-N2,SVR
`;
// =========================================================================

// Data real de hoje no sistema
const hojeReal = new Date();
const anoReal = hojeReal.getFullYear();
const mesReal = hojeReal.getMonth();
const diaReal = hojeReal.getDate();

// Inicializamos o calendário no ano e mês correspondentes à data atual real
let anoAtual = anoReal;
let mesAtual = mesReal;

document.addEventListener("DOMContentLoaded", function () {
  
  const selectMes = document.getElementById("select-mes");
  const selectAno = document.getElementById("select-ano");

  // 1. GERA OS ANOS DINAMICAMENTE DE 2025 ATÉ O ANO ATUAL
  const anoInicial = 2025;
  for (let ano = anoInicial; ano <= anoReal; ano++) {
    const opcao = document.createElement("option");
    opcao.value = ano;
    opcao.text = ano;
    if (ano === anoAtual) {
      opcao.selected = true;
    }
    selectAno.appendChild(opcao);
  }

  // Alinha o dropdown de mês com a data inicial real
  selectMes.value = mesAtual;

  // Escuta as alterações nos seletores de Mês e Ano
  selectMes.addEventListener("change", function(e) {
    mesAtual = parseInt(e.target.value);
    renderizarCalendario(anoAtual, mesAtual);
  });

  selectAno.addEventListener("change", function(e) {
    anoAtual = parseInt(e.target.value);
    renderizarCalendario(anoAtual, mesAtual);
  });

  // Renderizar o calendário inicial
  renderizarCalendario(anoAtual, mesAtual);
});

// Busca no banco de dados de texto as configurações de severidade de um mês/ano específico
function parsePrevisoesParaMes(ano, mes) {
  const dadosClimaticos = {};
  const numeroMesFormatado = String(mes + 1).padStart(2, '0');
  const chaveMes = `${ano}(${numeroMesFormatado}/12)`; // Ex: "2026(05/12)"

  const linhas = bancoDeDadosPrevisoes.trim().split("\n");
  let lendoMesCorreto = false;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    if (linha.includes("(") && linha.includes(")")) {
      if (linha.startsWith(chaveMes)) {
        lendoMesCorreto = true;
        continue;
      } else {
        lendoMesCorreto = false;
      }
    }

    if (lendoMesCorreto) {
      if (linha.startsWith("-")) continue;

      const partes = linha.split("-");
      if (partes.length < 2) continue;

      const diaNum = partes[0].trim();
      const atributos = partes[1].split(",").map(attr => attr.trim().toUpperCase());

      let severidade = "";
      let temSvr = false;
      let nivelHail = null;
      let nivelTor = null;

      atributos.forEach(attr => {
        if (attr === "T") severidade = "temp-verde";
        else if (attr === "N1") severidade = "nivel-1";
        else if (attr === "N2") severidade = "nivel-2";
        else if (attr === "N3") severidade = "nivel-3";
        else if (attr === "N4") severidade = "nivel-4";
        else if (attr === "SVR") temSvr = true;
        else if (attr === "HAIL1") nivelHail = "baixo";
        else if (attr === "HAIL2") nivelHail = "alto";
        else if (attr === "TOR1") nivelTor = "baixo";
        else if (attr === "TOR2") nivelTor = "alto";
      });

      dadosClimaticos[diaNum] = { severidade, temSvr, nivelHail, nivelTor };
    }
  }

  return dadosClimaticos;
}

// Renderiza os dias e estilos dinamicamente
function renderizarCalendario(ano, mes) {
  const container = document.getElementById("container-dias");
  container.innerHTML = ""; // Limpa a grade anterior

  const previsoesDoMes = parsePrevisoesParaMes(ano, mes);

  // Descobrir as variáveis de calendário do mês selecionado
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // Qual dia da semana começa o mês
  const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate(); // Quantos dias tem o mês

  // 1. Cria os espaços vazios iniciais cinzas
  for (let i = 0; i < primeiroDiaSemana; i++) {
    const divVazia = document.createElement("div");
    divVazia.className = "dia vazio";
    container.appendChild(divVazia);
  }

  // 2. Cria os dias válidos do mês
  for (let dia = 1; dia <= totalDiasNoMes; dia++) {
    const divDia = document.createElement("div");
    divDia.className = "dia";
    divDia.innerText = dia;

    const mesFormatado = String(mes + 1).padStart(2, '0');
    const diaFormatado = String(dia).padStart(2, '0');
    divDia.setAttribute("data-date", `${ano}-${mesFormatado}-${diaFormatado}`);

    // Destaca em preto o dia de hoje se o usuário estiver vendo o mês/ano atual real
    if (ano === anoReal && mes === mesReal && dia === diaReal) {
      divDia.classList.add("hoje");
    }

    // Aplica as cores de fundo e monta os ícones se existirem previsões para o dia
    if (previsoesDoMes[dia]) {
      const config = previsoesDoMes[dia];
      const possuiIcones = config.temSvr || config.nivelHail || config.nivelTor;

      let classeCor = config.severidade;
      if (classeCor === "nivel-1" && possuiIcones) {
        classeCor = "nivel-1-claro";
      }

      if (classeCor) {
        divDia.classList.add(classeCor);
      }

      if (possuiIcones) {
        const containerIcones = document.createElement("div");
        containerIcones.className = "container-icones";

        // Ícone SVR
        if (config.temSvr) {
          const imgSvr = document.createElement("img");
          imgSvr.src = "https://cdn-icons-png.flaticon.com/512/564/564619.png";
          imgSvr.className = "icone-svr";
          imgSvr.alt = "SVR";
          containerIcones.appendChild(imgSvr);
        }

        // Ícone HAIL
        if (config.nivelHail) {
          const imgHail = document.createElement("img");
          imgHail.src = "https://cdn-icons-png.flaticon.com/512/12446/12446252.png";
          imgHail.className = `icone-temp ${config.nivelHail}`;
          imgHail.alt = `HAIL ${config.nivelHail}`;
          containerIcones.appendChild(imgHail);
        }

        // Ícone TOR
        if (config.nivelTor) {
          const imgTor = document.createElement("img");
          imgTor.src = "https://cdn-icons-png.flaticon.com/512/6421/6421009.png";
          imgTor.className = `icone-temp ${config.nivelTor}`;
          imgTor.alt = `TOR ${config.nivelTor}`;
          containerIcones.appendChild(imgTor);
        }

        divDia.appendChild(containerIcones);
      }
    }

    container.appendChild(divDia);
  }

  // 3. Preenche os blocos vazios finais cinzas para manter o design consistente de 6 semanas (42 blocos)
  const totalCelulasAtuais = primeiroDiaSemana + totalDiasNoMes;
  const celulasFaltantes = 42 - totalCelulasAtuais;
  
  for (let i = 0; i < celulasFaltantes; i++) {
    const divVazia = document.createElement("div");
    divVazia.className = "dia vazio";
    container.appendChild(divVazia);
  }
}
