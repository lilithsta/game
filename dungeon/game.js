let currentLang = "en";
let langData = {};
let player = { hp: 20, attack: 5, defense: 2, inventory: [] };
let currentScene = 0;

async function loadLanguage(lang) {
    try {
        const response = await fetch("lang.json");
        langData = await response.json();
        currentLang = lang;
    } catch (e) {
        console.error("Language load error:", e);
    }
}

function t(key) {
    return langData[currentLang] && langData[currentLang][key] ? langData[currentLang][key] : key;
}

function updateStats() {
    const statsElem = document.getElementById("playerStats");
    if (statsElem) {
        statsElem.textContent =
            `${t("hp")}: ${player.hp} | ${t("attack")}: ${player.attack} | ${t("defense")}: ${player.defense}`;
    }
}

function renderScene() {
    const sceneTextElem = document.getElementById("sceneText");
    const choicesElem = document.getElementById("choices");

    if (!sceneTextElem || !choicesElem) {
        console.error("Game UI elements missing.");
        return;
    }

    let sceneText = `${t("scene")}: ${currentScene + 1} — ${t("youAreInDungeon")}`;
    sceneTextElem.textContent = sceneText;
    choicesElem.innerHTML = "";

    // Random events
    const events = [
        { text: t("findPotion"), action: () => { player.hp += 5; updateStats(); } },
        { text: t("findSword"), action: () => { player.attack += 2; updateStats(); } },
        { text: t("findShield"), action: () => { player.defense += 1; updateStats(); } },
        { text: t("monsterAppears"), action: () => { startCombat(player, { hp: 8, attack: 3, defense: 1 }); } }
    ];

    const selectedEvents = [];
    for (let i = 0; i < 3; i++) {
        selectedEvents.push(events[Math.floor(Math.random() * events.length)]);
    }

    selectedEvents.forEach(event => {
        const btn = document.createElement("button");
        btn.textContent = event.text;
        btn.addEventListener("click", () => {
            event.action();
            nextScene();
        });
        choicesElem.appendChild(btn);
    });
}

function nextScene() {
    currentScene++;
    if (player.hp <= 0) {
        gameOver();
    } else {
        renderScene();
    }
}

function gameOver() {
    const sceneTextElem = document.getElementById("sceneText");
    const choicesElem = document.getElementById("choices");
    const retryBtn = document.getElementById("retryBtn");

    if (sceneTextElem) sceneTextElem.textContent = t("gameOver");
    if (choicesElem) choicesElem.innerHTML = "";
    if (retryBtn) retryBtn.style.display = "inline-block";
}

function initGame() {
    player = { hp: 20, attack: 5, defense: 2, inventory: [] };
    currentScene = 0;
    updateStats();
    renderScene();
}

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startGameBtn");
    const retryBtn = document.getElementById("retryBtn");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const gameContainer = document.getElementById("gameContainer");
    const languageSelect = document.getElementById("languageSelect");

    if (startBtn) {
        startBtn.addEventListener("click", async () => {
            await loadLanguage(languageSelect.value);
            welcomeScreen.style.display = "none";
            gameContainer.style.display = "block";
            initGame();
        });
    }

    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            retryBtn.style.display = "none";
            initGame();
        });
    }

    if (languageSelect) {
        languageSelect.addEventListener("change", async () => {
            await loadLanguage(languageSelect.value);
            updateStats();
            renderScene();
        });
    }
});
