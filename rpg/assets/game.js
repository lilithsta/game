/* 异世界文字冒险 - 引擎 */
(() => {
  const cfg = window.GAME_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // UI refs
  const elStats = $("#stats");
  const elInv = $("#inventory");
  const elFlags = $("#flags");
  const elImg = $("#scene-img");
  const elText = $("#scene-text");
  const elChoices = $("#choices");
  const elLog = $("#log");
  const elLogWrap = $("#logwrap");

  // Buttons
  $("#btn-new").addEventListener("click", () => confirm("确定重新开始？") && newGame());
  $("#btn-save").addEventListener("click", saveGame);
  $("#btn-load").addEventListener("click", loadGame);
  $("#btn-toggle-log").addEventListener("click", () => {
    elLogWrap.hidden = !elLogWrap.hidden;
  });

  // Game state
  const state = {
    story: null,           // 故事数据
    scene: null,           // 当前场景 id
    stats: { hp: 10, gold: 0, location: "？？？" },
    inventory: [],         // 背包：字符串数组
    flags: {},             // 标记：键 -> true/数值/字符串
    log: [],               // 历程
  };

  // ---------- 数据加载 ----------
  async function loadStory() {
    const url = cfg.storyUrl || "data/story.json";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`载入剧情失败：${res.status}`);
    state.story = await res.json();
  }

  // ---------- 游戏流程 ----------
  async function start() {
    try {
      await loadStory();
      // 尝试自动读取存档
      const autosaved = localStorage.getItem(cfg.autosaveKey);
      if (autosaved) {
        restore(JSON.parse(autosaved));
        render();
        return;
      }
      newGame();
    } catch (e) {
      console.error(e);
      elText.innerHTML = `<p style="color:#ff8080">加载剧情失败：${e.message}</p>`;
    }
  }

  function newGame() {
    const s = state.story;
    state.scene = s?.meta?.start || "prologue";
    state.stats = { hp: 10, gold: 0, location: "起点" };
    state.inventory = [];
    state.flags = {};
    state.log = [];
    render();
    autosave();
  }

  function render() {
    const s = state.story;
    const scene = s.scenes[state.scene];
    if (!scene) {
      elText.textContent = "（场景不存在）";
      elChoices.innerHTML = "";
      return;
    }

    // 背景图
    elImg.style.backgroundImage = scene.image ? `url(${scene.image})` : "none";
    // 文本
    elText.innerHTML = scene.text
      .map((par) => `<p>${escapeHtml(par)}</p>`)
      .join("");

    // 选项
    elChoices.innerHTML = "";
    const valid = scene.choices
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => meetsReq(c.require || {}));

    if (valid.length === 0) {
      // 无选项 = 结束
      const endBtn = document.createElement("button");
      endBtn.className = "choice-btn";
      endBtn.textContent = "—— 旅程在此告一段落，重新开始 ——";
      endBtn.onclick = () => newGame();
      elChoices.appendChild(endBtn);
    } else {
      valid.forEach(({ c }, idx) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.innerHTML = `${escapeHtml(c.text)} <span class="choice-key">[${idx + 1}]</span>`;
        btn.onclick = () => choose(c);
        elChoices.appendChild(btn);
      });
    }

    // 侧栏
    paintStats();
    paintInventory();
    paintFlags();
  }

  function choose(choice) {
    // 效果应用
    applyEffects(choice.effects || {});
    // 设置标记
    if (choice.setFlags) for (const k in choice.setFlags) state.flags[k] = choice.setFlags[k];
    // 背包变化
    if (choice.give) {
      choice.give.forEach((item) => {
        if (!state.inventory.includes(item)) state.inventory.push(item);
      });
    }
    if (choice.take) {
      choice.take.forEach((item) => {
        state.inventory = state.inventory.filter((x) => x !== item);
      });
    }

    // 记录日志
    const title = state.story.scenes[state.scene]?.title || state.scene;
    state.log.push(`${title} -> ${choice.text}`);
    addLogLine(`${title} ⇒ ${choice.text}`);

    // 跳转
    if (choice.next) {
      state.scene = choice.next;
      // 更新地点
      const target = state.story.scenes[state.scene];
      if (target?.location) state.stats.location = target.location;
      render();
      autosave();
    }
  }

  // ---------- 规则 ----------
  function meetsReq(req) {
    // 要求：hp>=x, gold>=x, has:["item"], flags: {k:v 或 true}
    if (req.hpMin != null && state.stats.hp < req.hpMin) return false;
    if (req.goldMin != null && state.stats.gold < req.goldMin) return false;
    if (Array.isArray(req.has) && req.has.some((it) => !state.inventory.includes(it))) return false;
    if (req.flags) {
      for (const k in req.flags) {
        if (state.flags[k] !== req.flags[k]) return false;
      }
    }
    return true;
  }

  function applyEffects(e) {
    if (e.hp) state.stats.hp = Math.max(0, state.stats.hp + e.hp);
    if (e.gold) state.stats.gold = Math.max(0, state.stats.gold + e.gold);
    if (e.setFlag) state.flags[e.setFlag] = true;
    if (e.clearFlag) delete state.flags[e.clearFlag];
  }

  // ---------- UI 刷新 ----------
  function paintStats() {
    elStats.querySelector('[data-k="hp"]').textContent = state.stats.hp;
    elStats.querySelector('[data-k="gold"]').textContent = state.stats.gold;
    elStats.querySelector('[data-k="location"]').textContent = state.stats.location;
  }

  function paintInventory() {
    elInv.innerHTML = "";
    if (state.inventory.length === 0) {
      elInv.innerHTML = `<li class="muted">（空）</li>`;
      return;
    }
    state.inventory.forEach((it) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="badge">物</span> ${escapeHtml(it)}`;
      elInv.appendChild(li);
    });
  }

  function paintFlags() {
    elFlags.innerHTML = "";
    const keys = Object.keys(state.flags);
    if (keys.length === 0) {
      elFlags.innerHTML = `<li class="muted">（无）</li>`;
      return;
    }
    keys.forEach((k) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="badge">标</span> ${escapeHtml(k)} = ${escapeHtml(String(state.flags[k]))}`;
      elFlags.appendChild(li);
    });
  }

  function addLogLine(text) {
    const li = document.createElement("li");
    li.textContent = text;
    elLog.appendChild(li);
    elLogWrap.scrollTop = elLogWrap.scrollHeight;
  }

  // ---------- 存档 ----------
  function saveGame() {
    localStorage.setItem(cfg.autosaveKey, JSON.stringify(snapshot()));
    toast("✅ 已保存");
  }
  function loadGame() {
    const raw = localStorage.getItem(cfg.autosaveKey);
    if (!raw) return toast("⚠️ 没有存档");
    restore(JSON.parse(raw));
    render();
    toast("📖 已读取");
  }
  function autosave() {
    localStorage.setItem(cfg.autosaveKey, JSON.stringify(snapshot()));
  }
  function snapshot() {
    return {
      scene: state.scene,
      stats: state.stats,
      inventory: state.inventory,
      flags: state.flags,
      log: state.log,
    };
  }
  function restore(snap) {
    state.scene = snap.scene;
    state.stats = snap.stats;
    state.inventory = snap.inventory || [];
    state.flags = snap.flags || {};
    state.log = snap.log || [];
    elLog.innerHTML = "";
    state.log.forEach((line) => addLogLine(line));
  }

  // ---------- 工具 ----------
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }
  // 键盘快捷键：1-9 选择
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const n = parseInt(e.key, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 9) {
      const btn = elChoices.querySelectorAll(".choice-btn")[n - 1];
      if (btn) btn.click();
    }
  });

  // 轻提示
  let toastTimer = null;
  function toast(msg){
    let div = document.getElementById("toast");
    if(!div){
      div = document.createElement("div");
      div.id = "toast";
      Object.assign(div.style,{
        position:"fixed", left:"50%", bottom:"24px", transform:"translateX(-50%)",
        background:"#0c1016", color:"#e6e9ef", border:"1px solid #243044",
        padding:"8px 12px", borderRadius:"10px", boxShadow:"0 10px 24px rgba(0,0,0,.35)", zIndex:9999
      });
      document.body.appendChild(div);
    }
    div.textContent = msg;
    div.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ div.style.opacity="0"; }, 1500);
  }

  // 启动
  start();
})();
