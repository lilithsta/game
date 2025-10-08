(async () => {
  const cfg = window.GAME_CONFIG || {
    storyUrl: "data/story_base.json",
    langBase: "data/lang_",
    lang: "en",
    autosaveKey: "isekai_save_v4"
  };

  const $ = (s) => document.querySelector(s);
  const elText = $("#scene-text");
  const elChoices = $("#choices");
  const elImg = $("#scene-img");
  const langSelect = $("#lang-select");

  let story = null;
  let langData = null;
  let state = null;

  // ---------- Load JSON helper ----------
  async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return await res.json();
  }

  // ---------- Load story and language ----------
  async function loadStory() {
    story = await loadJSON(cfg.storyUrl);
    await loadLang(cfg.lang);
  }

  async function loadLang(lang) {
    const url = `${cfg.langBase}${lang}.json`;
    langData = await loadJSON(url);
  }

  // ---------- Save & Load ----------
  function saveGame() {
    localStorage.setItem(cfg.autosaveKey, JSON.stringify(state));
  }

  function loadSave() {
    const raw = localStorage.getItem(cfg.autosaveKey);
    if (!raw) return null;
    return JSON.parse(raw);
  }

  // ---------- Initialize ----------
  async function start() {
    await loadStory();
    const saved = loadSave();
    if (saved) {
      state = saved;
      renderScene();
    } else {
      state = {
        ...story.variables,
        scene: story.meta.start
      };
      renderScene();
    }
  }

  // ---------- Helper for text ----------
  function t(sceneId, field) {
    if (!langData) return "";
    const obj = langData[sceneId];
    if (!obj) return "";
    return obj[field] || "";
  }

  // ---------- Conditional Checks ----------
  function checkRequire(require) {
    if (!require) return true;
    if (require.goldMin && state.gold < require.goldMin) return false;
    if (require.quest && state.quests[require.quest] !== require.value) return false;
    return true;
  }

  // ---------- Apply Effects ----------
  function applyEffects(effects) {
    if (!effects) return;
    if (effects.gold) state.gold += effects.gold;
    if (effects.hp) state.hp += effects.hp;
    if (effects.quest && effects.questState)
      state.quests[effects.quest] = effects.questState;
    if (effects.addItem)
      state.inventory.push(effects.addItem);
    saveGame();
  }

  // ---------- Render ----------
  function renderScene() {
    const id = state.scene;
    const scene = story.scenes[id];
    if (!scene) {
      elText.innerHTML = "<p>Scene not found.</p>";
      return;
    }

    // background
    if (scene.image) {
      elImg.style.backgroundImage = `url(${scene.image})`;
    } else {
      elImg.style.backgroundImage = "none";
    }

    // text
    const lines = (langData[id]?.text || []);
    elText.innerHTML = lines.map((p) => `<p>${p}</p>`).join("");

    // choices
    elChoices.innerHTML = "";
    (scene.choices || []).forEach((c) => {
      if (!checkRequire(c.require)) return;
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = langData[id]?.choices?.[scene.choices.indexOf(c)] || c.id;
      btn.onclick = () => {
        applyEffects(c.effects);
        state.scene = c.next;
        renderScene();
      };
      elChoices.appendChild(btn);
    });

    saveGame();
  }

  // ---------- Language Switch ----------
  langSelect.addEventListener("change", async () => {
    cfg.lang = langSelect.value;
    await loadLang(cfg.lang);
    renderScene();
  });

  start();
})();
