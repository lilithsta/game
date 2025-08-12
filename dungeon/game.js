let player = {};
let inventory = [];
let events = [];
let currentLang = "en";
let langData = {};
let currentEventIndex = 0;

// Load language file
async function loadLanguage(lang) {
    try {
        const res = await fetch("lang.json");
        const data = await res.json();
        langData = data[lang];
    } catch (err) {
        console.error("Error loading language file:", err);
    }
}

// Initialize the game
function initGame() {
    player = {
        name: "Hero",
        hp: 100,
        attack: 10,
        defense: 5,
        gold: 0
    };
    inventory = [];
    events = generateEvents();
    currentEventIndex = 0;

    updateStats();
    showEvent();
}

// Generate events (basic example, can expand)
function generateEvents() {
    return [
        { text: langData.event_intro, choices: [
            { text: langData.choice_forward, action: () => nextEvent() },
            { text: langData.choice_search, action: () => findItem() },
            { text: langData.choice_rest, action: () => rest() }
        ]},
        { text: langData.event_enemy, choices: [
            { text: langData.choice_fight, action: () => startCombat() },
            { text: langData.choice_run, action: () => nextEvent() }
        ]},
        { text: langData.event_treasure, choices: [
            { text: langData.choice_take, action: () => takeTreasure() },
            { text: langData.choice_leave, action: () => nextEvent() }
        ]}
    ];
}

// Show current event
function showEvent() {
    const eventText = document.getElementById("eventText");
    const choicesDiv = document.getElementById("choices");
    const event = events[currentEventIndex];

    eventText.textContent = event.text;
    choicesDiv.innerHTML = "";

    event.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.onclick = choice.action;
        choicesDiv.appendChild(btn);
    });
}

// Move to next event
function nextEvent() {
    currentEventIndex++;
    if (currentEventIndex >= events.length) {
        endGame(true);
    } else {
        showEvent();
    }
}

// Find item
function findItem() {
    const items = [langData.item_potion, langData.item_sword, langData.item_shield];
    const found = items[Math.floor(Math.random() * items.length)];
    inventory.push(found);
    updateInventory();
    nextEvent();
}

// Rest
function rest() {
    player.hp = Math.min(player.hp + 10, 100);
    updateStats();
    nextEvent();
}

// Take treasure
function takeTreasure() {
    player.gold += Math.floor(Math.random() * 50) + 10;
    updateStats();
    nextEvent();
}

// Start combat
function startCombat() {
    const enemy = { name: langData.enemy_goblin, hp: 30, attack: 8, defense: 3 };
    startBattle(player, enemy, (win) => {
        if (win) {
            player.gold += 20;
            updateStats();
            nextEvent();
        } else {
            endGame(false);
        }
    });
}

// Update stats display
function updateStats() {
    document.getElementById("stats").textContent =
        `${langData.stat_hp}: ${player.hp} | ${langData.stat_attack}: ${player.attack} | ${langData.stat_defense}: ${player.defense} | ${langData.stat_gold}: ${player.gold}`;
}

// Update inventory display
function updateInventory() {
    document.getElementById("inventory").textContent = `${langData.inventory}: ${inventory.join(", ")}`;
}

// End game
function endGame(win) {
    const eventText = document.getElementById("eventText");
    const choicesDiv = document.getElementById("choices");

    if (win) {
        eventText.textContent = langData.game_win;
    } else {
        eventText.textContent = langData.game_over;
    }
    choicesDiv.innerHTML = "";
    document.getElementById("retryBtn").style.display = "inline-block";
}

// Event listeners for welcome page
document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startGameBtn");
    const retryBtn = document.getElementById("retryBtn");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const gameContainer = document.getElementById("gameContainer");
    const languageSelect = document.getElementById("languageSelect");

    // Handle Start Game
    startBtn.addEventListener("click", () => {
        currentLang = languageSelect.value;
        loadLanguage(currentLang).then(() => {
            welcomeScreen.style.display = "none";
            gameContainer.style.display = "block";
            initGame();
        });
    });

    // Handle Retry
    retryBtn.addEventListener("click", () => {
        retryBtn.style.display = "none";
        initGame();
    });

    // Handle Language Change
    languageSelect.addEventListener("change", () => {
        currentLang = languageSelect.value;
    });
});
