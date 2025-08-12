let currentLang = "en";
let langData = {};
let player = {
  health: 100,
  strength: 10,
  inventory: []
};
let currentScene = "start";
let storyExtra = "";

const storyEl = document.getElementById("story");
const choicesEl = document.getElementById("choices");
const statsEl = document.getElementById("stats");
const inventoryEl = document.getElementById("inventory");

async function loadLanguage(lang) {
  try {
    const response = await fetch("lang.json");
    langData = await response.json();
    currentLang = lang;
  } catch (e) {
    console.error("Language load error:", e);
  }
}

// Nested key translation function
function t(key) {
  if (!langData[currentLang]) return key;
  const keys = key.split(".");
  let result = langData[currentLang];
  for (const k of keys) {
    if (result[k] !== undefined) {
      result = result[k];
    } else {
      return key; // fallback if not found
    }
  }
  return result;
}

// Display player stats
function displayStats() {
  statsEl.textContent = `${t("stats.health")}: ${player.health} | ${t("stats.strength")}: ${player.strength}`;
}

// Display inventory
function displayInventory() {
  if (player.inventory.length === 0) {
    inventoryEl.textContent = t("stats.inventory_empty");
  } else {
    inventoryEl.textContent = `${t("stats.inventory")}: ${player.inventory.join(", ")}`;
  }
}

const scenes = {
  start: {
    textKey: "scenes.start.text",
    choicesKeys: ["scenes.start.choices"]
  },
  cellLook: {
    onEnter: () => {
      if (!player.inventory.includes("Rusty Key")) {
        player.inventory.push("Rusty Key");
        storyExtra = t("scenes.cellLook.text_found");
      } else {
        storyExtra = t("scenes.cellLook.text_seen");
      }
    },
    textKey: null,
    choicesKeys: ["scenes.cellLook.choices"]
  },
  searchCell: {
    textKey: "scenes.searchCell.text",
    choicesKeys: ["scenes.searchCell.choices"]
  },
  doorTry: {
    textKey: "scenes.doorTry.text",
    choicesKeys: ["scenes.doorTry.choices"]
  },
  doorOpen: {
    textKey: "scenes.doorOpen.text",
    choicesKeys: ["scenes.doorOpen.choices"]
  },
  shout: {
    textKey: "scenes.shout.text",
    choicesKeys: ["scenes.shout.choices"]
  },
  rest: {
    onEnter: () => {
      const healed = Math.min(20, 100 - player.health);
      player.health += healed;
      storyExtra = t("scenes.rest.heal").replace("{healed}", healed).replace("{health}", player.health);
    },
    textKey: "scenes.rest.text",
    choicesKeys: ["scenes.rest.choices"]
  },
  wait: {
    textKey: "scenes.wait.text",
    choicesKeys: ["scenes.wait.choices"]
  },
  fight: {
    textKey: "scenes.fight.text",
    choicesKeys: ["scenes.fight.choices"]
  },
  reason: {
    textKey: "scenes.reason.text",
    choicesKeys: ["scenes.reason.choices"]
  },
  gameOver: {
    textKey: "scenes.gameOver.text",
    choicesKeys: ["scenes.gameOver.choices"]
  }
};

// Random events example
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
  }
];

