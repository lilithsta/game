let currentLang = "en";
let langData = {};
let player = {
  health: 100,
  strength: 10,
  inventory: [],
};
let currentScene = "start";
let storyExtra = "";

const storyEl = document.getElementById("story");
const choicesEl = document.getElementById("choices");
const statsEl = document.getElementById("stats");
const inventoryEl = document.getElementById("inventory");

async function loadLanguage(lang) {
  try {
    const res = await fetch("lang.json");
    langData = await res.json();
    currentLang = lang;
  } catch (e) {
    console.error("Failed to load language file:", e);
  }
}

function t(key) {
  // Simple helper to get translation for stats and events keys
  const parts = key.split(".");
  let ref = langData[currentLang];
  for (const part of parts) {
    if (ref && part in ref) {
      ref = ref[part];
    } else {
      return key; // fallback to key if missing
    }
  }
  return ref;
}

function displayStats() {
  statsEl.textContent = `${t("stats.health")}: ${player.health} | ${t("stats.strength")}: ${player.strength}`;
}

function displayInventory() {
  if (player.inventory.length === 0) {
    inventoryEl.textContent = t("stats.inventory_empty");
  } else {
    inventoryEl.textContent = `${t("stats.inventory")}: ${player.inventory.join(", ")}`;
  }
}

// Example random events, texts from lang JSON events
const randomEvents = [
  () => {
    if (player.health < 100 && Math.random() < 0.2) {
      player.health = Math.min(100, player.health + 20);
      return t("events.herb");
    }
    return null;
  },
  () => {
    if (Math.random() < 0.15) {
      player.inventory.push("Gold Coin");
      return t("events.coin");
    }
    return null;
  },
  () => {
    if (player.health > 30 && Math.random() < 0.1) {
      player.health -= 15;
      return t("events.trap");
    }
    return null;
  },
];

// Render current scene based on lang JSON
function renderScene() {
  storyExtra = "";

  const scenes = langData[currentLang]?.scenes;
  if (!scenes) {
    storyEl.textContent = "Language data not loaded.";
    choicesEl.innerHTML = "";
    return;
  }

  const scene = scenes[currentScene];
  if (!scene) {
    storyEl.textContent = `Scene "${currentScene}" not found.`;
    choicesEl.innerHTML = "";
    return;
  }

  // 恢复血量示例，用 currentScene 判断
  if (currentScene === "rest" && scene.heal) {
    const healed = Math.min(20, 100 - player.health);
    player.health += healed;
    storyExtra = scene.heal.replace("{healed}", healed).replace("{health}", player.health);
  }

  let sceneText = scene.text || "";
  if (storyExtra) sceneText += "\n" + storyExtra;
  console.log("======================", scene);
  storyEl.textContent = sceneText;
  displayStats();
  displayInventory();

  choicesEl.innerHTML = "";

  // 确保choices是对象数组，否则报错
  if (!Array.isArray(scene.choices)) {
    choicesEl.textContent = "No choices available.";
    return;
  }

  scene.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      currentScene = choice.next;

      // 随机事件
      let eventText = null;
      for (const event of randomEvents) {
        eventText = event();
        if (eventText) break;
      }
      if (eventText) storyExtra = eventText;
      else storyExtra = "";

      if (player.health <= 0) {
        currentScene = "gameOver";
      }

      renderScene();
    };
    choicesEl.appendChild(btn);
  });
}

// Reset game state
function initGame() {
  player = {
    health: 100,
    strength: 10,
    inventory: [],
  };
  currentScene = "start";
  storyExtra = "";
  displayStats();
  displayInventory();
  renderScene();
}

// Setup UI events on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startGameBtn");
  const retryBtn = document.getElementById("retryBtn");
  const welcomeScreen = document.getElementById("welcomeScreen");
  const gameContainer = document.getElementById("gameContainer");
  const languageSelect = document.getElementById("languageSelect");

  startBtn.addEventListener("click", async () => {
    await loadLanguage(languageSelect.value);
    welcomeScreen.style.display = "none";
    gameContainer.style.display = "block";
    initGame();
  });

  retryBtn.addEventListener("click", () => {
    retryBtn.style.display = "none";
    initGame();
  });

  languageSelect.addEventListener("change", async () => {
    await loadLanguage(languageSelect.value);
  });
});
