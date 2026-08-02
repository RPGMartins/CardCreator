/**
 * Script opcional: cria/atualiza as cartas padrão direto no localStorage.
 * Rode o projeto com `python -m http.server`, abra o DevTools e cole este script no console.
 */
(async function createStandardEquipmentCards() {
  const ITEM_STORAGE_KEY = "shadowdark-item-builder-tabs:v4";
  const CARD_CONFIG_KEY = "shadowdark-card-configs:v1";
  const PRINT_SELECTION_KEY = "shadowdark-card-print-selection:v1";

  const response = await fetch("data/seeds/standard-equipment.json");
  if (!response.ok) throw new Error("Não foi possível carregar data/seeds/standard-equipment.json");

  const seed = await response.json();
  const now = new Date().toISOString();

  const normalizeTag = value => String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleUpperCase("pt-BR");
  const normalizeTags = value => Array.isArray(value)
    ? [...new Set(value.map(normalizeTag).filter(Boolean))]
    : [...new Set(String(value ?? "").split(",").map(normalizeTag).filter(Boolean))];

  const local = JSON.parse(localStorage.getItem(ITEM_STORAGE_KEY) || "{}");
  const currentItems = Array.isArray(local.items) ? local.items : [];
  const map = new Map(currentItems.map(item => [item.id, item]));

  seed.items.forEach(item => {
    map.set(item.id, {
      ...item,
      tags: normalizeTags(item.tags || []),
      createdAt: map.get(item.id)?.createdAt || item.createdAt || now,
      updatedAt: now,
      notes: ""
    });
  });

  const configs = JSON.parse(localStorage.getItem(CARD_CONFIG_KEY) || "{}");
  Object.entries(seed.cardConfigs || {}).forEach(([id, cfg]) => {
    configs[id] = { ...(configs[id] || {}), ...cfg };
  });

  const ids = seed.items.map(item => item.id);
  localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify({ activeType: local.activeType || "weapons", items: [...map.values()] }));
  localStorage.setItem(CARD_CONFIG_KEY, JSON.stringify(configs));
  localStorage.setItem(PRINT_SELECTION_KEY, JSON.stringify(ids));

  console.log(`Itens básicos criados/atualizados: ${ids.length}`);
})();
