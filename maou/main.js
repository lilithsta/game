const MAP_WIDTH = 15;
const MAP_HEIGHT = 15;
const VIEW_RADIUS = 3;

// Tile types
const TILE_EMPTY = 0;
const TILE_CASTLE = 1;
const TILE_ENEMY = 2;
const TILE_RESOURCE_WOOD = 3;
const TILE_RESOURCE_STONE = 4;
const TILE_RESOURCE_FOOD = 5;

// Game state
let tilemap = [];
let playerPos = { x: Math.floor(MAP_WIDTH / 2), y: Math.floor(MAP_HEIGHT / 2) };

let resources = { wood: 100, stone: 100, food: 100 };
let heroes = 10;
let castleLevel = 1;

// DOM elements
const mapEl = document.getElementById("map");
const woodEl = document.getElementById("wood");
const stoneEl = document.getElementById("stone");
const foodEl = document.getElementById("food");
const heroesEl = document.getElementById("heroes");
const castleLevelEl = document.getElementById("castleLevel");

const trainHeroBtn = document.getElementById("trainHeroBtn");
const upgradeCastleBtn = document.getElementById("upgradeCastleBtn");
const moveUpBtn = document.getElementById("moveUpBtn");
const moveDownBtn = document.getElementById("moveDownBtn");
const moveLeftBtn = document.getElementById("moveLeftBtn");
const moveRightBtn = document.getElementById("moveRightBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");

// Initialize empty tilemap with objects {type, resourceAmount, explored}
function initTilemap() {
  tilemap = [];
  for (let x = 0; x < MAP_WIDTH; x++) {
    tilemap[x] = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      tilemap[x][y] = { type: TILE_EMPTY, resourceAmount: 0, explored: false };
    }
  }
  // Place castle
  tilemap[playerPos.x][playerPos.y] = { type: TILE_CASTLE, resourceAmount: 0, explored: true };

  // Place resources and enemies
  randomPlace(TILE_RESOURCE_WOOD, 10);
  randomPlace(TILE_RESOURCE_STONE, 8);
  randomPlace(TILE_RESOURCE_FOOD, 6);
  randomPlace(TILE_ENEMY, 5);
}

// Randomly place tiles of a type on the map
function randomPlace(type, count, minAmount = 20, maxAmount = 50) {
  let placed = 0;
  while (placed < count) {
    let x = Math.floor(Math.random() * MAP_WIDTH);
    let y = Math.floor(Math.random() * MAP_HEIGHT);
    if (
      tilemap[x][y].type === TILE_EMPTY &&
      !(x === playerPos.x && y === playerPos.y)
    ) {
      tilemap[x][y].type = type;
      tilemap[x][y].resourceAmount = (type === TILE_RESOURCE_WOOD || type === TILE_RESOURCE_STONE || type === TILE_RESOURCE_FOOD)
        ? Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
        : 0;
      tilemap[x][y].explored = false;
      placed++;
    }
  }
}

// Render map with visibility and fog of war
function renderMap() {
  mapEl.innerHTML = "";
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = tilemap[x][y];
      const dist = Math.abs(playerPos.x - x) + Math.abs(playerPos.y - y);
      const div = document.createElement("div");
      div.className = "tile"; // Reset classes

      if (dist <= VIEW_RADIUS) {
        tile.explored = true;
        applyTileStyle(div, tile);
        div.onclick = () => onTileClick(x, y);
      } else {
        if (tile.explored) {
          applyTileStyle(div, tile);
          div.classList.add("fog");
        } else {
          div.classList.add("fog");
        }
        div.onclick = null;
      }

      if (x === playerPos.x && y === playerPos.y) {
        div.textContent = "🧙‍♂️";
        div.style.fontSize = "24px";
      }

      mapEl.appendChild(div);
    }
  }
}

function applyTileStyle(div, tile) {
  switch (tile.type) {
    case TILE_EMPTY:
      div.textContent = "";
      break;
    case TILE_CASTLE:
      div.textContent = "🏰";
      div.classList.add("castle");
      break;
    case TILE_ENEMY:
      div.textContent = "👹";
      div.classList.add("enemy");
      break;
    case TILE_RESOURCE_WOOD:
      if (tile.resourceAmount > 0) {
        div.textContent = "🪵";
        div.classList.add("resource-wood");
      } else {
        div.textContent = "";
      }
      break;
    case TILE_RESOURCE_STONE:
      if (tile.resourceAmount > 0) {
        div.textContent = "🪨";
        div.classList.add("resource-stone");
      } else {
        div.textContent = "";
      }
      break;
    case TILE_RESOURCE_FOOD:
      if (tile.resourceAmount > 0) {
        div.textContent = "🍖";
        div.classList.add("resource-food");
      } else {
        div.textContent = "";
      }
      break;
  }
}

