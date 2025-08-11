// player.js
import { playerPos, tilemap, resources, heroes, castleLevel, TILE_EMPTY, TILE_RESOURCE_WOOD, TILE_RESOURCE_STONE, TILE_RESOURCE_FOOD, TILE_ENEMY, VIEW_RADIUS } from './gameState.js';
import { renderMap } from './map.js';
import { updateResources } from './ui.js';
import { battle } from './battle.js';

export function onTileClick(x, y) {
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
  if (
    dist === 1 &&
    (tile.type === TILE_EMPTY ||
      tile.type === TILE_RESOURCE_WOOD ||
      tile.type === TILE_RESOURCE_STONE ||
      tile.type === TILE_RESOURCE_FOOD)
  ) {
    playerMoveTo(x, y);
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

export function playerMoveTo(x, y) {
  playerPos.x = x;
  playerPos.y = y;
  renderMap();
}
