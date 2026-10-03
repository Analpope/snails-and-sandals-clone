const snailClasses = {
  'Moss Fencer': {
    emoji: '🛡️',
    hp: 140,
    attack: 18,
    defense: 10,
    mana: 28,
    speed: 8,
    skillName: 'Szabályos tokkal',
    skillCost: 8,
    skillPower: 26,
    healPower: 14,
    palette: '#78d38b',
    description: 'Merész védő, aki a páncélját a csata közepén is megtartja.'
  },
  'Sand Snapper': {
    emoji: '⚔️',
    hp: 120,
    attack: 24,
    defense: 6,
    mana: 32,
    speed: 10,
    skillName: 'Homokvágás',
    skillCost: 10,
    skillPower: 34,
    healPower: 10,
    palette: '#ffb46a',
    description: 'Sebes harcos, aki a homokból sziszegő támadást kovácsol.'
  },
  'Moon Shell Mage': {
    emoji: '✨',
    hp: 110,
    attack: 16,
    defense: 8,
    mana: 40,
    speed: 9,
    skillName: 'Holdfény csapás',
    skillCost: 12,
    skillPower: 42,
    healPower: 18,
    palette: '#90c6ff',
    description: 'Varázslatos csiga, aki a holdfényből születő energiával gyógyít és üt.'
  }
};

const enemyTemplates = [
  { name: 'Sivatagi Kúszó', hp: 90, attack: 14, defense: 5, mana: 12, skill: 'Homokcsapás', skillPower: 22, healPower: 10, color: '#9edb83' },
  { name: 'Bogárvásár', hp: 100, attack: 17, defense: 6, mana: 15, skill: 'Páncélkarcolás', skillPower: 26, healPower: 12, color: '#d7b1ff' },
  { name: 'Sárkányteknős', hp: 120, attack: 18, defense: 8, mana: 18, skill: 'Lángnyelv', skillPower: 30, healPower: 14, color: '#ff9a7a' },
  { name: 'Kőmoly', hp: 130, attack: 21, defense: 10, mana: 12, skill: 'Kőtörés', skillPower: 30, healPower: 12, color: '#b9cbc9' },
  { name: 'Fűszagú Rabló', hp: 105, attack: 15, defense: 7, mana: 16, skill: 'Rohamfogás', skillPower: 24, healPower: 9, color: '#f8d286' }
];

const state = {
  selectedClass: 'Moss Fencer',
  player: null,
  enemy: null,
  level: 1,
  gold: 0,
  enemiesDefeated: 0,
  battleActive: false,
  lastWinner: null,
  screen: 'menu'
};

const elements = {
  classList: document.getElementById('class-list'),
  startButton: document.getElementById('start-button'),
  levelBadge: document.getElementById('level-badge'),
  goldBadge: document.getElementById('gold-badge'),
  menuScreen: document.getElementById('menu-screen'),
  battleScreen: document.getElementById('battle-screen'),
  resultScreen: document.getElementById('result-screen'),
  playerPanel: document.getElementById('player-panel'),
  enemyPanel: document.getElementById('enemy-panel'),
  battleLog: document.getElementById('battle-log'),
  resultTitle: document.getElementById('result-title'),
  resultMessage: document.getElementById('result-message'),
  continueButton: document.getElementById('continue-button'),
  restartButton: document.getElementById('restart-button')
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildClassCards() {
  elements.classList.innerHTML = '';

  Object.entries(snailClasses).forEach(([name, data]) => {
    const card = document.createElement('button');
    card.className = `class-card ${state.selectedClass === name ? 'selected' : ''}`;
    card.type = 'button';
    card.innerHTML = `
      <div class="class-card-top">
        <h3>${name}</h3>
        <span class="emoji">${data.emoji}</span>
      </div>
      <ul>
        <li><span>Élet</span><strong>${data.hp}</strong></li>
        <li><span>Erő</span><strong>${data.attack}</strong></li>
        <li><span>Védelem</span><strong>${data.defense}</strong></li>
        <li><span>Mana</span><strong>${data.mana}</strong></li>
      </ul>
    `;

    card.addEventListener('click', () => {
      state.selectedClass = name;
      buildClassCards();
    });

    elements.classList.appendChild(card);
  });
}

function createPlayerFromClass(className) {
  const spec = snailClasses[className];
  return {
    name: className,
    emoji: spec.emoji,
    hp: spec.hp,
    maxHp: spec.hp,
    attack: spec.attack,
    defense: spec.defense,
    mana: spec.mana,
    maxMana: spec.mana,
    speed: spec.speed,
    skillName: spec.skillName,
    skillCost: spec.skillCost,
    skillPower: spec.skillPower,
    healPower: spec.healPower,
    guard: false,
    palette: spec.palette,
    description: spec.description,
    level: 1,
    alive: true
  };
}

function createEnemy(level) {
  const template = enemyTemplates[randomBetween(0, enemyTemplates.length - 1)];
  const scale = 1 + (level - 1) * 0.18;

  return {
    name: template.name,
    hp: Math.round(template.hp * scale),
    maxHp: Math.round(template.hp * scale),
    attack: Math.round(template.attack * scale),
    defense: Math.round(template.defense * scale),
    mana: template.mana,
    maxMana: template.mana,
    skillName: template.skill,
    skillCost: 8,
    skillPower: Math.round(template.skillPower * scale),
    healPower: Math.round(template.healPower * scale),
    guard: false,
    alive: true,
    color: template.color
  };
}

function setScreen(screenName) {
  const screens = [elements.menuScreen, elements.battleScreen, elements.resultScreen];
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === `${screenName}-screen`);
  });
}

