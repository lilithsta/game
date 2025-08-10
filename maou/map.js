// map.js
import { MAP_WIDTH, MAP_HEIGHT, TILE_EMPTY, TILE_CASTLE, TILE_ENEMY,
         TILE_RESOURCE_WOOD, TILE_RESOURCE_STONE, TILE_RESOURCE_FOOD,
         playerPos, tilemap, VIEW_RADIUS } from './gameState.js';
import { onTileClick } from './player.js';

const mapEl = document.getElementById("map");

// Initialize empty tilemap
export function initTilemap() {
  for (let x = 0; x < MAP_WIDTH; x++) {
    tilemap[x] = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      tilemap[x][y] = { type: TILE_EMPTY, resourceAmount: 0, explored: false };
    }
  }
  // Place castle
  tilemap[playerPos.x][playerPos.y] = { type: TILE_CASTLE, resourceAmount: 0, explored: true };

  randomPlace(TILE_RESOURCE_WOOD, 10);
  randomPlace(TILE_RESOURCE_STONE, 8);
  randomPlace(TILE_RESOURCE_FOOD, 6);
  randomPlace(TILE_ENEMY, 5);
}

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

export function renderMap() {
  mapEl.innerHTML = "";
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = tilemap[x][y];
      const dist = Math.abs(playerPos.x - x) + Math.abs(playerPos.y - y);
      const div = document.createElement("div");
      div.className = "tile";

      if (dist <= VIEW_RADIUS) {
        tile.explored = true;
        applyTileStyle(div, tile);

        if (x === playerPos.x && y === playerPos.y) {
          div.textContent = "🧙‍♂️";
          div.style.fontSize = "24px";
          div.style.cursor = "default";
          div.onclick = null;
        } else if (
          dist === 1 &&
          (tile.type === TILE_EMPTY ||
            tile.type === TILE_RESOURCE_WOOD ||
            tile.type === TILE_RESOURCE_STONE ||
            tile.type === TILE_RESOURCE_FOOD)
        ) {
          div.style.cursor = "pointer";
          div.title = "Click to move here";
          div.onclick = () => {
            playerMoveTo(x, y);
          };
        } else {
          div.style.cursor = "pointer";
          div.onclick = () => onTileClick(x, y);
        }
      } else {
        if (tile.explored) {
          applyTileStyle(div, tile);
          div.classList.add("fog");
        } else {
          div.classList.add("fog");
        }
        div.onclick = null;
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

// Delegate player movement (imported from player.js)
import { playerMoveTo } from './player.js';
