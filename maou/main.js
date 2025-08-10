// main.js
import { initTilemap, renderMap } from './map.js';
import { updateResources, setupButtons } from './ui.js';
import { setupSaveLoad } from './saveLoad.js';
import { regenerateResources } from './resources.js';

function resetGame() {
  import('./gameState.js').then(({ playerPos, resources, heroes, castleLevel }) => {
    playerPos.x = 7;
    playerPos.y = 7;
    resources.wood = 100;
    resources.stone = 100;
    resources.food = 100;
    heroes = 10;
    castleLevel = 1;
    initTilemap();
    renderMap();
    updateResources();
  });
}

window.onload = () => {
  initTilemap();
  renderMap();
  updateResources();
  setupButtons();
  setupSaveLoad(resetGame);

  // Auto resource regen every 30 seconds
  setInterval(() => {
    regenerateResources();
  }, 30000);
};
