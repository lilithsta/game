let currentLang = "en";
let langData = {};
let player = { hp: 20, attack: 5, defense: 2, inventory: [] };
let currentScene = 0;
let inCombat = false;

// Load language data from JSON
async function loadLanguage(lang) {
    try {
        const response = await fetch("lang.json");
        langData = await response.json();
        currentLang = lang;
    } catch (e) {
        console.error("Language load error:", e);
    }
}

// Translate helper
function t(key) {
    return langData[currentLang] && langData[currentLang][key] ? langData[currentLang][key] : key;
}

// Update player stats display
function displayStats() {
    const statsElem = document.getElementById("playerStats");
    if (statsElem) {
        statsElem.textContent =
            `${t("hp")}: ${player.hp} | ${t("attack")}: ${player.attack} | ${t("defense")}: ${player.defense}`;
    }

    // Update inventory display
    const invElem = document.getElementById("playerInventory");
    if (invElem) {
        if (player.inventory.length === 0) {
            invElem.textContent = "🎒 " + t("inventoryEmpty");
        } else {
            invElem.textContent = "🎒 " + t("inventory") + ": " + player.inventory.join(", ");
        }
    }
}

// Render the current scene and choices
function renderScene() {
    if (inCombat) {
        // Combat is handled separately
        if (window.renderCombatScene) {
            window.renderCombatScene();
        }
        return;
    }

    const sceneTextElem = document.getElementById("sceneText");
    const choicesElem = document.getElementById("choices");

    if (!sceneTextElem || !choicesElem) {
        console.error("Game UI elements missing.");
        return;
    }

    let sceneText = `${t("scene")}: ${currentScene + 1} — ${t("youAreInDungeon")}`;
    sceneTextElem.textContent = sceneText;
    choicesElem.innerHTML = "";

    // Define possible random events
    const events = [
        { text: t("findPotion"), action: () => { player.hp = Math.min(player.hp + 5, 100); updateStatsAndInventory(); } },
        { text: t("findSword"), action: () => { player.attack += 2; player.inventory.push("Sword"); updateStatsAndInventory(); } },
        { text: t("findShield"), action: () => { player.defense += 1; player.inventory.push("Shield"); updateStatsAndInventory(); } },
        { text: t("monsterAppears"), action: () => { 
            if (window.startCombat) {
                inCombat = true;
                window.startCombat(player, { hp: 8, attack: 3, defense: 1 }); 
            } else {
                alert("Combat system not loaded.");
            }
        } }
    ];

    // Randomly pick 3 unique events to present as choices
    let selectedEvents = [];
    while (selectedEvents.length < 3) {
        const candidate = events[Math.floor(Math.random() * events.length)];
        if (!selectedEvents.includes(candidate)) selectedEvents.push(candidate);
    }

    // Create buttons for choices
    selectedEvents.forEach(event => {
        const btn = document.createElement("button");
        btn.textContent = event.text;
        btn.onclick = () => {
            event.action();
            if (!inCombat) {
                nextScene();
            }
        };
        choicesElem.appendChild(btn);
    });
}

function updateStatsAndInventory() {
    displayStats();
}

// Advance to the next scene
function nextScene() {
    currentScene++;
    if (player.hp <= 0) {
        gameOver();
    } else {
        renderScene();
    }
}

// Show game over and display retry button
function gameOver() {
    inCombat = false;
    const sceneTextElem = document.getElementById("sceneText");
    const choicesElem = document.getElementById("choices");
    const retryBtn = document.getElementById("retryBtn");

    if (sceneTextElem) sceneTextElem.textContent = t("gameOver");
    if (choicesElem) choicesElem.innerHTML = "";
    if (retryBtn) retryBtn.style.display = "inline-block";
}

// Initialize game state
function initGame() {
    player = { hp: 20, attack: 5, defense: 2, inventory: [] };
    currentScene = 0;
    inCombat = false;
    updateStatsAndInventory();
    renderScene();
}

// Expose needed functions globally for combat.js
window.displayStats = displayStats;
window.renderScene = renderScene;

// Setup event listeners after DOM loads
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
            displayStats();
            renderScene();
        });
    }
});
