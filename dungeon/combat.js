// Flag to know if currently in combat
let inCombat = false;

let combatPlayer;
let combatEnemy;

function startCombat(player, enemy) {
  inCombat = true;
  combatPlayer = { ...player }; // shallow copy to keep combat separate
  combatEnemy = { ...enemy };

  renderCombatScene();
}

function renderCombatScene() {
  const storyEl = document.getElementById("sceneText");
  const choicesEl = document.getElementById("choices");

  if (!storyEl || !choicesEl) {
    console.error("Combat UI elements missing.");
    return;
  }

  // Show combat status
  storyEl.textContent =
    `⚔️ Combat! You: HP ${combatPlayer.hp}, ATK ${combatPlayer.attack}, DEF ${combatPlayer.defense}\n` +
    `Enemy: HP ${combatEnemy.hp}, ATK ${combatEnemy.attack}, DEF ${combatEnemy.defense}`;

  choicesEl.innerHTML = "";

  // Attack button
  const attackBtn = document.createElement("button");
  attackBtn.textContent = "🗡️ Attack";
  attackBtn.onclick = () => {
    // Player attacks enemy
    const damageToEnemy = Math.max(0, combatPlayer.attack - combatEnemy.defense);
    combatEnemy.hp -= damageToEnemy;

    // Enemy alive? Enemy attacks back
    let damageToPlayer = 0;
    if (combatEnemy.hp > 0) {
      damageToPlayer = Math.max(0, combatEnemy.attack - combatPlayer.defense);
      combatPlayer.hp -= damageToPlayer;
    }

    // Update main player stats if player survived
    if (combatPlayer.hp > 0) {
      // Update the real player object (assuming combatPlayer is a copy)
      window.player.hp = combatPlayer.hp;
      window.player.attack = combatPlayer.attack;
      window.player.defense = combatPlayer.defense;
    }

    // Show combat log message
    storyEl.textContent =
      `🗡️ You dealt ${damageToEnemy} damage.\n` +
      (combatEnemy.hp > 0
        ? `💥 Enemy dealt ${damageToPlayer} damage back.\nEnemy HP left: ${combatEnemy.hp}`
        : "💀 Enemy defeated!");

    window.displayStats();

    // Check end of combat
    if (combatPlayer.hp <= 0) {
      inCombat = false;
      storyEl.textContent += `\n☠️ You died in combat. Game over.`;
      choicesEl.innerHTML = "";
      const retryBtn = document.getElementById("retryBtn");
      if (retryBtn) retryBtn.style.display = "inline-block";
      return;
    }

    if (combatEnemy.hp <= 0) {
      inCombat = false;
      // Continue normal gameplay after combat ends
      choicesEl.innerHTML = "";
      const continueBtn = document.createElement("button");
      continueBtn.textContent = "➡️ Continue";
      continueBtn.onclick = () => {
        // After combat ends, re-render normal scene
        window.renderScene();
      };
      choicesEl.appendChild(continueBtn);
      return;
    }

    // Still fighting, update UI for next player action
    renderCombatScene();
  };
  choicesEl.appendChild(attackBtn);

  // Optionally add a "Run" button
  const runBtn = document.createElement("button");
  runBtn.textContent = "🏃‍♂️ Run";
  runBtn.onclick = () => {
    inCombat = false;
    storyEl.textContent = "🏃‍♂️ You fled from the combat!";
    choicesEl.innerHTML = "";
    const continueBtn = document.createElement("button");
    continueBtn.textContent = "➡️ Continue";
    continueBtn.onclick = () => {
      window.renderScene();
    };
    choicesEl.appendChild(continueBtn);
  };
  choicesEl.appendChild(runBtn);
}
