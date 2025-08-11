// battle.js
import { heroes, castleLevel, tilemap } from './gameState.js';
import { renderMap } from './map.js';
import { updateResources } from './ui.js';

export function battle(enemyX, enemyY) {
  const enemyStrength = 15 + Math.floor(Math.random() * 10);
  const heroStrength = heroes * castleLevel;
  if (heroStrength >= enemyStrength) {
    alert("Victory! Enemy base destroyed.");
    tilemap[enemyX][enemyY] = { type: 0, resourceAmount: 0, explored: true };
    renderMap();
  } else {
    alert("Defeat! You lost some heroes.");
    heroes = Math.max(0, heroes - 5);
    updateResources();
  }
}
