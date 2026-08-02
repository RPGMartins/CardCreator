# Shadowdark — Construtor de Itens Mágicos

Projeto HTML + CSS + JS para criar JSON de itens mágicos de Shadowdark/OSR.

## Como rodar

Como o projeto lê arquivos JSON separados, abra por um servidor local.

Na pasta do projeto:

```bash
python -m http.server
```

Depois acesse:

```text
http://localhost:8000
```

Também funciona com a extensão **Live Server** do VS Code.

## Estrutura

```text
index.html
styles.css
app.js
data/
  manifest.json
  item-types.json
  properties.json
  tables/
    random-magic-item.json
    weapons.json
    armor.json
    scrolls-wands.json
    potions.json
    utility.json
    personality.json
```

## Como adicionar novas opções sem mexer no código

- Para adicionar uma linha nova em uma tabela, edite o arquivo JSON correspondente em `data/tables`.
- Para adicionar uma nova tabela, crie um novo arquivo `.json` em `data/tables` e adicione o caminho em `data/manifest.json`.
- Para adicionar um novo tipo de item, edite `data/item-types.json` e crie tabelas com `category` igual ao novo `id`.

## Campos com múltiplos valores

Benefícios, maldições, virtudes, defeitos, traços e magias referenciadas aceitam várias entradas. Isso permite itens customizados com quantas maldições ou benefícios você quiser.

## Magias

As magias são apenas referenciadas por nome, sem descrição.


## Atualização v2

- As seções Editor, Itens, Consulta e Exportação agora são colapsáveis.
- Armas e armaduras possuem a propriedade **Ruptura (Ru)**.
- Campos sem uso para o tipo de item ativo são ocultados/desabilitados.
- Pergaminhos e varinhas, ao rolar benefícios/maldições, usam a tabela **“Use as Tabelas de...”** para escolher entre Armaduras, Armas, Poções ou Utilitários.
- Benefícios, maldições, virtudes, defeitos, traços e magias continuam aceitando múltiplas entradas.


## Atualização v3

- O padrão xadrez foi substituído por blocos alternados de cor entre grupos.
- `Campos mágicos` agora é colapsável e visualmente diferenciado.
- `Rolar item mágico completo` substitui os campos mágicos atuais.
- Botões individuais para rolar/limpar características, benefícios, maldições, personalidade e magias.
- Botões individuais não substituem o que já existe; eles adicionam novas entradas.
- Virtudes, defeitos e traços agora ficam cada um em uma linha, com mais espaço.
- Pergaminhos e varinhas agora têm campo de `Grau da magia`.


## Atualização v4

- Armaduras agora têm campo **CA da armadura**.
- Pergaminhos e varinhas agora filtram o campo **Selecionar magia** de acordo com o **Grau da magia** escolhido.
- Foram adicionadas as referências de magias de **Grau 2 a Grau 5**.
- A importação agora aceita selecionar um arquivo `.json` local, além de colar o JSON manualmente.


## Atualização v5 — Criador de cartas

Nova página: `card.html`.

Arquivos novos: `card.html`, `card.css`, `card.js`.

A página lê os itens do localStorage do criador principal ou importa um JSON exportado. A carta usa uma base única para todos os itens e adapta os campos automaticamente:

- Armaduras mostram CA.
- Armas mostram dado de dano, alcance e tipo.
- Pergaminhos e varinhas mostram grau e magias.
- Todos os itens podem mostrar bônus, propriedades, características, benefícios, maldições, personalidade, observações e tags.
- A página aceita upload de imagem para usar como arte da carta.
- Há opção de imprimir/salvar em PDF pelo navegador.


## Atualização v6 — Cartas para impressão

- O botão **Abrir criador de cartas** virou um botão visual mais claro.
- Em **Itens cadastrados**, cada item agora tem a ação **Abrir carta**.
- A tabela de itens permite selecionar vários itens e abrir uma **Página de impressão** com todas as cartas selecionadas.
- As configurações feitas em `card.html` podem ser salvas por item no navegador.
- A carta agora usa frente e verso:
  - Frente: texto, CA, dano, bônus, propriedades, benefícios, maldições e observações.
  - Verso: arte/imagem do item em destaque.
- Foi adicionada `print.html` para imprimir várias cartas de uma vez.
- A impressão gera páginas separadas para frentes e versos, com opção de espelhar a ordem dos versos para duplex.
- Arquivo compartilhado `card-renderer.js` mantém a mesma base visual para `card.html` e `print.html`.


## Atualização v8

- Os atalhos do painel de cartas agora são botões reais (`button`), não links estilizados.
- Removido o botão `Selecionar visíveis`.
- A seleção para impressão agora fica junto das ações do item, com um botão toggle:
  - `Desselecionado`
  - `Selecionado`
