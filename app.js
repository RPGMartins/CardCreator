const APP_VERSION = "31";
const STORAGE_KEY = "shadowdark-item-builder-tabs:v4";
const PRINT_SELECTION_KEY = "shadowdark-card-print-selection:v1";
const WORKSPACE_TAB_KEY = "shadowdark-workspace-tab:v1";
const CARD_CONFIG_KEY = "shadowdark-card-configs:v1";
const STANDARD_EQUIPMENT_SEED = "data/seeds/standard-equipment.json";

const app = {
  types: [],
  properties: {},
  tables: [],
  activeType: null,
  items: [],
  selectedCardIds: new Set(),
  lastVisibleItemIds: [],
  activeWorkspace: "editor"
};

const els = {
  tabs: document.querySelector("#typeTabs"),
  workspaceTabs: [...document.querySelectorAll("[data-workspace-tab]")],
  workspacePanes: [...document.querySelectorAll("[data-workspace-pane]")],
  itemCount: document.querySelector("#itemCount"),
  activeTypeLabel: document.querySelector("#activeTypeLabel"),
  form: document.querySelector("#itemForm"),
  formTitle: document.querySelector("#formTitle"),
  editingId: document.querySelector("#editingId"),
  resetFormBtn: document.querySelector("#resetFormBtn"),
  saveBtn: document.querySelector("#saveBtn"),
  duplicateBtn: document.querySelector("#duplicateBtn"),

  name: document.querySelector("#name"),
  subtype: document.querySelector("#subtype"),
  cost: document.querySelector("#cost"),
  bonus: document.querySelector("#bonus"),
  weaponAttackType: document.querySelector("#weaponAttackType"),
  range: document.querySelector("#range"),
  damage: document.querySelector("#damage"),
  slots: document.querySelector("#slots"),
  armorClass: document.querySelector("#armorClass"),
  alignment: document.querySelector("#alignment"),
  sentient: document.querySelector("#sentient"),
  notes: document.querySelector("#notes"),
  tags: document.querySelector("#tags"),

  propertiesBox: document.querySelector("#propertiesBox"),
  propertyChecks: document.querySelector("#propertyChecks"),
  propertyGlossary: document.querySelector("#propertyGlossary"),

  characteristicSelect: document.querySelector("#characteristicSelect"),
  benefitSelect: document.querySelector("#benefitSelect"),
  curseSelect: document.querySelector("#curseSelect"),
  virtueSelect: document.querySelector("#virtueSelect"),
  flawSelect: document.querySelector("#flawSelect"),
  traitSelect: document.querySelector("#traitSelect"),
  spellTier: document.querySelector("#spellTier"),
  spellSelect: document.querySelector("#spellSelect"),
  spellArea: document.querySelector("#spellArea"),

  characteristicsList: document.querySelector("#characteristicsList"),
  benefitsList: document.querySelector("#benefitsList"),
  cursesList: document.querySelector("#cursesList"),
  virtuesList: document.querySelector("#virtuesList"),
  flawsList: document.querySelector("#flawsList"),
  traitsList: document.querySelector("#traitsList"),
  spellsList: document.querySelector("#spellsList"),

  rollItemBtn: document.querySelector("#rollItemBtn"),
  clearMagicAllBtn: document.querySelector("#clearMagicAllBtn"),

  itemsBody: document.querySelector("#itemsBody"),
  emptyState: document.querySelector("#emptyState"),
  search: document.querySelector("#search"),
  typeFilter: document.querySelector("#typeFilter"),
  subtypeFilter: document.querySelector("#subtypeFilter"),
  includeTagsFilter: document.querySelector("#includeTagsFilter"),
  excludeTagsFilter: document.querySelector("#excludeTagsFilter"),
  tagCombineMode: document.querySelector("#tagCombineMode"),
  filterCombineModeRadios: [...document.querySelectorAll('input[name="filterCombineMode"]')],
  propertyFilter: document.querySelector("#propertyFilter"),
  bonusFilter: document.querySelector("#bonusFilter"),
  createdFromFilter: document.querySelector("#createdFromFilter"),
  createdToFilter: document.querySelector("#createdToFilter"),
  magicTextFilter: document.querySelector("#magicTextFilter"),
  sortBy: document.querySelector("#sortBy"),
  openFiltersBtn: document.querySelector("#openFiltersBtn"),
  closeFiltersBtn: document.querySelector("#closeFiltersBtn"),
  applyFiltersBtn: document.querySelector("#applyFiltersBtn"),
  clearFiltersBtn: document.querySelector("#clearFiltersBtn"),
  clearFiltersBtnModal: document.querySelector("#clearFiltersBtnModal"),
  filterModal: document.querySelector("#filterModal"),
  filterStatus: document.querySelector("#filterStatus"),
  activeFilterChips: document.querySelector("#activeFilterChips"),
  selectVisibleCardsBtn: document.querySelector("#selectVisibleCardsBtn"),
  deselectVisibleCardsBtn: document.querySelector("#deselectVisibleCardsBtn"),
  selectActiveTypeCardsBtn: document.querySelector("#selectActiveTypeCardsBtn"),
  deselectActiveTypeCardsBtn: document.querySelector("#deselectActiveTypeCardsBtn"),
  invertVisibleCardsBtn: document.querySelector("#invertVisibleCardsBtn"),
  clearSelectedCardsBtn: document.querySelector("#clearSelectedCardsBtn"),
  bulkTypeSelect: document.querySelector("#bulkTypeSelect"),
  selectTypeCardsBtn: document.querySelector("#selectTypeCardsBtn"),
  deselectTypeCardsBtn: document.querySelector("#deselectTypeCardsBtn"),
  toggleVisibleSelection: document.querySelector("#toggleVisibleSelection"),
  openPrintSelectedBtn: document.querySelector("#openPrintSelectedBtn"),
  selectedCardsCount: document.querySelector("#selectedCardsCount"),
  openCardBuilderBtn: document.querySelector("#openCardBuilderBtn"),
  openPrintPageBtn: document.querySelector("#openPrintPageBtn"),
  createStandardCardsBtn: document.querySelector("#createStandardCardsBtn"),
  createStandardAndPrintBtn: document.querySelector("#createStandardAndPrintBtn"),

  consultTitle: document.querySelector("#consultTitle"),
  consultTables: document.querySelector("#consultTables"),

  jsonOutput: document.querySelector("#jsonOutput"),
  copyJsonBtn: document.querySelector("#copyJsonBtn"),
  downloadJsonBtn: document.querySelector("#downloadJsonBtn"),
  jsonInput: document.querySelector("#jsonInput"),
  jsonFileInput: document.querySelector("#jsonFileInput"),
  importJsonBtn: document.querySelector("#importJsonBtn"),
  clearAllBtn: document.querySelector("#clearAllBtn"),

  template: document.querySelector("#listItemTemplate"),
  itemCardTemplate: document.querySelector("#itemCardTemplate")
};

main();

async function main() {
  try {
    await loadConfig();
    loadLocalState();
    app.activeWorkspace = localStorage.getItem(WORKSPACE_TAB_KEY) || app.activeWorkspace || "editor";
    if (!app.types.some(type => type.id === app.activeType)) app.activeType = null;
    app.activeType = app.activeType || app.types[0]?.id;
    bindEvents();
    renderAll();
  } catch (error) {
    document.body.innerHTML = `
      <main class="app">
        <section class="panel">
          <h1>Não foi possível carregar os arquivos JSON.</h1>
          <p>Use um servidor local na pasta do projeto:</p>
          <pre>python -m http.server</pre>
          <p>Depois abra <code>http://localhost:8000</code>.</p>
          <p>Erro: ${escapeHtml(error.message)}</p>
        </section>
      </main>
    `;
  }
}

