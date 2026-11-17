document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // 1. INTERATIVIDADE DA PÁGINA "COMO FUNCIONA" (FAQ ACORDEÃO)
  // =========================================================
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".faq-item").forEach((el) => {
        el.classList.remove("open");
        const icon = el.querySelector(".faq-question span");
        if (icon) icon.textContent = "+";
      });

      if (!isOpen) {
        item.classList.add("open");
        const icon = btn.querySelector("span");
        if (icon) icon.textContent = "−";
      }
    });
  });

  // =========================================================
  // 2. SISTEMA CADERNO DE CAMPO (EXECUTA APENAS EM sistema.html)
  // =========================================================
  const formObservacao = document.getElementById("form-observacao");
  const formAplicacao = document.getElementById("form-aplicacao");

  // Se não estiver na página do sistema, encerra aqui sem erros
  if (!formObservacao || !formAplicacao) {
    return;
  }

  const STORAGE_OBS = "agrocampo_observacoes_v1";
  const STORAGE_APP = "agrocampo_aplicacoes_v1";

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  const listaObservacoes = document.getElementById("lista-observacoes");
  const buscaObs = document.getElementById("busca-obs");
  const filtroStatus = document.getElementById("filtro-status");

  const listaAplicacoes = document.getElementById("lista-aplicacoes");
  const alertaEpi = document.getElementById("app-alerta-epi");

  const hojeISO = new Date().toISOString().split("T")[0];
  document.getElementById("obs-data").value = hojeISO;
  document.getElementById("app-data").value = hojeISO;

  function inicializarDadosPadrao() {
    if (!localStorage.getItem(STORAGE_OBS)) {
      const exemplosObs = [
        {
          id: 1,
          talhao: "Talhão Norte - Área 01",
          cultura: "Milho",
          data: hojeISO,
          status: "Saudável",
          notas: "Plantas com coloração verde intensa, boa uniformidade e umidade adequada no solo."
        },
        {
          id: 2,
          talhao: "Talhão Leste - Área 03",
          cultura: "Soja",
          data: hojeISO,
          status: "Atenção",
          notas: "Identificadas pequenas perfurações em folhas inferiores na bordadura. Monitorar evolução."
        }
      ];
      localStorage.setItem(STORAGE_OBS, JSON.stringify(exemplosObs));
    }

    if (!localStorage.getItem(STORAGE_APP)) {
      const exemplosApp = [
        {
          id: 101,
          talhao: "Talhão Sul - Estufa 02",
          cultura: "Tomate",
          tipo: "Controle Biológico / Manejo Integrado",
          produto: "Biofungicida Trichoderma (conforme receituário)",
          data: hojeISO,
          carencia: 7,
          notas: "Aplicação realizada no início da manhã com vento calmo e uso completo de EPIs."
        }
      ];
      localStorage.setItem(STORAGE_APP, JSON.stringify(exemplosApp));
    }
  }

  function obterObservacoes() {
    return JSON.parse(localStorage.getItem(STORAGE_OBS)) || [];
  }

  function salvarObservacoes(lista) {
    localStorage.setItem(STORAGE_OBS, JSON.stringify(lista));
  }

  function obterAplicacoes() {
    return JSON.parse(localStorage.getItem(STORAGE_APP)) || [];
  }

  function salvarAplicacoes(lista) {
    localStorage.setItem(STORAGE_APP, JSON.stringify(lista));
  }

  function escapeHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  }

  function formatarDataBR(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function calcularDataLiberacao(dataISO, diasCarencia) {
    const [ano, mes, dia] = dataISO.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setDate(data.getDate() + Number(diasCarencia));
    return data.toLocaleDateString("pt-BR");
  }

  function classeBadgeStatus(status) {
    switch (status) {
      case "Saudável":
        return "badge-saudavel";
      case "Atenção":
        return "badge-atencao";
      case "Estresse Hídrico":
        return "badge-hidrico";
      case "Crítico":
        return "badge-critico";
      default:
        return "badge-saudavel";
    }
  }

  function atualizarIndicadores() {
    const observacoes = obterObservacoes();
    const aplicacoes = obterAplicacoes();
    const alertas = observacoes.filter((item) => item.status !== "Saudável").length;

    document.getElementById("stat-obs").textContent = observacoes.length;
    document.getElementById("stat-alertas").textContent = alertas;
    document.getElementById("stat-aplicacoes").textContent = aplicacoes.length;
  }

  function renderizarObservacoes() {
    const observacoes = obterObservacoes();
    const termo = buscaObs.value.trim().toLowerCase();
    const statusSelecionado = filtroStatus.value;

    const filtradas = observacoes.filter((item) => {
      const bateTexto =
        item.talhao.toLowerCase().includes(termo) ||
        item.cultura.toLowerCase().includes(termo) ||
        item.notas.toLowerCase().includes(termo);
      const bateStatus =
        statusSelecionado === "Todos" || item.status === statusSelecionado;
      return bateTexto && bateStatus;
    });

    if (filtradas.length === 0) {
      listaObservacoes.innerHTML = `
        <div class="empty-state">
          Nenhuma observação encontrada para os filtros selecionados.
        </div>
      `;
      return;
    }

    listaObservacoes.innerHTML = filtradas
      .map(
        (item) => `
        <article class="record-item">
          <div class="record-top">
            <div>
              <div class="record-title">${escapeHTML(item.talhao)} — ${escapeHTML(item.cultura)}</div>
              <div class="record-meta">Data da inspeção: ${formatarDataBR(item.data)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge ${classeBadgeStatus(item.status)}">${escapeHTML(item.status)}</span>
              <button class="btn btn-delete" data-delete-obs="${item.id}">Excluir</button>
            </div>
          </div>
          <p class="record-notes">${escapeHTML(item.notas)}</p>
        </article>
      `
      )
      .join("");
  }

  function renderizarAplicacoes() {
    const aplicacoes = obterAplicacoes();

    if (aplicacoes.length === 0) {
      listaAplicacoes.innerHTML = `
        <div class="empty-state">
          Nenhum procedimento de aplicação registrado até o momento.
        </div>
      `;
      return;
    }

    listaAplicacoes.innerHTML = aplicacoes
      .map((item) => {
        const dataLiberacao = calcularDataLiberacao(item.data, item.carencia);
        return `
          <article class="record-item">
            <div class="record-top">
              <div>
                <div class="record-title">${escapeHTML(item.talhao)} — ${escapeHTML(item.cultura)}</div>
                <div class="record-meta">
                  Aplicado em: <strong>${formatarDataBR(item.data)}</strong> |
                  Finalidade: ${escapeHTML(item.tipo)}
                </div>
              </div>
              <button class="btn btn-delete" data-delete-app="${item.id}">Excluir</button>
            </div>
            <p class="record-notes">
              <strong>Produto:</strong> ${escapeHTML(item.produto)}<br/>
              ${item.notas ? `<strong>Observações:</strong> ${escapeHTML(item.notas)}` : ""}
            </p>
            <div>
              <span class="badge badge-saudavel">Checklist EPI &amp; Segurança Confirmado</span>
              <span class="badge badge-carencia">
                Carência: ${item.carencia} dia(s) — Liberação prevista: ${dataLiberacao}
              </span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  // Troca de Abas no Caderno de Campo
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = `tab-${btn.dataset.tab}`;
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Salvar Nova Observação
  formObservacao.addEventListener("submit", (e) => {
    e.preventDefault();

    const novaObs = {
      id: Date.now(),
      talhao: document.getElementById("obs-talhao").value.trim(),
      cultura: document.getElementById("obs-cultura").value.trim(),
      data: document.getElementById("obs-data").value,
      status: document.getElementById("obs-status").value,
      notas: document.getElementById("obs-notas").value.trim()
    };

    const lista = obterObservacoes();
    lista.unshift(novaObs);
    salvarObservacoes(lista);

    formObservacao.reset();
    document.getElementById("obs-data").value = hojeISO;

    renderizarObservacoes();
    atualizarIndicadores();
  });

  // Excluir Observação
  listaObservacoes.addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-delete-obs");
    if (!id) return;

    const atualizada = obterObservacoes().filter((item) => item.id !== Number(id));
    salvarObservacoes(atualizada);
    renderizarObservacoes();
    atualizarIndicadores();
  });

  // Filtros de Observação
  buscaObs.addEventListener("input", renderizarObservacoes);
  filtroStatus.addEventListener("change", renderizarObservacoes);

  // Salvar Procedimento de Aplicação com Validação do Checklist
  formAplicacao.addEventListener("submit", (e) => {
    e.preventDefault();

    const checks = [
      document.getElementById("chk-receituario").checked,
      document.getElementById("chk-epi").checked,
      document.getElementById("chk-clima").checked,
      document.getElementById("chk-equipamento").checked
    ];

    if (checks.includes(false)) {
      alertaEpi.classList.remove("hidden");
      return;
    }

    alertaEpi.classList.add("hidden");

    const novaApp = {
      id: Date.now(),
      talhao: document.getElementById("app-talhao").value.trim(),
      cultura: document.getElementById("app-cultura").value.trim(),
      tipo: document.getElementById("app-tipo").value,
      produto: document.getElementById("app-produto").value.trim(),
      data: document.getElementById("app-data").value,
      carencia: Number(document.getElementById("app-carencia").value),
      notas: document.getElementById("app-notas").value.trim()
    };

    const lista = obterAplicacoes();
    lista.unshift(novaApp);
    salvarAplicacoes(lista);

    formAplicacao.reset();
    document.getElementById("app-data").value = hojeISO;
    document.getElementById("app-carencia").value = 14;
    document.querySelectorAll(".checklist-box input[type='checkbox']").forEach((chk) => {
      chk.checked = false;
    });

    renderizarAplicacoes();
    atualizarIndicadores();
  });

  // Excluir Aplicação
  listaAplicacoes.addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-delete-app");
    if (!id) return;

    const atualizada = obterAplicacoes().filter((item) => item.id !== Number(id));
    salvarAplicacoes(atualizada);
    renderizarAplicacoes();
    atualizarIndicadores();
  });

  // Inicialização
  inicializarDadosPadrao();
  renderizarObservacoes();
  renderizarAplicacoes();
  atualizarIndicadores();
});