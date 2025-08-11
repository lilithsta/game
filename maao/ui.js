// ui.js
import { resources, heroes, castleLevel } from './gameState.js';

const woodEl = document.getElementById("wood");
const stoneEl = document.getElementById("stone");
const foodEl = document.getElementById("food");
const heroesEl = document.getElementById("heroes");
const castleLevelEl = document.getElementById("castleLevel");

export function updateResources() {
  woodEl.textContent = resources.wood;
  stoneEl.textContent = resources.stone;
  foodEl.textContent = resources.food;
  heroesEl.textContent = heroes;
  castleLevelEl.textContent = castleLevel;
}

// Button handlers
export function setupButtons() {
  document.getElementById("trainHeroBtn").onclick = () => {
    if (resources.food >= 10) {
      resources.food -= 10;
      heroes++;
      updateResources();
      alert("Hero trained!");
    } else {
      alert("Not enough food!");
    }
  };

  document.getElementById("upgradeCastleBtn").onclick = () => {
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
}
