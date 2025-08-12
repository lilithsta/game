// Player state
const player = {
  health: 100,
  strength: 10,
  inventory: [],
};

// Display stats
function displayStats() {
  const statsDiv = document.getElementById('stats');
  statsDiv.textContent = `❤️ Health: ${player.health} | 💪 Strength: ${player.strength}`;
}

// Display inventory
function displayInventory() {
  const invDiv = document.getElementById('inventory');
  if (player.inventory.length === 0) {
    invDiv.textContent = "🎒 Inventory: (empty)";
  } else {
    invDiv.textContent = "🎒 Inventory: " + player.inventory.join(", ");
  }
}

// Scenes with more selections and emojis
const scenes = {
  start: {
    text: `🛌 You wake up in a dark dungeon cell. The air is damp and cold.\nWhat will you do?`,
    choices: [
      { text: "🔍 Look around the cell", next: "cellLook" },
      { text: "🚪 Try to open the door", next: "doorTry" },
      { text: "📣 Shout for help", next: "shout" },
      { text: "🛏️ Rest for a moment", next: "rest" }
    ]
  },
  cellLook: {
    text: `👀 You look around and find a rusty key on the floor.`,
    onEnter: () => {
      if (!player.inventory.includes('Rusty Key')) {
        player.inventory.push('Rusty Key');
        storyExtra = "\n🗝️ You picked up a Rusty Key!";
      } else {
        storyExtra = "\n🗝️ You see the place where you found the Rusty Key.";
      }
    },
    choices: [
      { text: "🔑 Try the key on the door", next: "doorOpen" },
      { text: "🚪 Ignore the key and try door", next: "doorTry" },
      { text: "👀 Search for more items", next: "searchCell" }
    ]
  },
  searchCell: {
    text: `🕸️ You find nothing else but cobwebs.`,
    choices: [
      { text: "🔑 Try the key on the door", next: "doorOpen" },
      { text: "🚪 Try the door without the key", next: "doorTry" }
    ]
  },
  doorTry: {
    text: `🔒 The door is locked tight.\nYou need a key to open it.`,
    choices: [
      { text: "🔍 Search for a key", next: "cellLook" },
      { text: "📣 Call for help", next: "shout" },
      { text: "🛏️ Rest and gather strength", next: "rest" }
    ]
  },
  doorOpen: {
    text: `🗝️ The key fits! You unlock the door and step into a dim corridor.\nYou hear faint footsteps.`,
    choices: [
      { text: "🤫 Sneak forward quietly", next: "sneak" },
      { text: "📢 Call out to whoever is there", next: "callOut" },
      { text: "🔙 Go back inside the cell", next: "start" }
    ]
  },
  shout: {
    text: `📣 You shout for help, but no one responds.\nThe silence is unsettling.`,
    choices: [
      { text: "🔍 Search for a key", next: "cellLook" },
      { text: "🛏️ Sit down and wait", next: "wait" }
    ]
  },
  rest: {
    text: `😴 You take a short rest and recover some health.`,
    onEnter: () => {
      const healed = Math.min(20, 100 - player.health);
      player.health += healed;
      storyExtra = `\n💖 Health +${healed}. Current health: ${player.health}`;
    },
    choices: [
      { text: "🔍 Look around the cell", next: "cellLook" },
      { text: "🚪 Try the door", next: "doorTry" }
    ]
  },
  wait: {
    text: `⏳ You wait for what feels like hours.\nSuddenly, a guard opens the door!`,
    choices: [
      { text: "⚔️ Fight the guard", next: "fight" },
      { text: "🗣️ Try to reason", next: "reason" }
    ]
  },
  fight: {
    text: `⚔️ You fight bravely but...`,
    onEnter: () => {
      let outcome = Math.random() * player.strength;
      if (outcome > 7) {
        player.health -= 10;
        storyExtra = "\n🩸 You wounded the guard and escaped but lost 10 health.";
        currentScene = "corridor";
      } else {
        player.health -= 40;
        storyExtra = "\n💥 The guard overpowered you! You lost 40 health and are captured again.";
        currentScene = "start";
      }
    },
    choices: [
      { text: "➡️ Continue", next: () => currentScene }
    ]
  },
  reason: {
    text: `🗣️ You convince the guard to let you go.\nYou escape the dungeon! Congratulations! 🎉`,
    choices: [
      { text: "🔄 Play again", next: "start" }
    ]
  },
  sneak: {
    text: `🤫 You sneak past the guard and find an exit.\nFreedom is just steps away!`,
    choices: [
      { text: "🏃‍♂️ Run to freedom", next: "freedom" },
      { text: "👀 Hide and observe more", next: "observe" },
      { text: "🔙 Go back to corridor", next: "doorOpen" }
    ]
  },
  callOut: {
    text: `📢 Your call alerts the guard. He rushes towards you and captures you again.`,
    choices: [
      { text: "🔄 Restart", next: "start" }
    ]
  },
  freedom: {
    text: `🌞 You burst out into the sunlight, free at last.\nYou win! 🏆`,
    choices: [
      { text: "🔄 Play again", next: "start" }
    ]
  },
  observe: {
    text: `👀 You observe the guard's patrol route and plan your next move carefully.`,
    choices: [
      { text: "🤫 Wait for the right moment and sneak out", next: "freedom" },
      { text: "🕵️ Try to find another exit", next: "secretPassage" }
    ]
  },
  secretPassage: {
    text: `🕳️ Behind a loose stone, you find a narrow tunnel.\nIt looks dark and scary.`,
    choices: [
      { text: "⚔️ Enter the tunnel", next: "tunnel" },
      { text: "🔙 Go back to the corridor", next: "doorOpen" }
    ]
  },
  tunnel: {
    text: `🛡️ The tunnel leads to a hidden armory with weapons.\nYou arm yourself.`,
    onEnter: () => {
      if (!player.inventory.includes('Sword')) {
        player.inventory.push('Sword');
        player.strength += 5;
        storyExtra = "\n🗡️ You found a Sword! Strength +5";
      } else {
        storyExtra = "\n🛡️ You see the weapons you already took.";
      }
    },
    choices: [
      { text: "🔙 Return to corridor", next: "doorOpen" },
      { text: "🚶‍♂️ Explore deeper", next: "trap" }
    ]
  },
  trap: {
    text: `⚠️ You trigger a trap! Arrows fly and you are hit.`,
    onEnter: () => {
      player.health -= 30;
      if (player.health <= 0) {
        storyExtra = "\n💀 You died from your wounds...";
        currentScene = "gameOver";
      } else {
        storyExtra = `\n🩸 You got hit! Health is now ${player.health}.`;
      }
    },
    choices: [
      { text: "➡️ Continue", next: () => currentScene }
    ]
  },
  corridor: {
    text: `🚶‍♂️ You are in a dim corridor. There's a door at the end.`,
    choices: [
      { text: "🚪 Open the door", next: "freedom" },
      { text: "🔙 Go back to the cell", next: "start" }
    ]
  },
  gameOver: {
    text: `☠️ Your adventure ends here...\nGame Over.`,
    choices: [
      { text: "🔄 Restart", next: "start" }
    ]
  }
};