- `Limpar seleção` marca todos os itens como desselecionados.
- `Montar página de impressão` envia apenas os itens selecionados para `print.html`.


## Atualização v9

- O botão toggle `Selecionado` / `Desselecionado` agora também existe explicitamente no `index.html` dentro de um template usado pela lista de itens.
- A lista de itens continua sendo renderizada pelo `app.js`, mas agora usa o template do HTML.
- Os botões do topo em `card.html` e `print.html` foram padronizados com o mesmo estilo do painel principal.
- `print.html` agora também possui botão para abrir o criador de cartas diretamente, mesmo sem carta selecionada.

## Atualização v10 — filtros por TAG

- Tags agora são normalizadas para MAIÚSCULO ao criar/salvar/importar itens.
- A lista de itens cadastrados ganhou filtros por TAG:
  - `Incluir TAGS`: mostra apenas itens que tenham todas as TAGS informadas.
  - `Excluir TAGS`: oculta itens que tenham qualquer uma das TAGS informadas.
- Os filtros também normalizam o valor digitado para MAIÚSCULO antes de comparar.


## Atualização v11 — filtro avançado

O antigo campo de busca simples e o painel separado de TAG foram substituídos por um painel de filtro avançado inspirado no estilo do 5e.tools, mas simplificado.

Filtros disponíveis:

- Busca geral.
- Nome.
- Tipo de item.
- Subtipo.
- Incluir TAGS.
- Excluir TAGS.
- Propriedade.
- Bônus.
- Data de criação inicial.
- Data de criação final.
- Texto mágico.
- Ordenação.

As TAGS continuam sendo normalizadas para MAIÚSCULO ao criar, editar, importar e filtrar.


## Atualização v12 — busca simples e subtela de filtros

- Corrigido o erro causado por referências de filtro que podiam ficar `undefined`.
- A lista de itens agora mostra apenas uma barra principal: **Pesquisar por nome**.
- O botão **Filtros** abre uma subtela/modal com os filtros avançados:
  - Tipo de item.
  - Subtipo.
  - Incluir TAGS.
  - Excluir TAGS.
  - Propriedade.
  - Bônus.
  - Data de criação inicial/final.
  - Texto mágico.
  - Ordenação.
- O botão **Limpar filtros** limpa tanto a busca por nome quanto os filtros da subtela.


## Atualização v13 — cartas padrão com artes no verso

Adicionado um pacote de criação automática de cartas padrão.

Novos arquivos/pastas:

```text
data/seeds/standard-equipment.json
assets/reference/catalogo-equipamentos-antigos.png
assets/reference/adagas-referencia.png
assets/item-art/*.png
tools/create-standard-equipment-cards.js
```

Na página principal há uma seção **Cartas padrão** com dois botões:

- **Criar cartas padrão**: cria/atualiza armas e armaduras padrão.
- **Criar e selecionar para impressão**: cria/atualiza e marca todas essas cartas como selecionadas para `print.html`.

As cartas usam a mesma estrutura dos itens do site. As artes ficam no verso da carta via configuração `artAsset`, sem precisar colar base64 no JSON.


## Atualização v14 — standard equipment revisado

- `data/seeds/standard-equipment.json` foi recriado usando as tabelas enviadas pelo usuário:
  - Armas.
  - Novas armas.
  - Armaduras.
  - Propriedades adicionais.
- Removidas as observações redundantes dos itens padrão.
- Custos, tipos, alcances, danos, CA, espaços e propriedades foram atualizados.
- Adicionadas as propriedades:
  - `Bo` — Boleadeira.
  - `Sh` — Shuriken.
  - `Za` — Zarabatana.
- Adicionados:
  - Bastão.
  - Machadinha.
  - Escudo redondo.
- O seed padrão não usa mais artes recortadas do catálogo/referência anterior.


## Atualização v15 — imagens para as cartas padrão

- Criada uma folha de artes em estética OSR/Shadowdark para os itens padrão.
- A folha completa fica em:

```text
assets/reference/standard-equipment-art-sheet.png
```

- As artes individuais recortadas ficam em:

```text
assets/item-art/
```

- `data/seeds/standard-equipment.json` agora aponta cada carta para sua arte no verso usando `artAsset`.
- Ao clicar em **Criar cartas padrão** ou **Criar e selecionar para impressão**, as cartas já recebem as imagens correspondentes.


## Atualização v16 — edição de carta e auto-save

- Na lista de itens cadastrados, o botão principal agora é **Editar carta** e abre `card.html?item=<id>`.
- A ação de edição do JSON do item continua disponível como **Editar item**.
- A página `card.html` agora salva automaticamente as opções da carta no `localStorage` ao alterar tema, tamanho, densidade, imagem, textos e opções de exibição.
- Ao enviar uma imagem para o verso da carta, ela é comprimida/redimensionada antes de salvar no storage para reduzir risco de estourar o limite do navegador.
- A página de impressão passa a encontrar a imagem salva sem precisar clicar manualmente em “Salvar configuração da carta”.


