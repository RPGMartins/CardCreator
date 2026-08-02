const ITEM_STORAGE_KEY = "shadowdark-item-builder-tabs:v4";
const CARD_CONFIG_KEY = "shadowdark-card-configs:v1";
const { createCardFront, createCardBack, getType, getTypeLabel, escapeHtml } = window.ShadowdarkCardRenderer;

const state = {
  items: [],
  types: [],
  properties: {},
  selectedItem: null,
  configs: {},
  autosaveTimer: null
};

const $ = selector => document.querySelector(selector);
const els = {
  itemSelect: $("#itemSelect"),
  jsonFileInput: $("#jsonFileInput"),
  jsonInput: $("#jsonInput"),
  importJsonBtn: $("#importJsonBtn"),
  reloadLocalBtn: $("#reloadLocalBtn"),
  imageInput: $("#imageInput"),
  artFit: $("#artFit"),
  showBackName: $("#showBackName"),
  clearImageBtn: $("#clearImageBtn"),
  cardSize: $("#cardSize"),
  theme: $("#theme"),
  density: $("#density"),
  showDescriptions: $("#showDescriptions"),
  showMeta: $("#showMeta"),
  overrideName: $("#overrideName"),
  extraText: $("#extraText"),
  saveCardConfigBtn: $("#saveCardConfigBtn"),
  resetCardConfigBtn: $("#resetCardConfigBtn"),
  printBtn: $("#printBtn"),
  activeTemplate: $("#activeTemplate"),
  saveStatus: $("#saveStatus"),
  cardPreview: $("#cardPreview")
};

main();

async function main() {
  try {
    await loadConfig();
    loadCardConfigs();
    loadLocalItems();
    bindEvents();
    renderItemSelect();
    selectInitialItem();
    renderCard();
  } catch (error) {
    document.body.innerHTML = `<main class="app"><section class="panel"><h1>Não foi possível carregar os JSON.</h1><p>Rode <code>python -m http.server</code> e abra <code>http://localhost:8000/card.html</code>.</p><p>${escapeHtml(error.message)}</p></section></main>`;
  }
}

async function loadConfig() {
  const [types, properties] = await Promise.all([
    fetchJson("data/item-types.json"),
    fetchJson("data/properties.json")
  ]);

  state.types = types;
  state.properties = properties;
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Falha ao carregar ${path}`);
  return response.json();
}

function bindEvents() {
  els.itemSelect.addEventListener("change", () => {
    persistCurrentCardConfig({ silent: true });
    state.selectedItem = state.items.find(item => item.id === els.itemSelect.value) || null;
    loadFormFromSavedConfig();
    renderCard();
  });

  els.jsonFileInput.addEventListener("change", readJsonFile);
  els.importJsonBtn.addEventListener("click", importJsonFromTextarea);
  els.reloadLocalBtn.addEventListener("click", () => {
    loadLocalItems();
    renderItemSelect();
    selectInitialItem();
    renderCard();
    toast("Itens locais recarregados.");
  });

  els.imageInput.addEventListener("change", readImageFile);
  els.clearImageBtn.addEventListener("click", () => {
    setCurrentFormConfig({ ...readFormConfig(), artDataUrl: "", artAsset: "" });
    renderCard();
    persistCurrentCardConfig({ silent: true });
  });

  [
    els.artFit,
    els.showBackName,
    els.cardSize,
    els.theme,
    els.density,
    els.showDescriptions,
    els.showMeta,
    els.overrideName,
    els.extraText
  ].forEach(el => {
    el.addEventListener("input", () => {
      renderCard();
      queueAutosave();
    });
  });

  els.saveCardConfigBtn.addEventListener("click", () => persistCurrentCardConfig({ silent: false }));
  els.resetCardConfigBtn.addEventListener("click", resetCurrentCardConfig);
  els.printBtn.addEventListener("click", () => {
    persistCurrentCardConfig({ silent: true });
    window.print();
  });

  window.addEventListener("beforeunload", () => {
    persistCurrentCardConfig({ silent: true });
  });
}

function loadLocalItems() {
  try {
    const data = JSON.parse(localStorage.getItem(ITEM_STORAGE_KEY) || "{}");
    state.items = Array.isArray(data.items) ? data.items : [];
  } catch {
    state.items = [];
  }
}

function loadCardConfigs() {
  try {
    state.configs = JSON.parse(localStorage.getItem(CARD_CONFIG_KEY) || "{}");
  } catch {
    state.configs = {};
  }
}

function saveCardConfigs() {
  localStorage.setItem(CARD_CONFIG_KEY, JSON.stringify(state.configs));
}

function renderItemSelect() {
  els.itemSelect.innerHTML = "";

  if (!state.items.length) {
    els.itemSelect.innerHTML = '<option value="">Nenhum item encontrado</option>';
    return;
  }

  state.items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name || "Item sem nome"} — ${getTypeLabel(state.types, item.itemType)}`;
    els.itemSelect.appendChild(option);
  });
}

function selectInitialItem() {
  const params = new URLSearchParams(location.search);
  const requested = params.get("item");
  state.selectedItem = state.items.find(item => item.id === requested) || state.items[0] || null;
  if (state.selectedItem) els.itemSelect.value = state.selectedItem.id;
  loadFormFromSavedConfig();
}