// Handle tile click (resource collection or battle)
function onTileClick(x, y) {
  const tile = tilemap[x][y];
  const dist = Math.abs(playerPos.x - x) + Math.abs(playerPos.y - y);
  if (dist > VIEW_RADIUS) {
    alert("Tile out of view range.");
    return;
  }
  if (x === playerPos.x && y === playerPos.y) {
    alert("This is your position.");
    return;
  }
  switch (tile.type) {
    case TILE_RESOURCE_WOOD:
    case TILE_RESOURCE_STONE:
    case TILE_RESOURCE_FOOD:
      if (tile.resourceAmount > 0) {
        const collected = Math.min(20, tile.resourceAmount);
        tile.resourceAmount -= collected;
        if (tile.type === TILE_RESOURCE_WOOD) resources.wood += collected;
        if (tile.type === TILE_RESOURCE_STONE) resources.stone += collected;
        if (tile.type === TILE_RESOURCE_FOOD) resources.food += collected;
        alert(`Collected ${collected} resources!`);
        updateResources();
        renderMap();
      } else {
        alert("No resources left here.");
      }
      break;
    case TILE_ENEMY:
      alert("Enemy base! Starting battle...");
      battle(x, y);
      break;
    default:
      alert("Nothing to do here.");
  }
}

// Battle logic (simple)
function battle(enemyX, enemyY) {
  const enemyStrength = 15 + Math.floor(Math.random() * 10);
  const heroStrength = heroes * castleLevel;
  if (heroStrength >= enemyStrength) {
    alert("Victory! Enemy base destroyed.");
    tilemap[enemyX][enemyY] = { type: TILE_EMPTY, resourceAmount: 0, explored: true };
    renderMap();
  } else {
    alert("Defeat! You lost some heroes.");
    heroes = Math.max(0, heroes - 5);
    updateResources();
  }
}

// Update resource display
function updateResources() {
  woodEl.textContent = resources.wood;
  stoneEl.textContent = resources.stone;
  foodEl.textContent = resources.food;
  heroesEl.textContent = heroes;
  castleLevelEl.textContent = castleLevel;
}

// Train hero button
trainHeroBtn.onclick = () => {
  if (resources.food >= 10) {
    resources.food -= 10;
    heroes++;
    updateResources();
    alert("Hero trained!");
  } else {
    alert("Not enough food!");
  }
};

// Upgrade castle button
upgradeCastleBtn.onclick = () => {
  if (resources.wood >= 50 && resources.stone >= 30) {
    resources.wood -= 50;
    resources.stone -= 30;
    castleLevel++;
    alert("Castle upgraded!");
    updateResources();
  } else {
    alert("Not enough resources!");
  }
};

// Movement buttons
function tryMove(dx, dy) {
  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;
  if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
    alert("Can't move outside the map!");
    return;
  }
  playerPos.x = newX;
  playerPos.y = newY;
  renderMap();
}
moveUpBtn.onclick = () => tryMove(0, -1);
moveDownBtn.onclick = () => tryMove(0, 1);
moveLeftBtn.onclick = () => tryMove(-1, 0);
moveRightBtn.onclick = () => tryMove(1, 0);

// Auto resource regen every 30 seconds
setInterval(() => {
  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      let tile = tilemap[x][y];
      if (
        tile.type === TILE_RESOURCE_WOOD ||
        tile.type === TILE_RESOURCE_STONE ||
        tile.type === TILE_RESOURCE_FOOD
      ) {
        tile.resourceAmount = Math.min(tile.resourceAmount + 10, 100);
      }
    }
  }
  renderMap();
}, 30000);

// Save / Load game using localStorage
saveBtn.onclick = () => {
  const gameState = {
    tilemap,
    playerPos,
    resources,
    heroes,
    castleLevel,
  };
  localStorage.setItem("trojaGameSave", JSON.stringify(gameState));
  alert("Game saved!");
};

loadBtn.onclick = () => {
  const saved = localStorage.getItem("trojaGameSave");
  if (saved) {
    const gameState = JSON.parse(saved);
    tilemap = gameState.tilemap;
    playerPos = gameState.playerPos;
    resources = gameState.resources;
    heroes = gameState.heroes;
    castleLevel = gameState.castleLevel;
    renderMap();
    updateResources();
    alert("Game loaded!");
  } else {
    alert("No saved game found.");
  }
};

resetBtn.onclick = () => {
  if (confirm("Reset game? Your progress will be lost.")) {
    playerPos = { x: Math.floor(MAP_WIDTH / 2), y: Math.floor(MAP_HEIGHT / 2) };
    resources = { wood: 100, stone: 100, food: 100 };
    heroes = 10;
    castleLevel = 1;
    initTilemap();
    renderMap();
    updateResources();
  }
};

// Initialize game on load
window.onload = () => {
  initTilemap();
  renderMap();
  updateResources();
};