// Random events (triggered after each choice)
const randomEvents = [
  () => {
    if (player.health < 100 && Math.random() < 0.2) {
      player.health = Math.min(100, player.health + 20);
      return "🍃 You found a healing herb! Health +20.";
    }
    return null;
  },
  () => {
    if (Math.random() < 0.15) {
      player.inventory.push('Gold Coin');
      return "💰 You found a shiny Gold Coin!";
    }
    return null;
  },
  () => {
    if (player.health > 30 && Math.random() < 0.1) {
      player.health -= 15;
      return "⚠️ You triggered a minor trap and lost 15 health.";
    }
    return null;
  }
];

let currentScene = 'start';
let storyExtra = '';

const storyEl = document.getElementById('story');
const choicesEl = document.getElementById('choices');

function renderScene() {
  storyExtra = '';
  let scene = scenes[currentScene];

  if (scene.onEnter) scene.onEnter();

  storyEl.textContent = scene.text + (storyExtra ? "\n" + storyExtra : '');

  displayStats();
  displayInventory();

  choicesEl.innerHTML = '';

  scene.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.text;
    btn.onclick = () => {
      if (typeof choice.next === 'function') {
        currentScene = choice.next();
      } else {
        currentScene = choice.next;
      }

      // Random event triggered once per move max
      let eventText = null;
      for (const event of randomEvents) {
        eventText = event();
        if (eventText) break;
      }
      if (eventText) {
        storyExtra = eventText;
      } else {
        storyExtra = '';
      }

      renderScene();
    };
    choicesEl.appendChild(btn);
  });
}

renderScene();