function renderPlayerPanel() {
  const p = state.player;
  if (!p) return;

  const hpPercent = clamp((p.hp / p.maxHp) * 100, 0, 100);
  const manaPercent = clamp((p.mana / p.maxMana) * 100, 0, 100);

  elements.playerPanel.innerHTML = `
    <h3>${p.name}</h3>
    <div class="stat-line"><span>Élet</span><strong>${p.hp}/${p.maxHp}</strong></div>
    <div class="hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
    <div class="stat-line"><span>Mana</span><strong>${p.mana}/${p.maxMana}</strong></div>
    <div class="mana-bar"><div class="mana-fill" style="width: ${manaPercent}%"></div></div>
    <div class="stat-line"><span>Erő</span><strong>${p.attack}</strong></div>
    <div class="stat-line"><span>Védelem</span><strong>${p.defense}</strong></div>
    <div class="stat-line"><span>Képesség</span><strong>${p.skillName}</strong></div>
  `;
}

function renderEnemyPanel() {
  const e = state.enemy;
  if (!e) return;

  const hpPercent = clamp((e.hp / e.maxHp) * 100, 0, 100);
  const manaPercent = clamp((e.mana / e.maxMana) * 100, 0, 100);

  elements.enemyPanel.innerHTML = `
    <h3>${e.name}</h3>
    <div class="stat-line"><span>Élet</span><strong>${e.hp}/${e.maxHp}</strong></div>
    <div class="hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
    <div class="stat-line"><span>Mana</span><strong>${e.mana}/${e.maxMana}</strong></div>
    <div class="mana-bar"><div class="mana-fill" style="width: ${manaPercent}%"></div></div>
    <div class="stat-line"><span>Erő</span><strong>${e.attack}</strong></div>
    <div class="stat-line"><span>Védelem</span><strong>${e.defense}</strong></div>
    <div class="stat-line"><span>Képesség</span><strong>${e.skillName}</strong></div>
  `;
}

function renderHud() {
  elements.levelBadge.textContent = `Arena ${state.level}`;
  elements.goldBadge.textContent = `Gold: ${state.gold}`;
  renderPlayerPanel();
  renderEnemyPanel();
}

function addLog(message) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = message;
  elements.battleLog.prepend(entry);
}

function calculateDamage(attacker, defender, baseDamage, extra = 0) {
  const variance = randomBetween(-3, 6);
  const mitigation = defender.defense * 0.65;
  const raw = Math.max(5, baseDamage + variance + extra - mitigation);
  return Math.max(0, Math.round(raw));
}

function completeTurn() {
  if (state.player) {
    state.player.mana = clamp(state.player.mana + 3, 0, state.player.maxMana);
  }
  if (state.enemy) {
    state.enemy.mana = clamp(state.enemy.mana + 2, 0, state.enemy.maxMana);
  }
  renderHud();
}

function startBattle() {
  const selectedSpec = snailClasses[state.selectedClass];
  state.player = createPlayerFromClass(state.selectedClass);
  state.enemy = createEnemy(state.level);
  state.battleActive = true;
  state.lastWinner = null;
  elements.battleLog.innerHTML = '';
  addLog(`${state.player.name} belép az arénába.`);
  addLog(`Ellenség: ${state.enemy.name}.`);
  setScreen('battle');
  renderHud();
}

function finishEncounter(won) {
  state.battleActive = false;

  if (won) {
    state.enemiesDefeated += 1;
    const reward = 18 + state.level * 7;
    state.gold += reward;
    elements.resultTitle.textContent = 'Győzelem!';
    elements.resultMessage.textContent = `${state.enemy.name} legyőzve. +${reward} arany és a következő körben új kihívás vár.`;
    state.lastWinner = 'player';
    state.level += 1;
    elements.continueButton.textContent = 'Következő kör';
  } else {
    elements.resultTitle.textContent = 'Veszteség';
    elements.resultMessage.textContent = `A csiga összecsuklott. A kör megismételhető.`;
    state.lastWinner = 'enemy';
    state.level = 1;
    state.gold = 0;
    state.enemiesDefeated = 0;
    elements.continueButton.textContent = 'Újra próbálom';
  }

  setScreen('result');
}

