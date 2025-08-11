// saveLoad.js
import { tilemap, playerPos, resources, heroes, castleLevel } from './gameState.js';
import { renderMap } from './map.js';
import { updateResources } from './ui.js';

export function setupSaveLoad(resetCallback) {
  document.getElementById("saveBtn").onclick = () => {
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

  document.getElementById("loadBtn").onclick = () => {
    const saved = localStorage.getItem("trojaGameSave");
    if (saved) {
      const gameState = JSON.parse(saved);
      Object.assign(tilemap, gameState.tilemap);
      Object.assign(playerPos, gameState.playerPos);
      Object.assign(resources, gameState.resources);
      heroes = gameState.heroes;
      castleLevel = gameState.castleLevel;
      renderMap();
      updateResources();
      alert("Game loaded!");
    } else {
      alert("No saved game found.");
    }
  };

  document.getElementById("resetBtn").onclick = () => {
    if (confirm("Reset game? Your progress will be lost.")) {
      resetCallback();
    }
  };
}