## Atualização v17 — correção de ações e autosave de carta

- Corrigido o erro `cardBtn is null`.
- Em **Itens cadastrados**, o botão **Editar** abre diretamente `card.html?item=<id>`.
- O botão **Editar item** continua editando o JSON do item no formulário principal.
- As opções da carta agora são salvas automaticamente no `localStorage`.
- A imagem enviada para o verso da carta é comprimida e salva automaticamente, para aparecer também na página de impressão.
- A carta também é salva ao trocar o item selecionado e antes de sair da página.


## Atualização v18 — impressão em tamanho real

- Corrigido o encolhimento das cartas no preview/impressão.
- A regra responsiva que aplicava `transform: scale(.72)` agora só vale para tela pequena, não para impressão.
- A impressão força A4 em milímetros:
  - Poker real: 63 × 88 mm, 9 por folha.
  - Grande: 70 × 98 mm, 6 por folha.
  - Mini: 57 × 80 mm, 9 por folha.
  - Tarot: 70 × 120 mm, 4 por folha.
- A página de impressão agora orienta usar escala 100%, margens nenhuma/mínimas e gráficos de segundo plano.


## Atualização v19 — categoria Equipamentos e itens básicos

- Adicionada uma nova categoria: **Equipamentos**.
- Adicionado o arquivo:

```text
data/tables/equipment.json
```

- O pacote `data/seeds/standard-equipment.json` agora cria:
  - armas padrão;
  - armaduras padrão;
  - equipamentos básicos em português;
  - equipamentos extras da tabela Basic Gear.
- Os botões da página inicial agora criam **itens básicos**, não apenas armas/armaduras.
- O campo `Espaços` aceita texto, permitindo valores como `1-20` e `100 (100 primeiras não usam espaço)`.
- Tags agora são padronizadas sem acento e em maiúsculo:
  - `padrão` vira `PADRAO`;
  - `poção` vira `POCAO`;
  - `mágico` vira `MAGICO`.


## Atualização v20 — cache bust e garantia da aba Equipamentos

- `index.html`, `card.html` e `print.html` agora carregam CSS/JS com `?v=20`.
- Os `fetch` dos JSON usam `cache: "no-store"` e `?v=20`.
- A versão aparece visível no topo da página principal.
- O `app.js` agora garante a existência da categoria **Equipamentos** mesmo se algum JSON antigo ficar cacheado.
- O painel **Criar armas, armaduras e equipamentos básicos** recebeu destaque visual.


## Atualização v21 — ajuste automático de fonte na impressão

- Adicionada a opção **Ajustar fonte automaticamente** na página de impressão.
- A opção vem ativada por padrão e pode ser desligada.
- Mantidos os modelos de tamanho da carta:
  - Poker real.
  - Grande.
  - Mini.
  - Tarot.
- A impressão agora usa fontes base um pouco maiores.
- Quando a carta tem pouco texto no corpo, o corpo cresce mais.
- Quando há poucas propriedades e ainda há espaço, as propriedades também crescem.
- A prioridade de crescimento é do corpo do texto; propriedades têm prioridade menor.


## Atualização v22 — impressão mais legível

- A linha superior da carta, como `ARMA • CLAVA`, não aparece mais na página de impressão.
- O rodapé com tags, como `PADRAO • ARMA`, agora fica ancorado no centro inferior da carta.
- Corrigido o caso em que cartas sem corpo de texto empurravam o rodapé para cima.
- O ajuste automático ficou mais agressivo:
  - cartas quase vazias aumentam mais o nome e os chips;
  - cartas com pouco corpo de texto aumentam mais o texto principal;
  - propriedades crescem mais quando existem poucas propriedades e há espaço.


## Atualização v23 — lista compacta e seleção em massa

- A área **Itens cadastrados** foi trocada de cards grandes para uma tabela compacta.
- A tabela tem cabeçalho fixo e ocupa menos altura.
- Cada item agora tem checkbox próprio para selecionar/desselecionar rapidamente.
- Novas ações em massa:
  - **Selecionar visíveis**.
  - **Desselecionar visíveis**.
  - **Inverter visíveis**.
  - **Limpar seleção**.
- Novo seletor por grupo/tipo:
  - escolha `Armas`, `Armaduras`, `Equipamentos`, etc.;
  - clique em **Selecionar tipo** ou **Desselecionar tipo**.
- O contador agora mostra total selecionado e quantos visíveis estão selecionados.


## Atualização v24 — tabela cadastrada mais enxuta