function resolveEnemyTurn() {
  if (!state.enemy || !state.player || !state.battleActive) return;

  const enemy = state.enemy;
  const player = state.player;

  let action = 'attack';
  if (enemy.hp <= enemy.maxHp * 0.35 && enemy.mana >= 8) {
    action = 'heal';
  } else if (enemy.mana >= enemy.skillCost && Math.random() < 0.4) {
    action = 'skill';
  } else if (Math.random() < 0.2) {
    action = 'guard';
  }

  if (action === 'guard') {
    enemy.guard = true;
    addLog(`${enemy.name} felkészül a védelmére.`);
  } else if (action === 'heal') {
    const healAmount = Math.min(enemy.maxHp - enemy.hp, enemy.healPower);
    enemy.hp += healAmount;
    enemy.mana = Math.max(0, enemy.mana - 8);
    addLog(`${enemy.name} felgyógyul ${healAmount} életet.`);
  } else if (action === 'skill') {
    enemy.mana = Math.max(0, enemy.mana - enemy.skillCost);
    const damage = calculateDamage(enemy, player, enemy.skillPower, 5);
    if (player.guard) {
      player.guard = false;
    }
    player.hp = clamp(player.hp - damage, 0, player.maxHp);
    addLog(`${enemy.name} használja a ${enemy.skillName} technikát, ${damage} sebzést okoz.`);
  } else {
    const damage = calculateDamage(enemy, player, enemy.attack, 0);
    if (player.guard) {
      damage = Math.max(1, Math.round(damage * 0.45));
      player.guard = false;
    }
    player.hp = clamp(player.hp - damage, 0, player.maxHp);
    addLog(`${enemy.name} támad: ${damage} sebzés.`);
  }

  completeTurn();

  if (player.hp <= 0) {
    player.alive = false;
    finishEncounter(false);
    return;
  }

  if (enemy.hp <= 0) {
    enemy.alive = false;
    finishEncounter(true);
    return;
  }
}

function playerAction(actionType) {
  if (!state.battleActive || !state.player || !state.enemy) return;

  const player = state.player;
  const enemy = state.enemy;

  if (actionType === 'attack') {
    const damage = calculateDamage(player, enemy, player.attack, 2);
    enemy.hp = clamp(enemy.hp - damage, 0, enemy.maxHp);
    addLog(`${player.name} támad: ${damage} sebzés.`);
  }

  if (actionType === 'skill') {
    if (player.mana < player.skillCost) {
      addLog(`${player.name} nincs elég mana a ${player.skillName} használatához.`);
      return;
    }

    player.mana = Math.max(0, player.mana - player.skillCost);
    const damage = calculateDamage(player, enemy, player.skillPower, 8);
    enemy.hp = clamp(enemy.hp - damage, 0, enemy.maxHp);
    addLog(`${player.name} használja a ${player.skillName}: ${damage} sebzés.`);
  }

  if (actionType === 'guard') {
    player.guard = true;
    addLog(`${player.name} felkészül a védelemre.`);
  }

  if (actionType === 'heal') {
    if (player.mana < 6) {
      addLog(`${player.name} túl kevés mana van a gyógyításhoz.`);
      return;
    }

    player.mana = Math.max(0, player.mana - 6);
    const healAmount = Math.min(player.maxHp - player.hp, player.healPower);
    player.hp += healAmount;
    addLog(`${player.name} gyógyul ${healAmount} életet.`);
  }

  completeTurn();

  if (enemy.hp <= 0) {
    enemy.alive = false;
    finishEncounter(true);
    return;
  }

  resolveEnemyTurn();
}

function bindActions() {
  document.querySelectorAll('.action-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const actionType = button.dataset.action;
      playerAction(actionType);
    });
  });

  elements.startButton.addEventListener('click', () => {
    startBattle();
  });

  elements.continueButton.addEventListener('click', () => {
    if (state.lastWinner === 'player') {
      startBattle();
      return;
    }

    state.level = 1;
    state.gold = 0;
    state.enemiesDefeated = 0;
    setScreen('menu');
  });

  elements.restartButton.addEventListener('click', () => {
    state.level = 1;
    state.gold = 0;
    state.enemiesDefeated = 0;
    setScreen('menu');
  });
}

function init() {
  buildClassCards();
  bindActions();
  setScreen('menu');
  renderHud();
}

init();