async function loadConfig() {
  const manifest = await fetchJson("data/manifest.json");
  app.types = await fetchJson(manifest.itemTypes);
  app.properties = await fetchJson(manifest.properties);
  const tableFiles = await Promise.all(manifest.tables.map(fetchJson));
  app.tables = tableFiles.flat();

  ensureEquipmentType();
  ensureEquipmentTable();
}

async function fetchJson(path) {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${path}${separator}v=${APP_VERSION}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Falha ao carregar ${path}`);
  return response.json();
}

function ensureEquipmentType() {
  if (app.types.some(type => type.id === "equipment")) return;

  app.types.splice(2, 0, {
    id: "equipment",
    label: "Equipamentos",
    singular: "Equipamento",
    propertyGroup: "",
    subtypeLabel: "Tipo de equipamento",
    supportsCost: true,
    supportsDamage: false,
    supportsRange: false,
    supportsBonus: false,
    supportsSpells: false,
    supportsArmorClass: false
  });
}

function ensureEquipmentTable() {
  if (app.tables.some(table => table.category === "equipment" && table.role === "subtype")) return;

  const rows = ["Arpéu", "Corda (18 m)", "Cravos de ferro (10)", "Espelho", "Estrepes (um saco)", "Flechas (20)", "Frasco ou garrafa", "Gema", "Lampião", "Mochila", "Moeda", "Óleo (frasco)", "Pé de cabra", "Pederneira", "Rações (3)", "Tocha", "Vara", "Virotes de besta (20)", "Esferas de metal", "Vela (3)", "Carvão (frasco)", "Semente relâmpago", "Pasta luminosa (frasco)", "Água benta (frasco)", "Gancho de lampião", "Massa de mineiro (frasco)", "Rede", "Corda de seda morzo", "Sebo (frasco)", "Lampião de viajante"];
  app.tables.push({
    id: "equipment_type_fallback",
    category: "equipment",
    title: "Tipo de equipamento",
    role: "subtype",
    die: "—",
    rows: rows.map(value => ({ roll: "—", value }))
  });
}

function bindEvents() {
  els.workspaceTabs.forEach(btn => {
    btn.addEventListener("click", () => switchWorkspaceTab(btn.dataset.workspaceTab));
  });

  els.form.addEventListener("submit", saveItem);
  els.resetFormBtn.addEventListener("click", resetForm);
  els.duplicateBtn.addEventListener("click", duplicateSelected);
  els.rollItemBtn.addEventListener("click", rollMagicItemReplace);
  els.clearMagicAllBtn.addEventListener("click", () => clearMagicFields(true));

  document.querySelectorAll("[data-add-list]").forEach(btn => {
    btn.addEventListener("click", () => addDynamic(btn.dataset.addList, ""));
  });

  document.querySelectorAll("[data-clear-list]").forEach(btn => {
    btn.addEventListener("click", () => {
      setDynamicList(btn.dataset.clearList, []);
      toast("Campo limpo.");
    });
  });

  document.querySelector("[data-clear-personality]").addEventListener("click", () => {
    clearPersonality();
    toast("Personalidade limpa.");
  });

  document.querySelector("[data-clear-spells]").addEventListener("click", () => {
    els.spellTier.value = "";
    setDynamicList("spells", []);
    toast("Magias limpas.");
  });

  document.querySelectorAll("[data-random]").forEach(btn => {
    btn.addEventListener("click", () => randomizeAspect(btn.dataset.random));
  });

  bindAddButton("#addCharacteristicBtn", els.characteristicSelect, "characteristics");
  bindAddButton("#addBenefitBtn", els.benefitSelect, "benefits");
  bindAddButton("#addCurseBtn", els.curseSelect, "curses");
  bindAddButton("#addVirtueBtn", els.virtueSelect, "virtues");
  bindAddButton("#addFlawBtn", els.flawSelect, "flaws");
  bindAddButton("#addTraitBtn", els.traitSelect, "traits");
  bindAddButton("#addSpellBtn", els.spellSelect, "spells");
  els.spellTier.addEventListener("change", renderSpellSelectForTier);

  [
    els.search,
    els.typeFilter,
    els.subtypeFilter,
    els.includeTagsFilter,
    els.excludeTagsFilter,
    els.tagCombineMode,
    els.propertyFilter,
    els.bonusFilter,
    els.createdFromFilter,
    els.createdToFilter,
    els.magicTextFilter,
    els.sortBy
  ].filter(Boolean).forEach(el => {
    el.addEventListener("input", renderItemTable);
    el.addEventListener("change", renderItemTable);
  });

  els.filterCombineModeRadios?.forEach(radio => {
    radio.addEventListener("change", () => {
      syncFilterCombineRadios(radio.value);
      renderItemTable();
    });
  });

  if (els.openFiltersBtn) els.openFiltersBtn.addEventListener("click", openFilterModal);
  if (els.closeFiltersBtn) els.closeFiltersBtn.addEventListener("click", closeFilterModal);
  if (els.applyFiltersBtn) els.applyFiltersBtn.addEventListener("click", closeFilterModal);
  if (els.clearFiltersBtn) els.clearFiltersBtn.addEventListener("click", clearAllFilters);
  if (els.clearFiltersBtnModal) els.clearFiltersBtnModal.addEventListener("click", clearAllFilters);
  document.querySelectorAll("[data-close-filters]").forEach(el => {
    el.addEventListener("click", closeFilterModal);
  });

if (els.selectVisibleCardsBtn) els.selectVisibleCardsBtn.addEventListener("click", selectVisibleCardsForPrint);
  if (els.deselectVisibleCardsBtn) els.deselectVisibleCardsBtn.addEventListener("click", deselectVisibleCardsForPrint);
  if (els.invertVisibleCardsBtn) els.invertVisibleCardsBtn.addEventListener("click", invertVisibleCardsForPrint);
  if (els.clearSelectedCardsBtn) els.clearSelectedCardsBtn.addEventListener("click", clearSelectedCardsForPrint);
  if (els.selectTypeCardsBtn) els.selectTypeCardsBtn.addEventListener("click", () => setTypeCardsForPrint(true));
  if (els.deselectTypeCardsBtn) els.deselectTypeCardsBtn.addEventListener("click", () => setTypeCardsForPrint(false));
  if (els.toggleVisibleSelection) els.toggleVisibleSelection.addEventListener("change", () => setVisibleCardsForPrint(els.toggleVisibleSelection.checked));
  if (els.openPrintSelectedBtn) els.openPrintSelectedBtn.addEventListener("click", openSelectedCardsPrintPage);
  if (els.openCardBuilderBtn) els.openCardBuilderBtn.addEventListener("click", () => window.location.href = "card.html");
  if (els.openPrintPageBtn) els.openPrintPageBtn.addEventListener("click", () => window.location.href = "print.html");
  if (els.createStandardCardsBtn) els.createStandardCardsBtn.addEventListener("click", () => createStandardEquipmentCards(false));
  if (els.createStandardAndPrintBtn) els.createStandardAndPrintBtn.addEventListener("click", () => createStandardEquipmentCards(true));

  els.copyJsonBtn.addEventListener("click", copyJson);
  els.downloadJsonBtn.addEventListener("click", downloadJson);
  els.importJsonBtn.addEventListener("click", importJson);
  els.jsonFileInput.addEventListener("change", loadJsonFile);
  els.clearAllBtn.addEventListener("click", clearAll);
}

function bindAddButton(selector, select, listName) {
  const btn = document.querySelector(selector);
  btn.addEventListener("click", () => {
    if (!select.value) return toast("Selecione uma opção.");
    addDynamic(listName, select.value);
  });
}

function switchWorkspaceTab(name, options = {}) {
  const target = ["editor", "items", "consult", "export"].includes(name) ? name : "editor";
  app.activeWorkspace = target;
  localStorage.setItem(WORKSPACE_TAB_KEY, target);
  renderWorkspace();

  if (!options.keepScroll) {
    document.querySelector(".workspace-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderWorkspace() {
  const active = ["editor", "items", "consult", "export"].includes(app.activeWorkspace)
    ? app.activeWorkspace
    : "editor";

  app.activeWorkspace = active;
  document.body.dataset.workspace = active;

  els.workspaceTabs.forEach(tab => {
    const isActive = tab.dataset.workspaceTab === active;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  els.workspacePanes.forEach(pane => {
    const isActive = pane.dataset.workspacePane === active;
    pane.classList.toggle("is-workspace-active", isActive);
    pane.hidden = !isActive;
    if (isActive) pane.open = true;
  });
}

function renderAll() {
  renderWorkspace();
  renderTabs();
  renderActiveTypeFields();
  renderTypeFilterOptions();
  renderBulkTypeOptions();
  renderItemTable();
  renderConsult();
  renderJson();
  els.itemCount.textContent = app.items.length;
  els.activeTypeLabel.textContent = getType(app.activeType)?.label || "—";
}

function renderTabs() {
  els.tabs.innerHTML = "";
  app.types.forEach(type => {
    const btn = document.createElement("button");
    btn.className = `tab ${type.id === app.activeType ? "active" : ""}`;
    btn.type = "button";
    btn.textContent = type.label;
    btn.addEventListener("click", () => {
      app.activeType = type.id;
      resetForm();
      saveLocalState();
      renderAll();
    });
    els.tabs.appendChild(btn);
  });
}

function renderActiveTypeFields() {
  const type = getType(app.activeType);
  els.formTitle.textContent = els.editingId.value ? `Editar ${type.singular.toLowerCase()}` : `Novo ${type.singular.toLowerCase()}`;

  const hasWeaponFields = Boolean(type.supportsDamage || type.supportsRange);
  setFieldGroup(".weapon-only", hasWeaponFields);
  setFieldGroup(".armor-only", Boolean(type.supportsArmorClass));
  setFieldGroup(".field-cost", type.supportsCost !== false);
  setFieldGroup(".field-bonus", Boolean(type.supportsBonus));
  setElementAvailability(els.spellArea, Boolean(type.supportsSpells));

  if (!hasWeaponFields) {
    els.weaponAttackType.value = "";
    els.range.value = "";
    els.damage.value = "";
  }
  if (!type.supportsArmorClass) {
    els.armorClass.value = "";
  }
  if (!type.supportsBonus) els.bonus.value = "";
  if (type.supportsCost === false) els.cost.value = "";
  if (!type.supportsSpells) {
    els.spellTier.value = "";
    setDynamicList("spells", []);
  }

  fillSelect(els.subtype, tablesForRole("subtype"), `Selecione ${type.subtypeLabel.toLowerCase()}`);
  fillSelect(els.bonus, tablesForRole("bonus"), "Sem bônus / selecione");
  fillSelect(els.characteristicSelect, tablesForRole("characteristic"), "Selecione uma característica");
  fillSelect(els.benefitSelect, tablesForRole("benefit"), "Selecione um benefício");
  fillSelect(els.curseSelect, tablesForRole("curse"), "Selecione uma maldição");
  fillSelect(els.virtueSelect, tablesForRole("virtue", true), "Selecione uma virtude");
  fillSelect(els.flawSelect, tablesForRole("flaw", true), "Selecione um defeito");
  fillSelect(els.traitSelect, tablesForRole("personality-trait", true), "Selecione um traço");
  fillSelect(els.spellTier, tablesForRole("spell-tier"), "Selecione o grau da magia");
  renderSpellSelectForTier();

  renderProperties(type);
}

function setFieldGroup(selector, enabled) {
  document.querySelectorAll(selector).forEach(el => setElementAvailability(el, enabled));
}

function setElementAvailability(el, enabled) {
  if (!el) return;
  el.hidden = !enabled;
  el.classList.toggle("is-disabled", !enabled);
  el.querySelectorAll("input, select, textarea, button").forEach(child => {
    child.disabled = !enabled;
  });
}

function renderProperties(type) {
  const group = type.propertyGroup;
  const props = group ? app.properties[group] || [] : [];
  els.propertiesBox.hidden = props.length === 0;
  els.propertyChecks.innerHTML = "";
  els.propertyGlossary.innerHTML = "";

  props.forEach(prop => {
    const label = document.createElement("label");
    label.className = "check";
    label.innerHTML = `<input type="checkbox" value="${escapeHtml(prop.code)}"><span>${escapeHtml(prop.code)} — ${escapeHtml(prop.name)}</span>`;
    els.propertyChecks.appendChild(label);

    const card = document.createElement("div");
    card.className = "glossary-card";
    card.innerHTML = `<strong>${escapeHtml(prop.code)} — ${escapeHtml(prop.name)}.</strong> ${escapeHtml(prop.description)}`;
    els.propertyGlossary.appendChild(card);
  });
}

function fillSelect(select, tables, placeholder) {
  const previous = select.value;
  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
  tables.forEach(table => {
    const group = document.createElement("optgroup");
    group.label = table.title;
    flattenRows(table).forEach(entry => {
      const opt = document.createElement("option");
      opt.value = entry.value;
      opt.textContent = `${entry.roll} — ${entry.value}`;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });
  if ([...select.options].some(opt => opt.value === previous)) {
    select.value = previous;
  }
}

function renderSpellSelectForTier() {
  if (!els.spellSelect) return;

  const tier = els.spellTier?.value || "";
  let tables = tablesForRole("spell-reference");

  if (tier) {
    tables = tables.filter(table => table.tier === tier || table.title.includes(tier));
  }

  const label = tier ? `Selecione uma magia de ${tier}` : "Selecione um grau para filtrar, ou escolha qualquer magia";
  fillSelect(els.spellSelect, tables, label);
}

function tablesForRole(role, personality = false) {
  const active = app.activeType;

  if ((active === "scrolls" || active === "wands") && (role === "benefit" || role === "curse")) {
    return app.tables.filter(t =>
      t.role === role &&
      ["armor", "weapons", "potions", "utility"].includes(t.category)
    );
  }

  return app.tables.filter(t => {
    const matchesRole = t.role === role;
    const matchesType = t.category === active || (t.alsoFor || []).includes(active);
    const matchesPersonality = personality && t.category === "personality";
    return matchesRole && (matchesType || matchesPersonality);
  });
}

function tablesForRoleFromCategory(role, category) {
  return app.tables.filter(t => t.role === role && (t.category === category || (t.alsoFor || []).includes(category)));
}

function isScrollOrWand(typeId = app.activeType) {
  return typeId === "scrolls" || typeId === "wands";
}

function rollScrollWandEffectSource() {
  const table = app.tables.find(t => t.role === "reference" && (t.category === app.activeType || (t.alsoFor || []).includes(app.activeType)));
  if (!table) return null;

  const roll = d6() + d6();
  const row = table.rows.find(r => rangeIncludes(r.roll, roll));
  const value = row?.value || "";
  const map = {
    "Armaduras": "armor",
    "Armas": "weapons",
    "Poções": "potions",
    "Utilitários": "utility"
  };

  return map[value] || null;
}

function flattenRows(table) {
  const result = [];
  (table.rows || []).forEach(row => {
    if (row.value) result.push({ roll: row.roll, value: row.value });
    if (Array.isArray(row.values)) {
      row.values.forEach(value => result.push({ roll: row.roll, value }));
    }
  });
  return result;
}

function addDynamic(listName, value = "") {
  const container = getListEl(listName);
  const node = els.template.content.cloneNode(true);
  const wrapper = node.querySelector(".dynamic-item");
  const input = node.querySelector("input");
  const btn = node.querySelector("button");
  input.value = value;
  input.placeholder = `Digite ${listName}`;
  btn.addEventListener("click", () => wrapper.remove());
  container.appendChild(node);
}

function setDynamicList(listName, values = []) {
  const container = getListEl(listName);
  if (!container) return;
  container.innerHTML = "";
  values.forEach(v => addDynamic(listName, v));
}

function readDynamicList(listName) {
  return [...getListEl(listName).querySelectorAll("input")]
    .map(input => input.value.trim())
    .filter(Boolean);
}

function getListEl(listName) {
  return {
    characteristics: els.characteristicsList,
    benefits: els.benefitsList,
    curses: els.cursesList,
    virtues: els.virtuesList,
    flaws: els.flawsList,
    traits: els.traitsList,
    spells: els.spellsList
  }[listName];
}

function saveItem(event) {
  event.preventDefault();
  const item = readForm();
  if (!item.name) return toast("Informe o nome do item.");

  const id = els.editingId.value;
  if (id) {
    app.items = app.items.map(current => current.id === id ? { ...current, ...item, updatedAt: now() } : current);
    toast("Item atualizado.");
  } else {
    app.items.push({ id: makeId(), createdAt: now(), updatedAt: now(), ...item });
    toast("Item adicionado.");
  }

  resetForm();
  saveLocalState();
  renderAll();
}

function readForm() {
  return {
    itemType: app.activeType,
    name: els.name.value.trim(),
    subtype: els.subtype.value,
    cost: els.cost.value.trim(),
    bonus: els.bonus.value,
    weapon: {
      attackType: els.weaponAttackType.value,
      range: els.range.value,
      damage: els.damage.value.trim()
    },
    slots: els.slots.value.trim() === "" ? null : els.slots.value.trim(),
    armorClass: els.armorClass.value.trim(),
    properties: [...els.propertyChecks.querySelectorAll("input:checked")].map(i => i.value),
    magic: {
      characteristics: readDynamicList("characteristics"),
      benefits: readDynamicList("benefits"),
      curses: readDynamicList("curses"),
      alignment: els.alignment.value,
      sentient: els.sentient.value === "true",
      virtues: readDynamicList("virtues"),
      flaws: readDynamicList("flaws"),
      traits: readDynamicList("traits"),
      spellTier: els.spellTier.value,
      spellReferences: readDynamicList("spells")
    },
    notes: els.notes.value.trim(),
    tags: normalizeTags(els.tags.value)
  };
}

function fillForm(item) {
  app.activeType = item.itemType;
  renderTabs();
  renderActiveTypeFields();

  els.editingId.value = item.id;
  els.formTitle.textContent = `Editar ${getType(app.activeType).singular.toLowerCase()}`;
  els.saveBtn.textContent = "Salvar alterações";

  els.name.value = item.name || "";
  els.subtype.value = item.subtype || "";
  els.cost.value = item.cost || "";
  els.bonus.value = item.bonus || "";
  els.weaponAttackType.value = item.weapon?.attackType || "";
  els.range.value = item.weapon?.range || "";
  els.damage.value = item.weapon?.damage || "";
  els.slots.value = item.slots ?? "";
  els.armorClass.value = item.armorClass || "";
  els.alignment.value = item.magic?.alignment || "";
  els.sentient.value = item.magic?.sentient ? "true" : "false";
  els.spellTier.value = item.magic?.spellTier || "";
  renderSpellSelectForTier();
  els.notes.value = item.notes || "";
  els.tags.value = normalizeTags(item.tags || []).join(", ");

  els.propertyChecks.querySelectorAll("input").forEach(input => {
    input.checked = (item.properties || []).includes(input.value);
  });

  setDynamicList("characteristics", item.magic?.characteristics || []);
  setDynamicList("benefits", item.magic?.benefits || []);
  setDynamicList("curses", item.magic?.curses || []);
  setDynamicList("virtues", item.magic?.virtues || []);
  setDynamicList("flaws", item.magic?.flaws || []);
  setDynamicList("traits", item.magic?.traits || []);
  setDynamicList("spells", item.magic?.spellReferences || []);

  renderConsult();
  switchWorkspaceTab("editor", { keepScroll: true });
  document.querySelector(".workspace-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  els.form.reset();
  els.editingId.value = "";
  els.saveBtn.textContent = "Adicionar item";
  clearMagicFields(false);
  renderActiveTypeFields();
}

function clearMagicFields(showToast = false) {
  ["characteristics","benefits","curses","virtues","flaws","traits","spells"].forEach(name => setDynamicList(name, []));
  els.alignment.value = "";
  els.sentient.value = "false";
  els.spellTier.value = "";
  if (showToast) toast("Campos mágicos limpos.");
}

function clearPersonality() {
  setDynamicList("virtues", []);
  setDynamicList("flaws", []);
  setDynamicList("traits", []);
  els.alignment.value = "";
  els.sentient.value = "false";
}

function duplicateSelected() {
  const id = els.editingId.value;
  if (!id) return toast("Selecione um item para duplicar.");

  const original = app.items.find(i => i.id === id);
  if (!original) return;

  const copy = JSON.parse(JSON.stringify(original));
  copy.id = makeId();
  copy.name = `${copy.name} cópia`;
  copy.createdAt = now();
  copy.updatedAt = now();

  app.items.push(copy);
  saveLocalState();
  renderAll();
  toast("Item duplicado.");
}

function rollMagicItemReplace() {
  const type = getType(app.activeType);

  els.subtype.value = "";
  els.bonus.value = "";
  clearMagicFields(false);

  const subtype = randomFromTables(tablesForRole("subtype"));
  const bonus = randomFromTables(tablesForRole("bonus"));
  const characteristic = randomFromTables(tablesForRole("characteristic"));

  if (subtype) els.subtype.value = subtype;
  if (bonus) els.bonus.value = bonus;
  if (characteristic) addDynamic("characteristics", characteristic);

  const counts = rollCounts("feature-counts");
  let effectCategory = null;

  if (isScrollOrWand() && (counts.benefits || counts.curses)) {
    effectCategory = rollScrollWandEffectSource();
    const label = getType(effectCategory)?.label;
    if (label) addDynamic("characteristics", `Benefícios/maldições rolados nas tabelas de ${label}`);
  }

  for (let i = 0; i < counts.benefits; i++) addRandomBenefit(effectCategory);
  for (let i = 0; i < counts.curses; i++) addRandomCurse(effectCategory);

  rollPersonalityByCount();

  if (type.supportsSpells) {
    const tier = randomFromTables(tablesForRole("spell-tier"));
    const spell = randomFromTables(tablesForRole("spell-reference"));
    if (tier) els.spellTier.value = tier;
    renderSpellSelectForTier();
    const tieredSpell = randomFromTables(tablesForRole("spell-reference").filter(t => !tier || t.tier === tier));
    if (tieredSpell) addDynamic("spells", tieredSpell);
  }

  if (!els.name.value.trim()) {
    const bits = [subtype, characteristic].filter(Boolean);
    els.name.value = bits.length ? bits.join(" — ") : `${type.singular} mágico`;
  }

  toast("Item mágico completo rolado e substituído.");
}

function randomizeAspect(aspect) {
  if (aspect === "characteristics") {
    const value = randomFromTables(tablesForRole("characteristic"));
    if (value) addDynamic("characteristics", value);
    return;
  }

  if (aspect === "benefits") {
    addRandomBenefit(isScrollOrWand() ? rollScrollWandEffectSource() : null, true);
    return;
  }

  if (aspect === "curses") {
    addRandomCurse(isScrollOrWand() ? rollScrollWandEffectSource() : null, true);
    return;
  }

  if (aspect === "personality") {
    rollPersonalityByCount(true);
    return;
  }

  if (aspect === "virtues") {
    const value = randomFromTables(tablesForRole("virtue", true));
    if (value) addDynamic("virtues", value);
    els.sentient.value = "true";
    return;
  }

  if (aspect === "flaws") {
    const value = randomFromTables(tablesForRole("flaw", true));
    if (value) addDynamic("flaws", value);
    els.sentient.value = "true";
    return;
  }

  if (aspect === "traits") {
    const value = randomFromTables(tablesForRole("personality-trait", true));
    if (value) addDynamic("traits", value);
    els.sentient.value = "true";
    return;
  }

  if (aspect === "spells") {
    const tier = els.spellTier.value || randomFromTables(tablesForRole("spell-tier"));
    if (!els.spellTier.value && tier) els.spellTier.value = tier;
    renderSpellSelectForTier();
    const spell = randomFromTables(tablesForRole("spell-reference").filter(t => !els.spellTier.value || t.tier === els.spellTier.value));
    if (spell) addDynamic("spells", spell);
    return;
  }
}

function addRandomBenefit(effectCategory = null, showSource = false) {
  const source = effectCategory || null;
  const tables = source ? tablesForRoleFromCategory("benefit", source) : tablesForRole("benefit");
  const value = randomFromTables(tables);
  if (!value) return;
  const label = source ? getType(source)?.label : "";
  addDynamic("benefits", showSource && label ? `[${label}] ${value}` : value);
}

function addRandomCurse(effectCategory = null, showSource = false) {
  const source = effectCategory || null;
  const tables = source ? tablesForRoleFromCategory("curse", source) : tablesForRole("curse");
  const value = randomFromTables(tables);
  if (!value) return;
  const label = source ? getType(source)?.label : "";
  addDynamic("curses", showSource && label ? `[${label}] ${value}` : value);
}

function rollPersonalityByCount(showToast = false) {
  const pCounts = rollCounts("personality-counts");
  let added = 0;

  for (let i = 0; i < pCounts.virtues; i++) {
    const value = randomFromTables(tablesForRole("virtue", true));
    if (value) { addDynamic("virtues", value); added++; }
  }
  for (let i = 0; i < pCounts.flaws; i++) {
    const value = randomFromTables(tablesForRole("flaw", true));
    if (value) { addDynamic("flaws", value); added++; }
  }

  if (added) {
    els.sentient.value = "true";
    const trait = randomFromTables(tablesForRole("personality-trait", true));
    if (trait) addDynamic("traits", trait);
  } else if (showToast) {
    toast("A rolagem indicou que o item não ganhou virtude nem defeito.");
  }
}

function rollCounts(role) {
  const table = app.tables.find(t => t.role === role);
  if (!table) return {};
  const roll = d6() + d6();
  const row = table.rows.find(r => rangeIncludes(r.roll, roll)) || {};
  return {
    benefits: row.benefits || 0,
    curses: row.curses || 0,
    virtues: row.virtues || 0,
    flaws: row.flaws || 0
  };
}

function randomFromTables(tables) {
  const all = tables.flatMap(flattenRows);
  if (!all.length) return "";
  return all[Math.floor(Math.random() * all.length)].value;
}

function d6() { return Math.floor(Math.random() * 6) + 1; }

function rangeIncludes(text, value) {
  const cleaned = String(text).replace("–", "-");
  if (cleaned.includes("-")) {
    const [a,b] = cleaned.split("-").map(Number);
    return value >= a && value <= b;
  }
  return Number(cleaned) === value;
}

function renderItemTable() {
  const filters = readAdvancedFilters();

  let rows = app.items.filter(item => itemMatchesFilters(item, filters));

  rows.sort((a,b) => {
    if (filters.sortBy === "createdAt") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (filters.sortBy === "updatedAt") return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    return String(a[filters.sortBy] || "").localeCompare(String(b[filters.sortBy] || ""), "pt-BR");
  });

  app.lastVisibleItemIds = rows.map(item => item.id);
  els.itemsBody.innerHTML = "";
  els.emptyState.hidden = rows.length > 0;

  rows.forEach(item => {
    const typeLabel = getType(item.itemType)?.label || item.itemType || "Item";
    const subtype = item.subtype || "—";
    const isSelected = app.selectedCardIds.has(item.id);

    const benefits = (item.magic?.benefits || []).length;
    const curses = (item.magic?.curses || []).length;
    const magicCount = [
      ...(item.magic?.characteristics || []),
      ...(item.magic?.benefits || []),
      ...(item.magic?.curses || []),
      ...(item.magic?.spellReferences || []),
      ...(item.magic?.virtues || []),
      ...(item.magic?.flaws || []),
      ...(item.magic?.traits || [])
    ].length + (item.notes ? 1 : 0);

    const facts = compactFactsForItem(item);
    const row = document.createElement("tr");
    row.className = `item-table-row ${isSelected ? "is-selected" : ""}`;
    row.dataset.id = item.id;

    row.innerHTML = `
      <td class="select-col">
        <input class="row-select-checkbox" type="checkbox" data-action="toggle-print" data-id="${escapeHtml(item.id)}" ${isSelected ? "checked" : ""} aria-label="Selecionar ${escapeHtml(item.name || "item")}" />
      </td>
      <td class="item-name-cell">
        <button class="table-name-button" type="button" data-action="edit" data-id="${escapeHtml(item.id)}">${escapeHtml(item.name || "Item sem nome")}</button>
        <small>${escapeHtml(subtype)}</small>
      </td>
      <td class="item-type-cell">${escapeHtml(typeLabel)}</td>
      <td class="item-facts-cell">${facts.length ? facts.map(f => `<span>${f}</span>`).join("") : "<span>—</span>"}</td>
      <td class="item-tags-cell">${renderPills(normalizeTags(item.tags || [])) || "<span class='muted-dash'>—</span>"}</td>
      <td class="item-content-cell" title="Benefícios / Maldições / Campos com texto">
        <span>B:${benefits}</span><span>M:${curses}</span><span>T:${magicCount}</span>
      </td>
      <td class="item-actions-cell">
        <div class="row-actions compact-row-actions">
          <button class="small" type="button" data-action="edit" data-id="${escapeHtml(item.id)}">Carta</button>
          <button class="secondary small" type="button" data-action="item-edit" data-id="${escapeHtml(item.id)}">Item</button>
          <button class="danger small" type="button" data-action="delete" data-id="${escapeHtml(item.id)}">Excluir</button>
        </div>
      </td>
    `;

    els.itemsBody.appendChild(row);
  });

  els.itemsBody.querySelectorAll("[data-action]").forEach(control => {
    control.addEventListener("click", event => {
      const item = app.items.find(i => i.id === control.dataset.id);
      if (!item) return;

      if (control.dataset.action === "toggle-print") {
        event.stopPropagation();
        toggleCardSelection(item.id);
      }

      if (control.dataset.action === "edit" || control.dataset.action === "card") {
        window.location.href = `card.html?item=${encodeURIComponent(item.id)}`;
      }

      if (control.dataset.action === "item-edit") {
        fillForm(item);
        switchWorkspaceTab("editor", { keepScroll: true });
      }

      if (control.dataset.action === "delete") {
        deleteItem(item);
      }
    });
  });

  els.itemCount.textContent = app.items.length;
  updateAdvancedFilterStatus(rows.length, filters);
  updateSelectedCardsCount();
  updateVisibleSelectionToggle();
}

function compactFactsForItem(item) {
  const facts = [];

  if (item.weapon?.damage) facts.push(`D ${escapeHtml(item.weapon.damage)}`);
  if (item.armorClass) facts.push(`CA ${escapeHtml(item.armorClass)}`);
  if (item.bonus) facts.push(escapeHtml(item.bonus));
  if (item.cost) facts.push(escapeHtml(item.cost));
  if (item.slots !== null && item.slots !== undefined && item.slots !== "") {
    facts.push(`${item.itemType === "equipment" ? "Q" : "E"} ${escapeHtml(item.slots)}`);
  }
  if (item.weapon?.range) facts.push(`Alc ${escapeHtml(item.weapon.range)}`);
  if (item.weapon?.attackType) facts.push(`T ${escapeHtml(item.weapon.attackType)}`);
  if ((item.properties || []).length) facts.push(escapeHtml((item.properties || []).join(", ")));
  if (item.magic?.spellTier) facts.push(escapeHtml(item.magic.spellTier));

  return facts;
}


function renderTypeFilterOptions() {
  if (!els.typeFilter) return;

  const current = els.typeFilter.value;
  els.typeFilter.innerHTML = `<option value="">Todos os tipos</option>`;

  app.types.forEach(type => {
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = type.label;
    els.typeFilter.appendChild(option);
  });

  if ([...els.typeFilter.options].some(option => option.value === current)) {
    els.typeFilter.value = current;
  }
}

function renderBulkTypeOptions() {
  if (!els.bulkTypeSelect) return;

  const current = els.bulkTypeSelect.value;
  els.bulkTypeSelect.innerHTML = `<option value="">Tipo de item...</option>`;

  app.types.forEach(type => {
    const count = app.items.filter(item => item.itemType === type.id).length;
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = `${type.label} (${count})`;
    els.bulkTypeSelect.appendChild(option);
  });

  if ([...els.bulkTypeSelect.options].some(option => option.value === current)) {
    els.bulkTypeSelect.value = current;
  }
}

function readAdvancedFilters() {
  const mode = currentFilterCombineMode();

  return {
    name: normalizeSearchText(els.search?.value || ""),
    combineMode: mode,
    itemType: els.typeFilter?.value || "",
    subtype: normalizeSearchText(els.subtypeFilter?.value || ""),
    includeTags: parseTagFilter(els.includeTagsFilter?.value || ""),
    includeTagsMode: els.tagCombineMode?.value || "ALL",
    excludeTags: parseTagFilter(els.excludeTagsFilter?.value || ""),
    properties: parseTagFilter(els.propertyFilter?.value || ""),
    bonus: els.bonusFilter?.value || "",
    createdFrom: els.createdFromFilter?.value || "",
    createdTo: els.createdToFilter?.value || "",
    magicText: normalizeSearchText(els.magicTextFilter?.value || ""),
    sortBy: els.sortBy?.value || "createdAt"
  };
}

function currentFilterCombineMode() {
  const checked = document.querySelector('input[name="filterCombineMode"]:checked');
  return checked?.value === "OR" ? "OR" : "AND";
}

function syncFilterCombineRadios(value) {
  const normalized = value === "OR" ? "OR" : "AND";
  els.filterCombineModeRadios?.forEach(radio => {
    radio.checked = radio.value === normalized;
  });
}


function itemMatchesFilters(item, filters) {
  const checks = [];
  const itemTags = normalizeTags(item.tags || []);
  const itemProps = normalizeTags(item.properties || []);

  // Excluir TAGS é sempre uma regra negativa: se bater, some da lista.
  if (filters.excludeTags.some(tag => itemTags.includes(tag))) return false;

  if (filters.name) checks.push(normalizeSearchText(item.name).includes(filters.name));
  if (filters.itemType) checks.push(item.itemType === filters.itemType);
  if (filters.subtype) checks.push(normalizeSearchText(item.subtype).includes(filters.subtype));

  if (filters.includeTags.length) {
    const tagMatch = filters.includeTagsMode === "ANY"
      ? filters.includeTags.some(tag => itemTags.includes(tag))
      : filters.includeTags.every(tag => itemTags.includes(tag));
    checks.push(tagMatch);
  }

  if (filters.properties.length) {
    const propMatch = filters.combineMode === "OR"
      ? filters.properties.some(prop => itemProps.includes(prop))
      : filters.properties.every(prop => itemProps.includes(prop));
    checks.push(propMatch);
  }

  if (filters.bonus) {
    checks.push(filters.bonus === "SEM_BONUS" ? !item.bonus : item.bonus === filters.bonus);
  }

  if (filters.createdFrom || filters.createdTo) {
    const date = getDateOnly(item.createdAt);
    checks.push(Boolean(date) &&
      (!filters.createdFrom || date >= filters.createdFrom) &&
      (!filters.createdTo || date <= filters.createdTo)
    );
  }

  if (filters.magicText) checks.push(magicSearchBlob(item).includes(filters.magicText));

  if (!checks.length) return true;
  return filters.combineMode === "OR" ? checks.some(Boolean) : checks.every(Boolean);
}


function itemSearchBlob(item) {
  return normalizeSearchText([
    item.name,
    item.subtype,
    item.itemType,
    getType(item.itemType)?.label,
    item.cost,
    item.bonus,
    item.armorClass,
    item.slots,
    item.weapon?.damage,
    item.weapon?.range,
    item.weapon?.attackType,
    ...(item.tags || []),
    ...(item.properties || []),
    item.notes,
    magicSearchBlob(item)
  ].join(" "));
}

function magicSearchBlob(item) {
  const magic = item.magic || {};
  return normalizeSearchText([
    ...(magic.characteristics || []),
    ...(magic.benefits || []),
    ...(magic.curses || []),
    magic.alignment,
    magic.sentient ? "CONSCIENTE" : "",
    ...(magic.virtues || []),
    ...(magic.flaws || []),
    ...(magic.traits || []),
    magic.spellTier,
    ...(magic.spellReferences || [])
  ].join(" "));
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("pt-BR")
    .trim();
}

function getDateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function clearAllFilters() {
  [
    els.search,
    els.subtypeFilter,
    els.includeTagsFilter,
    els.excludeTagsFilter,
    els.tagCombineMode,
    els.propertyFilter,
    els.createdFromFilter,
    els.createdToFilter,
    els.magicTextFilter
  ].filter(Boolean).forEach(el => el.value = "");

  if (els.typeFilter) els.typeFilter.value = "";
  if (els.bonusFilter) els.bonusFilter.value = "";
  if (els.tagCombineMode) els.tagCombineMode.value = "ALL";
  syncFilterCombineRadios("AND");
  renderItemTable();
}

function openFilterModal() {
  if (!els.filterModal) return;
  els.filterModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeFilterModal() {
  if (!els.filterModal) return;
  els.filterModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function updateAdvancedFilterStatus(visibleCount, filters) {
  const chips = [];

  const activeFilterCount = countActiveFilters(filters);
  if (activeFilterCount > 1) chips.push(["Modo", filters.combineMode]);
  if (filters.name) chips.push(["Nome", filters.name]);
  if (filters.itemType) chips.push(["Tipo", getType(filters.itemType)?.label || filters.itemType]);
  if (filters.subtype) chips.push(["Subtipo", filters.subtype]);
  if (filters.includeTags.length) {
    chips.push([filters.includeTagsMode === "ANY" ? "TAGS (OR)" : "TAGS (AND)", filters.includeTags.join(", ")]);
  }
  if (filters.excludeTags.length) chips.push(["Excluir", filters.excludeTags.join(", ")]);
  if (filters.properties.length) chips.push(["Props", filters.properties.join(", ")]);
  if (filters.bonus) chips.push(["Bônus", filters.bonus === "SEM_BONUS" ? "Sem bônus" : filters.bonus]);
  if (filters.createdFrom) chips.push(["De", filters.createdFrom]);
  if (filters.createdTo) chips.push(["Até", filters.createdTo]);
  if (filters.magicText) chips.push(["Texto", filters.magicText]);

  if (!els.filterStatus || !els.activeFilterChips) return;

  if (!chips.length) {
    els.filterStatus.textContent = "Sem filtro ativo";
    els.activeFilterChips.innerHTML = "";
    return;
  }

  els.filterStatus.textContent = `${visibleCount} item(ns) visível(is) • ${activeFilterCount} filtro(s) • ${filters.combineMode}`;
  els.activeFilterChips.innerHTML = chips
    .map(([label, value]) => `<span class="filter-chip"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</span>`)
    .join("");
}

function countActiveFilters(filters) {
  return [
    filters.name,
    filters.itemType,
    filters.subtype,
    filters.includeTags.length,
    filters.properties.length,
    filters.bonus,
    filters.createdFrom || filters.createdTo,
    filters.magicText
  ].filter(Boolean).length;
}


function toggleCardSelection(id) {
  if (app.selectedCardIds.has(id)) {
    app.selectedCardIds.delete(id);
  } else {
    app.selectedCardIds.add(id);
  }

  persistPrintSelection();
  renderItemTable();
}

function setCardSelectionForIds(ids, selected) {
  ids.filter(Boolean).forEach(id => {
    if (selected) app.selectedCardIds.add(id);
    else app.selectedCardIds.delete(id);
  });

  persistPrintSelection();
  renderItemTable();
}

function setVisibleCardsForPrint(selected) {
  const ids = app.lastVisibleItemIds || [];
  if (!ids.length) return toast("Nenhum item visível para selecionar.");

  setCardSelectionForIds(ids, selected);
  toast(`${ids.length} item(ns) visível(is) ${selected ? "selecionado(s)" : "desselecionado(s)"}.`);
}

function selectVisibleCardsForPrint() {
  setVisibleCardsForPrint(true);
}

function deselectVisibleCardsForPrint() {
  setVisibleCardsForPrint(false);
}

function invertVisibleCardsForPrint() {
  const ids = app.lastVisibleItemIds || [];
  if (!ids.length) return toast("Nenhum item visível para inverter.");

  ids.forEach(id => {
    if (app.selectedCardIds.has(id)) app.selectedCardIds.delete(id);
    else app.selectedCardIds.add(id);
  });

  persistPrintSelection();
  renderItemTable();
  toast(`${ids.length} item(ns) visível(is) invertido(s).`);
}

function setActiveTypeCardsForPrint(selected) {
  const typeId = app.activeType;
  if (!typeId) return toast("Nenhuma aba ativa.");

  const ids = app.items
    .filter(item => item.itemType === typeId)
    .map(item => item.id);

  if (!ids.length) return toast("Não há itens na aba atual.");

  setCardSelectionForIds(ids, selected);
  const label = getType(typeId)?.label || "aba atual";
  toast(`${ids.length} item(ns) de ${label} ${selected ? "selecionado(s)" : "desselecionado(s)"}.`);
}

function setTypeCardsForPrint(selected) {
  const typeId = els.bulkTypeSelect?.value || "";
  if (!typeId) return toast("Escolha um tipo de item.");

  const ids = app.items
    .filter(item => item.itemType === typeId)
    .map(item => item.id);

  if (!ids.length) return toast("Não há itens desse tipo.");

  setCardSelectionForIds(ids, selected);
  const label = getType(typeId)?.label || "tipo";
  toast(`${ids.length} item(ns) de ${label} ${selected ? "selecionado(s)" : "desselecionado(s)"}.`);
}

function clearSelectedCardsForPrint() {
  app.selectedCardIds.clear();
  localStorage.removeItem(PRINT_SELECTION_KEY);
  renderItemTable();
  toast("Todos os itens foram marcados como Desselecionado.");
}

function openSelectedCardsPrintPage() {
  const ids = [...app.selectedCardIds];

  if (!ids.length) {
    toast("Selecione pelo menos um item para montar a página de impressão.");
    return;
  }

  persistPrintSelection();
  window.location.href = `print.html?ids=${ids.map(encodeURIComponent).join(",")}`;
}

function persistPrintSelection() {
  const ids = [...app.selectedCardIds];
  if (!ids.length) {
    localStorage.removeItem(PRINT_SELECTION_KEY);
    return;
  }
  localStorage.setItem(PRINT_SELECTION_KEY, JSON.stringify(ids));
}

function updateSelectedCardsCount() {
  const count = app.selectedCardIds.size;
  if (!els.selectedCardsCount) return;

  const visibleSelected = (app.lastVisibleItemIds || []).filter(id => app.selectedCardIds.has(id)).length;
  const visibleTotal = (app.lastVisibleItemIds || []).length;

  els.selectedCardsCount.textContent = `${count} selecionado${count === 1 ? "" : "s"} • ${visibleSelected}/${visibleTotal} visíveis`;

  if (els.openPrintSelectedBtn) {
    els.openPrintSelectedBtn.disabled = count === 0;
  }
}

function updateVisibleSelectionToggle() {
  if (!els.toggleVisibleSelection) return;

  const visible = app.lastVisibleItemIds || [];
  const selected = visible.filter(id => app.selectedCardIds.has(id)).length;

  els.toggleVisibleSelection.checked = visible.length > 0 && selected === visible.length;
  els.toggleVisibleSelection.indeterminate = selected > 0 && selected < visible.length;
  els.toggleVisibleSelection.disabled = visible.length === 0;
}


function deleteItem(item) {
  if (!confirm(`Excluir "${item.name}"?`)) return;
  app.items = app.items.filter(i => i.id !== item.id);
  app.selectedCardIds.delete(item.id);
  persistPrintSelection();
  saveLocalState();
  renderAll();
  toast("Item excluído.");
}

function renderConsult() {
  const type = getType(app.activeType);
  els.consultTitle.textContent = `Tabelas — ${type.label}`;

  let tables = app.tables.filter(t =>
    t.category === app.activeType ||
    (t.alsoFor || []).includes(app.activeType) ||
    t.category === "all" ||
    t.category === "personality"
  );

  if (isScrollOrWand()) {
    const referenced = app.tables.filter(t =>
      ["benefit", "curse"].includes(t.role) &&
      ["armor", "weapons", "potions", "utility"].includes(t.category)
    );
    tables = [...tables, ...referenced];
  }

  const seen = new Set();
  tables = tables.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  els.consultTables.innerHTML = "";
  tables.forEach(table => {
    const details = document.createElement("details");
    details.className = "table-card";
    details.open = ["subtype","characteristic","bonus","benefit","curse","reference","spell-tier"].includes(table.role);
    details.innerHTML = `
      <summary>${escapeHtml(table.title)} <small>(${escapeHtml(table.die || "—")})</small></summary>
      <div class="mini-table">${renderMiniRows(table)}</div>
    `;
    els.consultTables.appendChild(details);
  });
}

function renderMiniRows(table) {
  return (table.rows || []).map(row => {
    if (Array.isArray(row.values)) {
      const cols = row.values.length;
      return `<div class="mini-row multi" style="--cols:${cols}">
        <strong>${escapeHtml(row.roll)}</strong>
        ${row.values.map(v => `<span>${escapeHtml(v)}</span>`).join("")}
      </div>`;
    }
    return `<div class="mini-row"><strong>${escapeHtml(row.roll)}</strong><span>${escapeHtml(row.value || "")}</span></div>`;
  }).join("");
}

function renderJson() {
  els.jsonOutput.value = JSON.stringify({
    schema: "shadowdark-item-builder",
    version: 4,
    exportedAt: now(),
    items: app.items
  }, null, 2);
}


async function createStandardEquipmentCards(selectForPrint = false) {
  try {
    const seed = await fetchJson(STANDARD_EQUIPMENT_SEED);
    const seedItems = Array.isArray(seed.items) ? seed.items : [];
    if (!seedItems.length) return toast("Arquivo de itens básicos sem itens.");

    const seedIds = new Set(seedItems.map(item => item.id));
    const existingCount = app.items.filter(item => seedIds.has(item.id)).length;

    if (existingCount > 0) {
      const ok = confirm(`${existingCount} item(ns) básico(s) já existem. Atualizar esses itens e manter os outros?`);
      if (!ok) return;
    }

    const byId = new Map(app.items.map(item => [item.id, item]));
    const stamp = now();

    seedItems.forEach(seedItem => {
      const previous = byId.get(seedItem.id);
      byId.set(seedItem.id, normalizeImportedItem({
        ...seedItem,
        createdAt: previous?.createdAt || seedItem.createdAt || stamp,
        updatedAt: stamp
      }));
    });

    app.items = [...byId.values()];

    const configs = loadCardConfigMap();
    Object.entries(seed.cardConfigs || {}).forEach(([id, cfg]) => {
      configs[id] = {
        ...(configs[id] || {}),
        ...cfg
      };
    });
    saveCardConfigMap(configs);

    if (selectForPrint) {
      app.selectedCardIds = new Set(seedItems.map(item => item.id));
      localStorage.setItem(PRINT_SELECTION_KEY, JSON.stringify([...app.selectedCardIds]));
    }

    saveLocalState();
    renderAll();

    if (selectForPrint) {
      toast(`${seedItems.length} itens básicos criados e selecionados para impressão. A aba Equipamentos deve aparecer no topo.`);
    } else {
      toast(`${seedItems.length} itens básicos criados/atualizados. A aba Equipamentos deve aparecer no topo.`);
    }
  } catch (error) {
    toast(`Não foi possível criar os itens básicos: ${error.message}`);
  }
}

function loadCardConfigMap() {
  try {
    return JSON.parse(localStorage.getItem(CARD_CONFIG_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCardConfigMap(configs) {
  localStorage.setItem(CARD_CONFIG_KEY, JSON.stringify(configs || {}));
}

function importJson() {
  try {
    const data = JSON.parse(els.jsonInput.value);
    const items = Array.isArray(data) ? data : data.items;
    if (!Array.isArray(items)) return toast("JSON inválido.");
    app.items = items.map(i => normalizeImportedItem({ id: i.id || makeId(), createdAt: i.createdAt || now(), updatedAt: now(), ...i }));
    app.selectedCardIds.clear();
    localStorage.removeItem(PRINT_SELECTION_KEY);
    saveLocalState();
    resetForm();
    renderAll();
    toast("JSON importado.");
  } catch {
    toast("Não foi possível importar.");
  }
}

function loadJsonFile() {
  const file = els.jsonFileInput.files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".json")) {
    toast("Selecione um arquivo .json.");
    els.jsonFileInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    els.jsonInput.value = String(reader.result || "");
    toast("Arquivo JSON carregado no campo de importação.");
  };
  reader.onerror = () => toast("Não foi possível ler o arquivo.");
  reader.readAsText(file, "utf-8");
}

function clearAll() {
  if (!confirm("Apagar todos os itens?")) return;
  app.items = [];
  app.selectedCardIds.clear();
  localStorage.removeItem(PRINT_SELECTION_KEY);
  saveLocalState();
  resetForm();
  renderAll();
}

async function copyJson() {
  await navigator.clipboard.writeText(els.jsonOutput.value);
  toast("JSON copiado.");
}

function downloadJson() {
  const blob = new Blob([els.jsonOutput.value], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shadowdark-itens-magicos.json";
  a.click();
  URL.revokeObjectURL(url);
}

function saveLocalState() {
  app.items = app.items.map(normalizeImportedItem);
  app.items = app.items.map(normalizeImportedItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeType: app.activeType, items: app.items }));
  renderJson();
}

function loadLocalState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    app.activeType = data.activeType;
    app.items = (data.items || []).map(normalizeImportedItem);
  } catch {}
}

function getType(id) {
  return app.types.find(t => t.id === id);
}

function normalizeTag(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("pt-BR");
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(normalizeTag).filter(Boolean))];
  }

  return [...new Set(String(value ?? "")
    .split(",")
    .map(normalizeTag)
    .filter(Boolean))];
}

function parseTagFilter(value) {
  return normalizeTags(value);
}

function normalizeImportedItem(item) {
  return {
    ...item,
    tags: normalizeTags(item.tags || [])
  };
}



function renderPills(values = []) {
  if (!values.length) return "";
  return `<div class="pills">${values.map(v => `<span class="pill">${escapeHtml(v)}</span>`).join("")}</div>`;
}

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function now() { return new Date().toISOString(); }
function toast(message) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
