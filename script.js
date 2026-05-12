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
12-T
- FUTURO -
15-N2,SVR,HAIL1
16-N2,SVR,HAIL2
17-N1,SVR
18-N2,SVR
19-N2,SVR
`;
// =========================================================================

const hojeReal = new Date();
const anoReal = hojeReal.getFullYear();
const mesReal = hojeReal.getMonth();
const diaReal = hojeReal.getDate();

let anoAtual = anoReal;
let mesAtual = mesReal;
let meuGrafico = null; 

document.addEventListener("DOMContentLoaded", function () {
  const selectMes = document.getElementById("select-mes");
  const selectAno = document.getElementById("select-ano");

  const anoInicial = 2025;
  for (let ano = anoInicial; ano <= anoReal; ano++) {
    const opcao = document.createElement("option");
    opcao.value = ano;
    opcao.text = ano;
    if (ano === anoAtual) opcao.selected = true;
    selectAno.appendChild(opcao);
  }

  selectMes.value = mesAtual;

  selectMes.addEventListener("change", function(e) {
    mesAtual = parseInt(e.target.value);
    renderizarCalendario(anoAtual, mesAtual);
  });

  selectAno.addEventListener("change", function(e) {
    anoAtual = parseInt(e.target.value);
    renderizarCalendario(anoAtual, mesAtual);
  });

  renderizarCalendario(anoAtual, mesAtual);
});

function parsePrevisoesParaMes(ano, mes) {
  const dadosClimaticos = {};
  const numeroMesFormatado = String(mes + 1).padStart(2, '0');
  const chaveMes = `${ano}(${numeroMesFormatado}/12)`; 

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
      let valorGrafico = 1; 

      atributos.forEach(attr => {
        if (attr === "T") { severidade = "temp-verde"; valorGrafico = 1; }
        else if (attr === "N1") { severidade = "nivel-1"; valorGrafico = 2; }
        else if (attr === "N2") { severidade = "nivel-2"; valorGrafico = 3; }
        else if (attr === "N3") { severidade = "nivel-3"; valorGrafico = 4; }
        else if (attr === "N4") { severidade = "nivel-4"; valorGrafico = 5; }
        else if (attr === "SVR") temSvr = true;
        else if (attr === "HAIL1") nivelHail = "baixo";
        else if (attr === "HAIL2") nivelHail = "alto";
        else if (attr === "TOR1") nivelTor = "baixo";
        else if (attr === "TOR2") nivelTor = "alto";
      });

      dadosClimaticos[diaNum] = { severidade, temSvr, nivelHail, nivelTor, valorGrafico };
    }
  }

  return dadosClimaticos;
}

function renderizarCalendario(ano, mes) {
  const container = document.getElementById("container-dias");
  container.innerHTML = ""; 

  const previsoesDoMes = parsePrevisoesParaMes(ano, mes);
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); 
  const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate(); 

  const listaDiasRotulos = [];
  const listaValoresGrafico = [];

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const divVazia = document.createElement("div");
    divVazia.className = "dia vazio";
    container.appendChild(divVazia);
  }

  for (let dia = 1; dia <= totalDiasNoMes; dia++) {
    const divDia = document.createElement("div");
    divDia.className = "dia";
    divDia.innerText = dia;

    if (ano === anoReal && mes === mesReal && dia === diaReal) {
      divDia.classList.add("hoje");
    }

    listaDiasRotulos.push(`Dia ${dia}`);
    if (previsoesDoMes[dia]) {
      listaValoresGrafico.push(previsoesDoMes[dia].valorGrafico);
    } else {
      listaValoresGrafico.push(0); 
    }

    if (previsoesDoMes[dia]) {
      const config = previsoesDoMes[dia];
      const possuiIcones = config.temSvr || config.nivelHail || config.nivelTor;

      let classeCor = config.severidade;
      if (classeCor === "nivel-1" && possuiIcones) {
        classeCor = "nivel-1-claro";
      }

      if (classeCor) divDia.classList.add(classeCor);

      if (possuiIcones) {
        const containerIcones = document.createElement("div");
        containerIcones.className = "container-icones";

        if (config.temSvr) {
          const imgSvr = document.createElement("img");
          imgSvr.src = "https://cdn-icons-png.flaticon.com/512/564/564619.png";
          imgSvr.className = "icone-svr";
          imgSvr.alt = "SVR";
          containerIcones.appendChild(imgSvr);
        }

        if (config.nivelHail) {
          const imgHail = document.createElement("img");
          imgHail.src = "https://cdn-icons-png.flaticon.com/512/12446/12446252.png";
          imgHail.className = `icone-temp ${config.nivelHail}`;
          imgHail.alt = `HAIL ${config.nivelHail}`;
          containerIcones.appendChild(imgHail);
        }

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

  const totalCelulasAtuais = primeiroDiaSemana + totalDiasNoMes;
  const celulasFaltantes = 42 - totalCelulasAtuais;
  for (let i = 0; i < celulasFaltantes; i++) {
    const divVazia = document.createElement("div");
    divVazia.className = "dia vazio";
    container.appendChild(divVazia);
  }

  atualizarGraficoTendencia(listaDiasRotulos, listaValoresGrafico);
}

function atualizarGraficoTendencia(rotulos, valores) {
  const ctx = document.getElementById('graficoTendencia').getContext('2d');

  if (meuGrafico) {
    meuGrafico.destroy();
  }

  // PLUGIN 1: Faixas de Risco
  const pluginFundoColorido = {
    id: 'fundoColoridoPorRisco',
    beforeDraw: (chart) => {
      const { ctx, chartArea: { top, bottom, left, right }, scales: { y } } = chart;
      const coresFaixas = [
        'rgba(127, 127, 127, 0.4)',  // NONE
        'rgba(217, 235, 211, 0.45)', // TSTM
        'rgba(255, 242, 204, 0.55)', // SLGT
        'rgba(255, 153, 0, 0.35)',   // ENH
        'rgba(255, 77, 77, 0.35)',   // MDT
        'rgba(244, 176, 244, 0.45)'  // HIGH
      ];
      for (let i = 0; i <= 5; i++) {
        let yTop = y.getPixelForValue(i + 0.5);
        let yBottom = y.getPixelForValue(i - 0.5);
        if (i === 5) yTop = top;
        if (i === 0) yBottom = bottom;
        ctx.fillStyle = coresFaixas[i];
        ctx.fillRect(left, yTop, right - left, yBottom - yTop);
      }
    }
  };

  // PLUGIN 2: Linha Vertical de Hoje (Separador de Passado/Futuro)
  const pluginLinhaHoje = {
    id: 'linhaVerticalHoje',
    afterDraw: (chart) => {
      // Só desenha se estivermos visualizando o mês e ano atual real
      if (anoAtual === anoReal && mesAtual === mesReal) {
        const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
        
        // Localiza a posição X do dia de hoje no gráfico
        const xPos = x.getPixelForValue(`Dia ${diaReal}`);

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]); // Define o padrão pontilhado (5px traço, 5px espaço)
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'; // Cor da linha
        ctx.moveTo(xPos, top);
        ctx.lineTo(xPos, bottom);
        ctx.stroke();

        // Pequeno rótulo opcional "NOW" no topo da linha
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TODAY', xPos, top - 5);
        ctx.restore();
      }
    }
  };

  meuGrafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: rotulos,
      datasets: [{
        label: 'Risk Level',
        data: valores,
        borderColor: '#000000', 
        borderWidth: 4, 
        backgroundColor: 'transparent', 
        tension: 0.15, 
        pointBackgroundColor: '#000000',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      layout: {
        padding: { top: 15 } // Espaço extra para o texto "TODAY" não ser cortado
      },
      scales: {
        y: {
          min: 0,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              const siglas = ['NONE', 'TSTM', 'SLGT', 'ENH', 'MDT', 'HIGH'];
              return siglas[value];
            },
            font: { weight: 'bold', family: 'Arial', size: 11 }
          },
          grid: { color: '#000000', lineWidth: 1 }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Arial', size: 10 } }
        }
      },
      plugins: {
        legend: { display: false }
      }
    },
    plugins: [pluginFundoColorido, pluginLinhaHoje]
  });
}
