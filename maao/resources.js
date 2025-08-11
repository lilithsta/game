// resources.js
import { tilemap, MAP_WIDTH, MAP_HEIGHT, TILE_RESOURCE_WOOD, TILE_RESOURCE_STONE, TILE_RESOURCE_FOOD } from './gameState.js';
import { renderMap } from './map.js';

export function regenerateResources() {
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
}
