(() => {
  const cfg = window.GAME_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const elText = $("#scene-text");
  const elChoices = $("#choices");
  const elImg = $("#scene-img");
  const elStats = $("#stats");
  const elInv = $("#inventory");
  const langSelect = $("#lang-select");

  const state = {
    story: null,
    langData: null,
    scene: null,
    stats: { hp: 10, gold: 0, location: "???" },
    inventory: [],
  };

  async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
  }

  async function loadStory() {
    const base = await loadJSON(cfg.storyUrl);
    const lang = await loadJSON(`${cfg.langBase}${cfg.lang}.json`);
    state.story = base;
    state.langData = lang;
  }

  async function start() {
    await loadStory();
    state.scene = state.story.meta.start;
    render();
  }

  function render() {
    const s = state.story.scenes[state.scene];
    const L = state.langData[state.scene] || {};

    elImg.style.backgroundImage = s.image ? `url(${s.image})` : "none";
    elText.innerHTML = (L.text || ["[Missing text]"])
      .map((p) => `<p>${p}</p>`)
      .join("");

    elChoices.innerHTML = "";
    (s.choices || []).forEach((c, i) => {
      const t = (L.choices && L.choices[i]) || c.id || "[Missing]";
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.innerHTML = `${t} <span class="choice-key">[${i + 1}]</span>`;
      btn.onclick = () => {
        state.scene = c.next;
        render();
      };
      elChoices.appendChild(btn);
    });

    elStats.querySelector('[data-k="hp"]').textContent = state.stats.hp;
    elStats.querySelector('[data-k="gold"]').textContent = state.stats.gold;
    elStats.querySelector('[data-k="location"]').textContent = state.stats.location;
  }

  langSelect.addEventListener("change", async () => {
    cfg.lang = langSelect.value;
    const lang = await loadJSON(`${cfg.langBase}${cfg.lang}.json`);
    state.langData = lang;
    render();
  });

  start();
})();
