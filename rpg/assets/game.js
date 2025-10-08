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
    scene: null,
    stats: { hp: 10, gold: 0, location: "???" },
    inventory: [],
  };

  async function loadStory() {
    const res = await fetch(cfg.storyUrl);
    state.story = await res.json();
  }

  async function start() {
    await loadStory();
    state.scene = state.story.meta.start;
    render();
  }

  function render() {
    const scene = state.story.scenes[state.scene];
    const lang = cfg.lang;

    const t = (obj) => (typeof obj === "string" ? obj : obj[lang] || obj["en"] || "");
    elImg.style.backgroundImage = scene.image ? `url(${scene.image})` : "none";
    elText.innerHTML = scene.text.map((p) => `<p>${t(p)}</p>`).join("");

    elChoices.innerHTML = "";
    scene.choices.forEach((c, i) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.innerHTML = `${t(c.text)} <span class="choice-key">[${i + 1}]</span>`;
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

  langSelect.addEventListener("change", () => {
    cfg.lang = langSelect.value;
    render();
  });

  start();
})();
