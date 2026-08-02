window.ShadowdarkCardRenderer = (() => {
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getType(types, id) {
    return types.find(type => type.id === id) || null;
  }

  function getTypeLabel(types, id) {
    return getType(types, id)?.label || id || "Item";
  }

  function getConfig(config = {}) {
    return {
      cardSize: config.cardSize || "poker",
      theme: config.theme || "parchment",
      density: config.density || "normal",
      showDescriptions: config.showDescriptions !== false,
      showMeta: config.showMeta !== false,
      showBackName: Boolean(config.showBackName),
      artDataUrl: config.artDataUrl || "",
      artAsset: config.artAsset || "",
      artFit: config.artFit || "contain",
      overrideName: config.overrideName || "",
      extraText: config.extraText || ""
    };
  }

  function createCardPair(item, types, properties, config = {}) {
    const cfg = getConfig(config);
    const wrap = document.createElement("div");
    wrap.className = "card-pair";
    wrap.dataset.itemId = item?.id || "";
    wrap.appendChild(createCardFront(item, types, properties, cfg));
    wrap.appendChild(createCardBack(item, types, cfg));
    return wrap;
  }

  function createCardFront(item, types, properties, cfg = {}) {
    cfg = getConfig(cfg);
    const type = getType(types, item?.itemType);
    const card = document.createElement("article");
    card.className = `item-card card-front size-${cfg.cardSize} theme-${cfg.theme} density-${cfg.density}`;

    const name = cfg.overrideName?.trim() || item?.name || "Item sem nome";
    const typeText = `${type?.singular || "Item"}${item?.subtype ? " • " + item.subtype : ""}`;

    card.innerHTML = `
      <header class="card-title-block">
        <p class="card-type">${escapeHtml(typeText)}</p>
        <h2>${escapeHtml(name)}</h2>
      </header>
      <section class="card-statbar">${renderStats(item, type, cfg)}</section>
      <section class="card-properties">${renderProperties(item, type, properties, cfg)}</section>
      <section class="card-text">${renderText(item, cfg)}</section>
      <footer class="card-footer">${renderFooter(item, type)}</footer>
    `;
    return card;
  }

  function createCardBack(item, types, cfg = {}) {
    cfg = getConfig(cfg);
    const type = getType(types, item?.itemType);
    const card = document.createElement("article");
    card.className = `item-card card-back size-${cfg.cardSize} theme-${cfg.theme} density-${cfg.density}`;
    const name = cfg.overrideName?.trim() || item?.name || "Item sem nome";
    const artSrc = cfg.artDataUrl || cfg.artAsset || "";
    const art = artSrc
      ? `<img alt="Arte do item" src="${escapeHtml(artSrc)}" />`
      : `<div class="back-placeholder"><span>Arte do item</span><small>${escapeHtml(type?.singular || "Item")}</small></div>`;

    card.innerHTML = `
      <section class="card-back-art ${cfg.artFit === "cover" ? "cover" : "contain"}">${art}</section>
      ${cfg.showBackName ? `<footer class="back-name">${escapeHtml(name)}</footer>` : ""}
    `;
    return card;
  }

  function renderStats(item, type, cfg) {
    const chips = [];
    if (type?.supportsArmorClass && item?.armorClass) chips.push(["CA", item.armorClass]);
    if (type?.supportsDamage && item?.weapon?.damage) chips.push(["Dano", item.weapon.damage]);
    if (item?.bonus) chips.push(["Bônus", item.bonus]);
    if (type?.supportsSpells && item?.magic?.spellTier) chips.push(["Grau", item.magic.spellTier]);

    if (cfg.showMeta) {
      if (item?.cost) chips.push(["Custo", item.cost]);
      if (item?.slots !== null && item?.slots !== undefined && item?.slots !== "") chips.push([item?.itemType === "equipment" ? "Qtd./Espaço" : "Espaços", item.slots]);
      if (type?.supportsRange && item?.weapon?.range) chips.push(["Alcance", item.weapon.range]);
      if (type?.supportsDamage && item?.weapon?.attackType) chips.push(["Tipo", item.weapon.attackType]);
    }

    return chips.map(([label, value]) => `<span class="stat-chip">${escapeHtml(label)}: ${escapeHtml(value)}</span>`).join("");
  }

  function renderProperties(item, type, allProperties, cfg) {
    const codes = item?.properties || [];
    if (!codes.length) return "";
    const group = type?.propertyGroup;
    const glossary = group ? allProperties[group] || [] : [];

    return codes.map(code => {
      const prop = glossary.find(p => p.code === code);
      if (!cfg.showDescriptions || !prop) return `<div class="property-line"><strong>${escapeHtml(code)}</strong></div>`;
      return `<div class="property-line"><strong>${escapeHtml(prop.code)} — ${escapeHtml(prop.name)}.</strong> ${escapeHtml(prop.description)}</div>`;
    }).join("");
  }

  function renderText(item, cfg) {
    const magic = item?.magic || {};
    const sections = [];
    addList(sections, "Características", magic.characteristics);
    addList(sections, "Benefícios", magic.benefits);
    addList(sections, "Maldições", magic.curses);
    addList(sections, "Magias", magic.spellReferences);

    const personality = [];
    if (magic.alignment) personality.push(`Alinhamento: ${magic.alignment}`);
    if (magic.sentient) personality.push("Item consciente");
    if (magic.virtues?.length) personality.push(`Virtudes: ${magic.virtues.join("; ")}`);
    if (magic.flaws?.length) personality.push(`Defeitos: ${magic.flaws.join("; ")}`);
    if (magic.traits?.length) personality.push(`Traços: ${magic.traits.join("; ")}`);

    addParagraph(sections, "Personalidade", personality.join(". "));
    addParagraph(sections, "Observações", item?.notes || "");
    addParagraph(sections, "Texto extra", cfg.extraText || "");
    return sections.join("");
  }

  function addList(sections, title, values = []) {
    if (!values || !values.length) return;
    sections.push(`<section class="text-section"><h3>${escapeHtml(title)}</h3><ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul></section>`);
  }

  function addParagraph(sections, title, value) {
    if (!value) return;
    sections.push(`<section class="text-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(value)}</p></section>`);
  }

  function renderFooter(item, type) {
    return escapeHtml(item?.tags?.length ? item.tags.join(" • ") : type?.label || "Item mágico");
  }

  return {
    escapeHtml,
    getType,
    getTypeLabel,
    getConfig,
    createCardPair,
    createCardFront,
    createCardBack
  };
})();
