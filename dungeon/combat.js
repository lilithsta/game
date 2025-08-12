// Enemies data
const enemies = {
  guard: {
    name: "Dungeon Guard 🛡️",
    health: 50,
    attackMin: 5,
    attackMax: 12,
  }
};

// Combat state variables
let inCombat = false;
let currentEnemy = null;
let combatTurn = 'player'; // 'player' or 'enemy'
let defendedLastTurn = false;

function startCombat(enemyKey) {
  inCombat = true;
  currentEnemy = { ...enemies[enemyKey] }; // clone enemy stats
  combatTurn = 'player';
  defendedLastTurn = false;
  storyExtra = '';
  renderCombatScene(`⚔️ You encounter ${currentEnemy.name}! Prepare to fight!`);
}

function renderCombatScene(extraText = '') {
  displayStats();
  displayInventory();

  const storyText = `🗡️ Combat with ${currentEnemy.name}\n\n` +
                    `Your Health: ${player.health}\n` +
                    `${currentEnemy.name} Health: ${currentEnemy.health}\n\n` +
                    extraText;

  storyEl.textContent = storyText;

  choicesEl.innerHTML = '';

  if (!inCombat) return;

  if (combatTurn === 'player') {
    // Player's turn: Attack, Defend, Run
    const attackBtn = document.createElement('button');
    attackBtn.textContent = "🗡️ Attack";
    attackBtn.onclick = () => playerAttack();

    const defendBtn = document.createElement('button');
    defendBtn.textContent = "🛡️ Defend";
    defendBtn.onclick = () => playerDefend();

    const runBtn = document.createElement('button');
    runBtn.textContent = "🏃‍♂️ Run";
    runBtn.onclick = () => playerRun();

    choicesEl.appendChild(attackBtn);
    choicesEl.appendChild(defendBtn);
    choicesEl.appendChild(runBtn);
  } else {
    // Enemy turn auto-resolve with delay
    choicesEl.textContent = "⌛ Enemy is attacking...";
    setTimeout(enemyAttack, 1500);
  }
}

function playerAttack() {
  let damage = Math.floor(player.strength * (0.6 + Math.random() * 0.8)); // 60%-140%
  currentEnemy.health -= damage;

  storyExtra = `You attack and deal ${damage} damage!`;

  if (currentEnemy.health <= 0) {
    inCombat = false;
    storyExtra += `\n🎉 You defeated ${currentEnemy.name}!`;
    player.inventory.push("Gold Coin");
    storyExtra += "\n💰 You found a Gold Coin!";
    currentScene = "corridor"; // Back to corridor or any safe place
    renderScene();
    return;
  }

  combatTurn = 'enemy';
  defendedLastTurn = false;
  renderCombatScene(storyExtra);
}

function playerDefend() {
  storyExtra = "You brace yourself to reduce incoming damage next turn.";
  defendedLastTurn = true;
  combatTurn = 'enemy';
  renderCombatScene(storyExtra);
}

function playerRun() {
  if (Math.random() < 0.5) {
    inCombat = false;
    storyExtra = "You successfully escaped!";
    currentScene = "corridor"; // Safe fallback
    renderScene();
  } else {
    storyExtra = "Failed to escape!";
    combatTurn = 'enemy';
    renderCombatScene(storyExtra);
  }
}

function enemyAttack() {
  if (!inCombat) return;

  let enemyAttackPower = Math.floor(currentEnemy.attackMin + Math.random() * (currentEnemy.attackMax - currentEnemy.attackMin));

  let damage = enemyAttackPower;
  if (defendedLastTurn) {
    damage = Math.floor(damage / 2);
  }

  player.health -= damage;

  storyExtra = `${currentEnemy.name} attacks and deals ${damage} damage!`;

  if (player.health <= 0) {
    inCombat = false;
    storyExtra += "\n💀 You died in combat...";
    currentScene = "gameOver";
    renderScene();
    return;
  }

  combatTurn = 'player';
  defendedLastTurn = false;
  renderCombatScene(storyExtra);
}
