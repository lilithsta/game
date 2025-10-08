(async () => {
  const cfg = window.GAME_CONFIG;
  const $ = (s) => document.querySelector(s);

  const elText = $("#scene-text");
  const elChoices = $("#choices");
  const elImg = $("#scene-img");
  const langSelect = $("#lang-select");
  const elHP = $("#stat-hp");
  const elGold = $("#stat-gold");
  const elRep = $("#stat-rep");
  const elQuests = $("#quests");
  const elInv = $("#inventory");

  const btnNew = $("#btn-new");
  const btnSave = $("#btn-save");
  const btnLoad = $("#btn-load");

  let story, langData, state;

  // --------- Loaders ---------
  async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load " + url);
    return await res.json();
  }

  async function loadLang(lang) {
    langData = await loadJSON(cfg.langBase + lang + ".json");
  }

  async function loadStory() {
    story = await loadJSON(cfg.storyUrl);
    await loadLang(cfg.lang);
  }

  // --------- Save / Load ---------
  function saveGame() {
    localStorage.setItem(cfg.autosaveKey, JSON.stringify(state));
  }
  function loadSave() {
    const raw = localStorage.getItem(cfg.autosaveKey);
    return raw ? JSON.parse(raw) : null;
  }

  function newGame() {
    state = {
      ...story.variables,
      scene: story.meta.start
    };
    renderScene();
  }

  // --------- Effects & Requirements ---------
  function checkRequire(r) {
    if (!r) return true;
    if (r.goldMin && state.gold < r.goldMin) return false;
    if (r.quest && state.quests[r.quest] !== r.value) return false;
    return true;
  }

  function applyEffects(e) {
    if (!e) return;
    if (e.gold) state.gold += e.gold;
    if (e.hp) state.hp += e.hp;
    if (e.rep) state.reputation += e.rep;
    if (e.quest && e.questState) state.quests[e.quest] = e.questState;
    if (e.addItem) state.inventory.push(e.addItem);
  }

  // --------- Rendering ---------
  function renderScene() {
    const id = state.scene;
    const sc = story.scenes[id];
    const lang = langData[id];

    // background
    elImg.style.backgroundImage = sc.image ? `url(${sc.image})` : "none";

    // text
    elText.innerHTML = (lang?.text || []).map(p => `<p>${p}</p>`).join("");

    // choices
    elChoices.innerHTML = "";
    (sc.choices || []).forEach((c, i) => {
      if (!checkRequire(c.require)) return;
      const label = lang?.choices?.[i] || c.id;
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = label;
      btn.onclick = () => {
        applyEffects(c.effects);
        state.scene = c.next;
        saveGame();
        renderScene();
      };
      elChoices.appendChild(btn);
    });

    renderStatus();
  }

  function renderStatus() {
    elHP.textContent = state.hp;
    elGold.textContent = state.gold;
    elRep.textContent = state.reputation;

    elQuests.innerHTML = "";
    Object.entries(state.quests).forEach(([q, st]) => {
      const li = document.createElement("li");
      li.textContent = `${q}: ${st}`;
      elQuests.appendChild(li);
    });

    elInv.innerHTML = "";
    (state.inventory || []).forEach(it => {
      const li = document.createElement("li");
      li.textContent = it;
      elInv.appendChild(li);
    });
  }

  // --------- Language switch ---------
  langSelect.addEventListener("change", async () => {
    cfg.lang = langSelect.value;
    await loadLang(cfg.lang);
    renderScene();
  });

  // --------- Buttons ---------
  btnNew.addEventListener("click", newGame);
  btnSave.addEventListener("click", saveGame);
  btnLoad.addEventListener("click", () => {
    const s = loadSave();
    if (s) {
      state = s;
      renderScene();
    }
  });

  // --------- Start ---------
  await loadStory();
  state = loadSave() || { ...story.variables, scene: story.meta.start };
  renderScene();
})();
