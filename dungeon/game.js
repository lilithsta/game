let langData = {};
let currentLang = "en";

async function loadLanguage(lang = "en") {
  const res = await fetch("lang.json");
  langData = await res.json();
  currentLang = lang;
  renderScene();
}

const player = {
  health: 100,
  strength: 10,
  inventory: []
};

function displayStats() {
  const statsDiv = document.getElementById("stats");
  statsDiv.textContent = `${langData[currentLang].stats.health}: ${player.health} | ${langData[currentLang].stats.strength}: ${player.strength}`;
}

function displayInventory() {
  const invDiv = document.getElementById("inventory");
  if (player.inventory.length === 0) {
    invDiv.textContent = langData[currentLang].stats.inventory_empty;
  } else {
    invDiv.textContent = `${langData[currentLang].stats.inventory}: ${player.inventory.join(", ")}`;
  }
}

let currentScene = "start";
let storyExtra = "";

const storyEl = document.getElementById("story");
const choicesEl = document.getElementById("choices");

const scenesLogic = {
  start: { choices: ["cellLook", "doorTry", "shout", "rest"] },
  cellLook: {
    onEnter: () => {
      if (!player.inventory.includes("Rusty Key")) {
        player.inventory.push("Rusty Key");
        storyExtra = langData[currentLang].scenes.cellLook.text_found;
      } else {
        storyExtra = langData[currentLang].scenes.cellLook.text_seen;
      }
    },
    choices: ["doorOpen", "doorTry", "searchCell"]
  },
  searchCell: { choices: ["doorOpen", "doorTry"] },
  doorTry: { choices: ["cellLook", "shout", "rest"] },
  doorOpen: { choices: ["sneak", "callOut", "start"] },
  shout: { choices: ["cellLook", "wait"] },
  rest: {
    onEnter: () => {
      const healed = Math.min(20, 100 - player.health);
      player.health += healed;
      storyExtra = langData[currentLang].scenes.rest.heal
        .replace("{healed}", healed)
        .replace("{health}", player.health);
    },
    choices: ["cellLook", "doorTry"]
  },
  wait: { choices: ["fight", "reason"] },
  fight: {
    choices: [() => { startCombat("guard"); return currentScene; }]
  },
  reason: { choices: ["start"] },
  gameOver: { choices: ["start"] }
};

const randomEvents = [
  () => {
    if (player.health < 100 && Math.random() < 0.2) {
      player.health = Math.min(100, player.health + 20);
      return langData[currentLang].events.herb;
    }
    return null;
  },
  () => {
    if (Math.random() < 0.15) {
      player.inventory.push("Gold Coin");
      return langData[currentLang].events.coin;
    }
    return null;
  },
  () => {
    if (player.health > 30 && Math.random() < 0.1) {
      player.health -= 15;
      return langData[currentLang].events.trap;
    }
    return null;
  }
];

function renderScene() {
  if (!langData[currentLang]) return;

  if (inCombat) {
    renderCombatScene();
    return;
  }

  storyExtra = "";
  const sceneText = langData[currentLang].scenes[currentScene];
  const sceneLogic = scenesLogic[currentScene];

  if (sceneLogic?.onEnter) sceneLogic.onEnter();

  storyEl.textContent = (sceneText.text || "") + (storyExtra ? "\n" + storyExtra : "");

  displayStats();
  displayInventory();

  choicesEl.innerHTML = "";
  const choices = sceneText.choices;
  choices.forEach((choiceText, idx) => {
    const btn = document.createElement("button");
    btn.textContent = choiceText;
    btn.onclick = () => {
      const nextLogic = sceneLogic?.choices[idx];
      if (typeof nextLogic === "function") {
        currentScene = nextLogic();
      } else {
        currentScene = nextLogic;
      }
      let eventText = null;
      for (const event of randomEvents) {
        eventText = event();
        if (eventText) break;
      }
      if (eventText) storyExtra = eventText;
      renderScene();
    };
    choicesEl.appendChild(btn);
  });
}

// Start game in default language
loadLanguage("en");
