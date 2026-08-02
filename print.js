const ITEM_STORAGE_KEY = "shadowdark-item-builder-tabs:v4";
const CARD_CONFIG_KEY = "shadowdark-card-configs:v1";
const PRINT_SELECTION_KEY = "shadowdark-card-print-selection:v1";
const { createCardFront, createCardBack, escapeHtml } = window.ShadowdarkCardRenderer;
const state = { items: [], types: [], properties: {}, configs: {} };
const $ = s => document.querySelector(s);
const els = { printRoot: $("#printRoot"), printBtn: $("#printBtn"), printSize: $("#printSize"), printGap: $("#printGap"), theme: $("#theme"), printMode: $("#printMode"), mirrorBacks: $("#mirrorBacks"), showCutLines: $("#showCutLines"), autoFontFit: $("#autoFontFit") };
main();
async function main(){ try{ await loadConfig(); loadItems(); loadConfigs(); bindEvents(); renderPrintPages(); }catch(e){ document.body.innerHTML=`<main class="app"><section class="panel"><h1>Erro ao carregar impressão</h1><p>${escapeHtml(e.message)}</p></section></main>`; } }
async function loadConfig(){ const [types,properties]=await Promise.all([fetchJson("data/item-types.json"),fetchJson("data/properties.json")]); state.types=types; state.properties=properties; }
async function fetchJson(path){ const r=await fetch(path); if(!r.ok) throw new Error(`Falha ao carregar ${path}`); return r.json(); }
function loadItems(){ try{ const data=JSON.parse(localStorage.getItem(ITEM_STORAGE_KEY)||"{}"); state.items=Array.isArray(data.items)?data.items:[]; }catch{ state.items=[]; } }
function loadConfigs(){ try{ state.configs=JSON.parse(localStorage.getItem(CARD_CONFIG_KEY)||"{}"); }catch{ state.configs={}; } }
function bindEvents(){ [els.printSize,els.printGap,els.theme,els.printMode,els.mirrorBacks,els.showCutLines,els.autoFontFit].filter(Boolean).forEach(el=>el.addEventListener("input",renderPrintPages)); els.printBtn.addEventListener("click",()=>window.print()); }
function selectedIds(){ const urlIds=new URLSearchParams(location.search).get("ids"); if(urlIds) return urlIds.split(",").map(decodeURIComponent).filter(Boolean); try{ const stored=JSON.parse(localStorage.getItem(PRINT_SELECTION_KEY)||"[]"); if(Array.isArray(stored)&&stored.length) return stored; }catch{} return state.items.map(i=>i.id); }
function selectedItems(){ const ids=selectedIds(); const map=new Map(state.items.map(i=>[i.id,i])); return ids.map(id=>map.get(id)).filter(Boolean); }
function configFor(item){
  const saved = state.configs[item.id] || {};
  const forcedTheme = els.theme.value;
  return {
    ...saved,
    cardSize: "poker",
    theme: forcedTheme === "saved" ? (saved.theme || "parchment") : forcedTheme,
    density: saved.density || "compact",
    artDataUrl: saved.artDataUrl || "",
    artAsset: saved.artAsset || "",
    artFit: saved.artFit || "contain",
    showBackName: saved.showBackName !== false
  };
}
function chunk(arr,size){ const out=[]; for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }
function mirrorRows(items, cols){ const result=[]; for(let i=0;i<items.length;i+=cols) result.push(...items.slice(i,i+cols).reverse()); return result; }
function currentPrintGap() {
  const value = Number(els.printGap?.value || 3);
  return [2, 3, 4].includes(value) ? value : 3;
}

function renderPrintPages(){
  const items = selectedItems();
  const mode = els.printMode.value;
  const size = els.printSize.value;
  const perPage = size === "tarot" ? 4 : size === "large" ? 6 : 9;
  const cols = size === "tarot" || size === "large" ? 2 : 3;

  els.printRoot.innerHTML = "";
  if (!items.length) {
    els.printRoot.innerHTML = '<section class="panel"><p>Nenhum item selecionado.</p></section>';
    return;
  }

  if (mode === "both" || mode === "fronts") renderSheets("Frentes", items, "front", perPage, size);
  if (mode === "both" || mode === "backs") renderSheets("Versos", els.mirrorBacks.checked ? mirrorRows(items, cols) : items, "back", perPage, size);
}
function renderSheets(title, items, side, perPage, size) {
  chunk(items, perPage).forEach((group, index) => {
    const sheet = document.createElement("section");
    sheet.className = "print-sheet";
    sheet.innerHTML = `<h2 class="sheet-title">${escapeHtml(title)} ${index + 1}</h2><div class="sheet-grid size-${size}"></div>`;

    const grid = sheet.querySelector(".sheet-grid");
    grid.style.setProperty("--print-gap", `${currentPrintGap()}mm`);

    group.forEach(item => {
      const slot = document.createElement("div");
      slot.className = `print-slot ${els.showCutLines.checked ? "cut" : ""}`;

      const cfg = configFor(item);
      const card = side === "front"
        ? createCardFront(item, state.types, state.properties, cfg)
        : createCardBack(item, state.types, cfg);

      card.classList.remove("size-poker", "size-tarot", "size-square");
      card.classList.add(`size-${cfg.cardSize || "poker"}`);

      if (side === "front" && els.autoFontFit?.checked) {
        slot.classList.add("auto-font-fit");
        applyAutoFontFit(slot, card, item, cfg);
      }

      slot.appendChild(card);
      grid.appendChild(slot);
    });

    els.printRoot.appendChild(sheet);
  });
}