- A versão no topo agora aparece como **v24**.
- A seção foi renomeada para **Itens cadastrados — tabela compacta v24**, facilitando identificar se a versão certa carregou.
- A tabela ficou mais estreita e com linhas menores.
- Os dados principais foram abreviados para caber mais itens na tela:
  - `D` para dano.
  - `E` para espaços.
  - `Q` para quantidade por espaço.
  - `T` para tipo de ataque.
- A coluna de ações ficou menor.
- As tags agora ocupam menos altura por linha.


## Atualização v25 — lista realmente compacta

- A tabela de **Itens cadastrados** ficou mais densa para lidar com 60+ itens.
- Adicionados botões **Selecionar aba atual** e **Desselecionar aba atual**.
- A altura da tabela é limitada e o cabeçalho fica fixo.
- As linhas usam fontes menores, chips menores e ações compactas.
- Adicionado fallback CSS: se algum JavaScript antigo ainda renderizar cards, eles também ficam compactos.
- A tela mostra **Tabela compacta v25** acima da lista para confirmar que a versão correta carregou.


## Atualização v26 — execução em porta própria

- Mantém a tabela compacta dos itens cadastrados.
- Atualiza cache bust para `?v=26`.
- Adiciona `run-v26.bat`, que entra automaticamente na pasta do projeto e abre o servidor em `127.0.0.1:8010`.
- Use `http://127.0.0.1:8010/index.html?v=26` para evitar pegar um servidor antigo na porta 8000.


## Atualização v27 — filtros e tabela maior

- Removidos os textos visuais de `Tabela compacta`.
- A seção voltou a aparecer apenas como **Itens cadastrados**.
- A área rolável da tabela foi aumentada para cerca do dobro.
- A busca/filtro ganhou modo de combinação:
  - **AND**: todos os campos ativos precisam bater.
  - **OR**: qualquer campo ativo pode bater.
- O modal de filtros agora permite combinar campos em estilo 5eTools.
- O campo **Incluir TAGS** tem modo próprio:
  - **Todas as TAGS**.
  - **Qualquer TAG**.
- O campo **Propriedades** aceita lista separada por vírgula.
- `run.bat` agora abre em `http://127.0.0.1:8011/index.html?v=27` para evitar servidor antigo na porta 8000.


## Atualização v28 — espaçamento entre cartas

- A página de impressão agora tem o campo **Espaçamento**.
- Opções:
  - **Compacto — 2 mm**.
  - **Corte fácil — 3 mm**.
  - **Corte confortável — 4 mm**.
- O padrão é **3 mm**, bom para corte com guilhotina sem desperdiçar muita folha.
- O espaçamento é aplicado na tela e na impressão via CSS `--print-gap`.
- `run.bat` abre em `http://127.0.0.1:8012/index.html?v=28`.


## Atualização v29 — index em abas internas

- A página `index.html` agora usa abas internas:
  - **Editor**.
  - **Itens**.
  - **Consulta**.
  - **Exportação**.
- Cada área ocupa a largura total da tela, sem ficar espremida no grid antigo.
- Ao clicar em **Item** na tabela de itens cadastrados, a página troca automaticamente para a aba **Editor** com o item carregado.
- O editor foi reorganizado para aproveitar colunas:
  - dados básicos ocupam a linha superior;
  - propriedades ficam na coluna lateral;
  - campos mágicos ficam na área maior;
  - observações/tags ficam abaixo das propriedades.
- A tabela de itens usa mais altura da tela dentro da própria aba.
- A consulta e exportação também usam mais espaço horizontal.
- `run.bat` abre em `http://127.0.0.1:8013/index.html?v=29`.


## Atualização v30 — ajuste visual do Editor

- A coluna esquerda do Editor ficou maior.
- **Propriedades do item** ganhou mais altura.
- A área com scroll das propriedades ficou bem maior.
- **Observações** ganhou mais altura.
- **Tags** fica alinhado mais próximo do final da área de campos mágicos.
- Os botões **Adicionar item**, **Duplicar selecionado** e **Limpar** foram centralizados.
- `run.bat` abre em `http://127.0.0.1:8014/index.html?v=30`.


## Atualização v31 — correções mobile

- Adicionados ajustes para evitar vazamento horizontal no celular.
- Header, painéis, abas, filtros, botões e editor agora quebram melhor em telas pequenas.
- A tabela de itens fica dentro de uma área com rolagem horizontal própria, sem empurrar a página inteira.
- O modal de filtros cabe melhor na tela do celular.
- Botões de seleção em massa quebram em colunas no mobile.
- Campos mágicos, propriedades, observações e tags viram uma coluna única no celular.
- `run.bat` abre em `http://127.0.0.1:8015/index.html?v=31`.