function renderScene() {
  storyExtra = "";

  if (!scenes[currentScene]) {
    console.error("Unknown scene:", currentScene);
    return;
  }

  const scene = scenes[currentScene];

  if (scene.onEnter) scene.onEnter();

  let text = scene.textKey ? t(scene.textKey) : "";
  if (storyExtra) text += "\n" + storyExtra;

  storyEl.textContent = text;

  displayStats();
  displayInventory();

  choicesEl.innerHTML = "";

  const choicesKeys = scene.choicesKeys[0]; // first (and only) key array
  const choicesTexts = t(choicesKeys);
  if (!Array.isArray(choicesTexts)) {
    console.error("Choices are not an array for", choicesKeys);
    return;
  }

  choicesTexts.forEach(choiceText => {
    const btn = document.createElement("button");
    btn.textContent = choiceText;

    btn.onclick = () => {
      // Map choice text to next scene (simple example, you can expand with a mapping table)
      switch (currentScene) {
        case "start":
          if (choiceText === "🔍 Look around the cell" || choiceText === "🔍 周囲を調べる") currentScene = "cellLook";
          else if (choiceText === "🚪 Try to open the door" || choiceText === "🚪 ドアを開けようとする") currentScene = "doorTry";
          else if (choiceText === "📣 Shout for help" || choiceText === "📣 助けを呼ぶ") currentScene = "shout";
          else if (choiceText === "🛏️ Rest for a moment" || choiceText === "🛏️ 少し休む") currentScene = "rest";
          break;

        case "cellLook":
          if (choiceText === "🔑 Try the key on the door" || choiceText === "🔑 鍵でドアを試す") currentScene = "doorOpen";
          else if (choiceText === "🚪 Ignore the key and try door" || choiceText === "🚪 鍵を無視してドアを試す") currentScene = "doorTry";
          else if (choiceText === "👀 Search for more items" || choiceText === "👀 さらに探す") currentScene = "searchCell";
          break;

        case "searchCell":
          if (choiceText === "🔑 Try the key on the door" || choiceText === "🔑 鍵でドアを試す") currentScene = "doorOpen";
          else if (choiceText === "🚪 Try the door without the key" || choiceText === "🚪 鍵なしでドアを試す") currentScene = "doorTry";
          break;

        case "doorTry":
          if (choiceText === "🔍 Search for a key" || choiceText === "🔍 鍵を探す") currentScene = "cellLook";
          else if (choiceText === "📣 Call for help" || choiceText === "📣 助けを呼ぶ") currentScene = "shout";
          else if (choiceText === "🛏️ Rest and gather strength" || choiceText === "🛏️ 休んで体力回復") currentScene = "rest";
          break;

        case "doorOpen":
          if (choiceText === "🤫 Sneak forward quietly" || choiceText === "🤫 静かに進む") {
            currentScene = "wait"; // for example, you can expand scenes
          } else if (choiceText === "📢 Call out to whoever is there" || choiceText === "📢 声をかける") {
            currentScene = "shout";
          } else if (choiceText === "🔙 Go back inside the cell" || choiceText === "🔙 部屋に戻る") {
            currentScene = "start";
          }
          break;

        case "shout":
          if (choiceText === "🔍 Search for a key" || choiceText === "🔍 鍵を探す") currentScene = "cellLook";
          else if (choiceText === "🛏️ Sit down and wait" || choiceText === "🛏️ 座って待つ") currentScene = "wait";
          break;

        case "rest":
          if (choiceText === "🔍 Look around the cell" || choiceText === "🔍 周囲を調べる") currentScene = "cellLook";
          else if (choiceText === "🚪 Try the door" || choiceText === "🚪 ドアを試す") currentScene = "doorTry";
          break;

        case "wait":
          if (choiceText === "⚔️ Fight the guard" || choiceText === "⚔️ 看守と戦う") currentScene = "fight";
          else if (choiceText === "🗣️ Try to reason" || choiceText === "🗣️ 説得する") currentScene = "reason";
          break;

        case "fight":
          if (choiceText === "Start Fight" || choiceText === "戦闘開始") {
            alert("Combat system not implemented in this snippet");
            currentScene = "gameOver";
          }
          break;

        case "reason":
          if (choiceText === "🔄 Play again" || choiceText === "🔄 もう一度遊ぶ") currentScene = "start";
          break;

        case "gameOver":
          if (choiceText === "🔄 Restart" || choiceText === "🔄 再挑戦") currentScene = "start";
          break;

        default:
          currentScene = "start";
      }

      // Trigger random event once per choice
      let eventText = null;
      for (const event of randomEvents) {
        eventText = event();
        if (eventText) break;
      }
      if (eventText) storyExtra = eventText;
      else storyExtra = "";

      renderScene();
    };

    choicesEl.appendChild(btn);
  });
}

function initGame() {
  player = {
    health: 100,
    strength: 10,
    inventory: []
  };
  currentScene = "start";
  storyExtra = "";
  displayStats();
  displayInventory();
  renderScene();
}

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
    renderScene();
  });
});