function applyAutoFontFit(slot, card, item, cfg) {
  const profile = getTextProfile(item, cfg);
  const propCount = profile.propertyCount;
  const bodyChars = profile.bodyChars;
  const sectionCount = profile.sectionCount;

  const noBody = bodyChars === 0;
  const noProperties = propCount === 0;
  slot.classList.toggle("fit-no-body", noBody);
  slot.classList.toggle("fit-no-properties", noProperties);
  slot.classList.toggle("fit-stat-card", noBody && noProperties);

  // O corpo do texto tem prioridade. Quando há pouco texto, ele cresce bastante.
  // As propriedades crescem também, mas só quando o corpo não está pesado.
  let bodyScale = 1;
  if (bodyChars === 0) bodyScale = 1.16;
  else if (bodyChars <= 80) bodyScale = 1.62;
  else if (bodyChars <= 160) bodyScale = 1.48;
  else if (bodyChars <= 260) bodyScale = 1.34;
  else if (bodyChars <= 420) bodyScale = 1.2;
  else if (bodyChars <= 620) bodyScale = 1.08;

  let propScale = 1;
  if (bodyChars <= 260) {
    if (propCount === 0) propScale = 1;
    else if (propCount === 1) propScale = 1.42;
    else if (propCount <= 2) propScale = 1.3;
    else if (propCount <= 4) propScale = 1.16;
  } else if (bodyChars <= 420 && propCount <= 2) {
    propScale = 1.1;
  }

  let chipScale = 1;
  if (noBody && noProperties) chipScale = 1.32;
  else if (profile.chipCount <= 3 && bodyChars <= 420) chipScale = 1.18;
  else if (profile.chipCount <= 5 && bodyChars <= 260) chipScale = 1.12;

  const titleScale = noBody && noProperties
    ? (profile.nameLength <= 18 ? 1.28 : 1.14)
    : (profile.nameLength <= 18 ? 1.14 : profile.nameLength <= 28 ? 1.06 : 0.98);
  const headingScale = Math.min(bodyScale, 1.3);
  const footerScale = noBody && noProperties ? 1.2 : 1;

  // Se houver muitas seções pequenas, reduz um pouco o crescimento para evitar estouro.
  if (sectionCount >= 4) bodyScale = Math.min(bodyScale, 1.16);

  setPt(card, "--auto-title-font", 14 * titleScale);
  setPt(card, "--auto-type-font", 5.7);
  setPt(card, "--auto-chip-font", 6.4 * chipScale);
  setPt(card, "--auto-prop-font", 6.6 * propScale);
  card.style.setProperty("--auto-prop-line", propScale >= 1.15 ? "1.24" : "1.2");
  setPt(card, "--auto-section-title-font", 6.5 * headingScale);
  setPt(card, "--auto-body-font", 7.3 * bodyScale);
  card.style.setProperty("--auto-body-line", bodyScale >= 1.25 ? "1.22" : "1.2");
  setPt(card, "--auto-footer-font", 5.8 * footerScale);
  card.style.setProperty("--auto-text-gap", bodyScale >= 1.25 ? "1.15mm" : ".95mm");
  card.style.setProperty("--auto-prop-bottom", propCount ? "1.3mm" : "0mm");
}

function getTextProfile(item, cfg) {
  const magic = item?.magic || {};
  const textPieces = [
    ...(magic.characteristics || []),
    ...(magic.benefits || []),
    ...(magic.curses || []),
    ...(magic.spellReferences || []),
    magic.alignment || "",
    magic.sentient ? "Item consciente" : "",
    ...(magic.virtues || []),
    ...(magic.flaws || []),
    ...(magic.traits || []),
    item?.notes || "",
    cfg.extraText || ""
  ].filter(Boolean);

  const sections = [
    magic.characteristics?.length,
    magic.benefits?.length,
    magic.curses?.length,
    magic.spellReferences?.length,
    magic.alignment || magic.sentient || magic.virtues?.length || magic.flaws?.length || magic.traits?.length,
    item?.notes,
    cfg.extraText
  ].filter(Boolean).length;

  const type = state.types.find(t => t.id === item?.itemType);
  const chipCount = [
    type?.supportsArmorClass && item?.armorClass,
    type?.supportsDamage && item?.weapon?.damage,
    item?.bonus,
    type?.supportsSpells && item?.magic?.spellTier,
    cfg.showMeta && item?.cost,
    cfg.showMeta && item?.slots !== null && item?.slots !== undefined && item?.slots !== "",
    cfg.showMeta && type?.supportsRange && item?.weapon?.range,
    cfg.showMeta && type?.supportsDamage && item?.weapon?.attackType
  ].filter(Boolean).length;

  return {
    propertyCount: (item?.properties || []).length,
    bodyChars: textPieces.join(" ").length,
    sectionCount: sections,
    chipCount,
    nameLength: (cfg.overrideName?.trim() || item?.name || "").length
  };
}

function setPt(element, property, value) {
  element.style.setProperty(property, `${value.toFixed(2)}pt`);
}