function defaultConfig() {
  return {
    cardSize: "poker",
    theme: "parchment",
    density: "normal",
    showDescriptions: true,
    showMeta: true,
    artFit: "contain",
    showBackName: false,
    artDataUrl: "",
    artAsset: "",
    overrideName: "",
    extraText: ""
  };
}

function readFormConfig() {
  return {
    cardSize: els.cardSize.value,
    theme: els.theme.value,
    density: els.density.value,
    showDescriptions: els.showDescriptions.checked,
    showMeta: els.showMeta.checked,
    artFit: els.artFit.value,
    showBackName: els.showBackName.checked,
    artDataUrl: els.cardPreview.dataset.artDataUrl || "",
    artAsset: els.cardPreview.dataset.artAsset || "",
    overrideName: els.overrideName.value,
    extraText: els.extraText.value
  };
}

function setCurrentFormConfig(config) {
  const cfg = { ...defaultConfig(), ...config };

  els.cardSize.value = cfg.cardSize;
  els.theme.value = cfg.theme;
  els.density.value = cfg.density;
  els.showDescriptions.checked = cfg.showDescriptions;
  els.showMeta.checked = cfg.showMeta;
  els.artFit.value = cfg.artFit;
  els.showBackName.checked = cfg.showBackName;
  els.overrideName.value = cfg.overrideName || "";
  els.extraText.value = cfg.extraText || "";
  els.cardPreview.dataset.artDataUrl = cfg.artDataUrl || "";
  els.cardPreview.dataset.artAsset = cfg.artAsset || "";
}

function loadFormFromSavedConfig() {
  const cfg = state.selectedItem ? state.configs[state.selectedItem.id] : null;
  setCurrentFormConfig(cfg || defaultConfig());
  els.saveStatus.textContent = cfg ? "Salva" : "Nova";
}

function queueAutosave() {
  clearTimeout(state.autosaveTimer);
  state.autosaveTimer = setTimeout(() => {
    persistCurrentCardConfig({ silent: true });
  }, 250);
}

function persistCurrentCardConfig({ silent = true } = {}) {
  if (!state.selectedItem) return false;

  clearTimeout(state.autosaveTimer);
  state.autosaveTimer = null;

  const cfg = readFormConfig();
  state.configs[state.selectedItem.id] = {
    ...cfg,
    artDataUrl: cfg.artDataUrl || "",
    artAsset: cfg.artAsset || ""
  };

  try {
    saveCardConfigs();
    els.saveStatus.textContent = "Salva";
    if (!silent) toast("Configuração da carta salva.");
    return true;
  } catch (error) {
    els.saveStatus.textContent = "Erro ao salvar";
    toast("Não consegui salvar a carta no navegador. A imagem pode estar grande demais.");
    console.error(error);
    return false;
  }
}

function resetCurrentCardConfig() {
  if (!state.selectedItem) return;

  delete state.configs[state.selectedItem.id];
  saveCardConfigs();
  setCurrentFormConfig(defaultConfig());
  renderCard();
  els.saveStatus.textContent = "Nova";
  toast("Configuração salva removida.");
}

function readJsonFile() {
  const file = els.jsonFileInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    els.jsonInput.value = String(reader.result || "");
    toast("Arquivo JSON carregado.");
  };
  reader.onerror = () => toast("Não foi possível ler o arquivo.");
  reader.readAsText(file, "utf-8");
}

function importJsonFromTextarea() {
  try {
    const data = JSON.parse(els.jsonInput.value);
    const items = Array.isArray(data) ? data : data.items;

    if (!Array.isArray(items)) return toast("JSON inválido: não encontrei items.");

    state.items = items.map((item, index) => ({
      id: item.id || `imported-${index}-${Date.now()}`,
      ...item
    }));

    renderItemSelect();
    selectInitialItem();
    renderCard();
    toast("JSON importado para a página de cartas.");
  } catch {
    toast("Não foi possível importar o JSON.");
  }
}

async function readImageFile() {
  const file = els.imageInput.files?.[0];
  if (!file) return;

  try {
    const cfg = readFormConfig();
    cfg.artDataUrl = await fileToCompressedDataUrl(file);
    cfg.artAsset = "";
    setCurrentFormConfig(cfg);
    renderCard();
    persistCurrentCardConfig({ silent: true });
    toast("Imagem adicionada e salva na carta.");
  } catch (error) {
    console.error(error);
    toast("Não foi possível carregar a imagem.");
  }
}

function fileToCompressedDataUrl(file, maxWidth = 720, maxHeight = 1008, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Falha ao ler imagem."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Imagem inválida."));
      image.onload = () => {
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#f6efe1";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });
}

function renderCard() {
  const item = state.selectedItem;
  els.cardPreview.innerHTML = "";

  if (!item) {
    els.cardPreview.innerHTML = "<p>Nenhum item selecionado.</p>";
    return;
  }

  const type = getType(state.types, item.itemType);
  els.activeTemplate.textContent = type?.singular || "Item";

  const cfg = readFormConfig();

  const frontWrap = document.createElement("div");
  frontWrap.className = "card-side-wrap";
  frontWrap.innerHTML = '<p class="card-side-label">Frente</p>';
  frontWrap.appendChild(createCardFront(item, state.types, state.properties, cfg));

  const backWrap = document.createElement("div");
  backWrap.className = "card-side-wrap";
  backWrap.innerHTML = '<p class="card-side-label">Verso</p>';
  backWrap.appendChild(createCardBack(item, state.types, cfg));

  els.cardPreview.append(frontWrap, backWrap);
}

function toast(message) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}
