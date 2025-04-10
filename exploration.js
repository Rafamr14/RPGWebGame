// Función para verificar si se puede iniciar la exploración
function checkExplorationReadiness() {
    const startButton = document.getElementById('start-exploration');
    if (selectedCharacterId && selectedZoneId) {
        startButton.removeAttribute('disabled');
        startButton.classList.remove('btn-disabled');
    } else {
        startButton.setAttribute('disabled', 'true');
        startButton.classList.add('btn-disabled');
    }
}

// Función para cargar las zonas disponibles
function loadZones() {
    console.log("Cargando zonas disponibles...");
    const zoneList = document.getElementById('zone-list');
    if (!zoneList) {
        console.error("Elemento zone-list no encontrado");
        return;
    }

    zoneList.innerHTML = '';
    selectedZoneId = null; // Resetear selección

    ZONES.forEach(zone => {
        const zoneCard = document.createElement('div');
        zoneCard.className = 'zone-card';
        zoneCard.setAttribute('data-id', zone.id);

        zoneCard.innerHTML = `
            <h4>${zone.name}</h4>
            <p class="zone-description">${zone.description}</p>
            <p>Nivel: ${zone.level}</p>
            <p>Energía: ${zone.stamina}</p>
            <p>Enemigos: ${zone.enemies}</p>
        `;

        // Desactivar zonas de nivel demasiado alto
        const playerData = getPlayerData();
        const highestCharacterLevel = playerData.characters && playerData.characters.length > 0
            ? playerData.characters.reduce((max, character) => Math.max(max, character.level), 0)
            : 0;

        if (zone.level > highestCharacterLevel + 3) {
            zoneCard.classList.add('disabled');
            zoneCard.setAttribute('title', 'Tu nivel es demasiado bajo para esta zona');
        }

        zoneList.appendChild(zoneCard);
    });

    // Desactivar botón de inicio hasta que se seleccione personaje y zona
    const startButton = document.getElementById('start-exploration');
    startButton.setAttribute('disabled', 'true');
    startButton.classList.add('btn-disabled');

    console.log("Zonas cargadas");
}

// Función para actualizar la lista de personajes en la pantalla de exploración
function updateExplorationCharacterList() {
    console.log("Actualizando lista de personajes para exploración...");
    const explorationCharacterList = document.getElementById('exploration-character-list');
    if (!explorationCharacterList) {
        console.log("No se encontró el elemento exploration-character-list");
        return;
    }

    explorationCharacterList.innerHTML = '';
    selectedCharacterId = null; // Resetear selección

    const playerData = getPlayerData();
    if (!playerData || !playerData.characters || playerData.characters.length === 0) {
        explorationCharacterList.innerHTML = '<p class="empty-list-message">No tienes personajes disponibles para explorar.</p>';
        return;
    }

    playerData.characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';
        characterCard.setAttribute('data-id', character.id);

        // Color de clase
        let classColor = '#3a6ea5'; // Por defecto
        switch(character.class) {
            case 'WARRIOR': classColor = '#e74c3c'; break;
            case 'MAGE': classColor = '#9b59b6'; break;
            case 'ARCHER': classColor = '#2ecc71'; break;
            case 'HEALER': classColor = '#3498db'; break;
        }

        // Calcular experiencia
        const currentExp = character.experience;
        const maxExp = character.level * 100;
        const expPercentage = (currentExp / maxExp) * 100;

        characterCard.innerHTML = `
            <h4>${character.name}</h4>
            <p>Nivel: ${character.level}</p>
            <p>Salud: ${character.stats.health}</p>
            <div class="character-xp-mini">
                <div class="xp-bar-mini">
                    <div class="xp-progress-mini" style="width: ${expPercentage}%"></div>
                </div>
                <span class="xp-text-mini">${currentExp}/${maxExp} XP</span>
            </div>
        `;

        // Aplicar estilo especial para la clase
        characterCard.style.borderLeft = `4px solid ${classColor}`;

        explorationCharacterList.appendChild(characterCard);
    });

    console.log(`Lista de personajes para exploración actualizada con ${playerData.characters.length} personajes.`);
}

// Función para iniciar la exploración
function startExploration() {
    console.log("Iniciando exploración...");

    if (!selectedCharacterId || !selectedZoneId) {
        showErrorMessage('Debes seleccionar un personaje y una zona para explorar.');
        return;
    }

    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === selectedCharacterId);
    const zone = ZONES.find(z => z.id === selectedZoneId);

    if (!character) {
        showErrorMessage('Personaje no encontrado. Por favor, selecciona otro.');
        return;
    }

    if (!zone) {
        showErrorMessage('Zona no encontrada. Por favor, selecciona otra.');
        return;
    }

    // Comprobar stamina
    if (playerData.stamina < zone.stamina) {
        showErrorMessage(`No tienes suficiente energía para explorar esta zona. Necesitas ${zone.stamina} de energía.`);
        return;
    }

    // Iniciar la exploración
    currentExploration = {
        character: character,
        zone: zone,
        combatLog: [],
        rewards: {
            experience: 0,
            gold: 0,
            items: []
        },
        enemiesDefeated: 0,
        totalEnemies: zone.enemies
    };

    // Consumir energía
    playerData.stamina -= zone.stamina;
    savePlayerData(playerData);

    // Actualizar interfaz de usuario
    document.getElementById('stamina').textContent = `Energía: ${playerData.stamina}/${playerData.maxStamina}`;

    // Mostrar resultados
    document.getElementById('exploration-result').classList.remove('hidden');
    document.getElementById('combat-log').innerHTML = '<p>Preparando exploración...</p>';
    document.getElementById('rewards').innerHTML = '';

    // Inicializar barra de progreso
    document.getElementById('exploration-progress-value').textContent = `0/${zone.enemies}`;
    document.getElementById('exploration-progress-fill').style.width = "0%";

    // Desactivar selección para evitar doble inicio
    document.getElementById('start-exploration').setAttribute('disabled', 'true');
    document.getElementById('start-exploration').classList.add('btn-disabled');

    // Ejecutar todos los combates automáticamente
    runAllCombats();

    console.log("Exploración iniciada con " + character.name + " en " + zone.name);
}

// Función para ejecutar todos los combates de una vez
function runAllCombats() {
    const combatLog = document.getElementById('combat-log');
    const rewards = document.getElementById('rewards');

    combatLog.innerHTML = '';
    let allCombatLogs = [];

    // Función para procesar un combate
    function processCombat(index) {
        if (index >= currentExploration.zone.enemies) {
            // Todos los combates completados, mostrar resultados finales
            displayResults();
            return;
        }

        // Actualizar barra de progreso
        document.getElementById('exploration-progress-value').textContent = `${index}/${currentExploration.zone.enemies}`;
        document.getElementById('exploration-progress-fill').style.width = `${(index / currentExploration.zone.enemies) * 100}%`;

        // Generar enemigo
        const enemy = generateEnemy(
            currentExploration.zone.name,
            currentExploration.zone.level,
            currentExploration.zone.difficulty
        );

        allCombatLogs.push(`<div class="combat-encounter"><p>Encuentro ${index + 1}: ${currentExploration.character.name} vs ${enemy.name}</p>`);

        // Ejecutar combate
        let combatResult;
        try {
            if (typeof startCombat === 'function') {
                startCombat(currentExploration.character, enemy, currentExploration.zone.id)
                    .then(result => {
                        processCombatResult(result, index);
                        // Procesar el siguiente combate
                        setTimeout(() => processCombat(index + 1), 500);
                    });
                return;
            } else {
                combatResult = simulateCombat(currentExploration.character, enemy);
            }
        } catch (e) {
            console.error("Error en el combate:", e);
            combatResult = simulateCombat(currentExploration.character, enemy);
        }

        // Si no es una promesa, procesar directamente
        if (!(combatResult instanceof Promise)) {
            processCombatResult(combatResult, index);
            // Procesar el siguiente combate
            setTimeout(() => processCombat(index + 1), 500);
        }
    }

    // Función para procesar el resultado de un combate
    function processCombatResult(result, index) {
        // Mostrar el combate en detalle usando un modal de batalla si es el primer encuentro
        if (index === 0) {
            showBattleModal(currentExploration.character, result);
        }

        // Añadir logs del combate con clases CSS para diferentes tipos de mensajes
        result.combatLog.forEach(log => {
            let cssClass = '';

            // Determinar qué clase CSS aplicar según el contenido del mensaje
            if (log.includes('ataca')) {
                cssClass = 'combat-attack';
            } else if (log.includes('causando')) {
                cssClass = 'combat-damage';
            } else if (log.includes('ha derrotado')) {
                cssClass = 'combat-victory';
            } else if (log.includes('ha sido derrotado')) {
                cssClass = 'combat-defeat';
            } else if (log.includes('gana')) {
                cssClass = 'combat-reward';
            }

            allCombatLogs.push(`<p class="${cssClass}">${log}</p>`);
        });

        allCombatLogs.push('</div>');

        // Actualizar recompensas totales
        currentExploration.rewards.experience += result.rewards.experience;
        currentExploration.rewards.gold += result.rewards.gold;

        // Añadir items encontrados
        if (result.rewards.items && result.rewards.items.length > 0) {
            if (!currentExploration.rewards.items) currentExploration.rewards.items = [];
            currentExploration.rewards.items = currentExploration.rewards.items.concat(result.rewards.items);
        }

        // Actualizar contador de enemigos
        if (result.victory) {
            currentExploration.enemiesDefeated++;
        }

        // Mostrar logs actualizados
        combatLog.innerHTML = allCombatLogs.join('');

        // Scroll al final del log
        combatLog.scrollTop = combatLog.scrollHeight;
    }

    // Función para mostrar resultados finales
    function displayResults() {
        // Actualizar la barra de progreso al 100%
        document.getElementById('exploration-progress-value').textContent = `${currentExploration.enemiesDefeated}/${currentExploration.totalEnemies}`;
        document.getElementById('exploration-progress-fill').style.width = `${(currentExploration.enemiesDefeated / currentExploration.totalEnemies) * 100}%`;

        // Mostrar resumen de recompensas
        rewards.innerHTML = `
            <div class="rewards-summary">
                <h4>Resumen de la Exploración</h4>
                <p>Enemigos derrotados: ${currentExploration.enemiesDefeated}/${currentExploration.totalEnemies}</p>
                <p>Experiencia ganada: ${currentExploration.rewards.experience}</p>
                <p>Oro obtenido: ${currentExploration.rewards.gold}</p>
                <p>Items encontrados: ${currentExploration.rewards.items?.length || 0}</p>
            </div>
        `;

        // Si hay items, mostrarlos
        if (currentExploration.rewards.items && currentExploration.rewards.items.length > 0) {
            let itemsHtml = `<div class="rewards-items"><h4>Items obtenidos:</h4><div class="items-grid">`;

            currentExploration.rewards.items.forEach(item => {
                // Color según rareza si el item tiene rareza
                let itemStyle = '';
                if (item.rarity) {
                    const rarityKey = Object.keys(ITEM_RARITIES).find(
                        key => ITEM_RARITIES[key].name === item.rarity
                    );
                    if (rarityKey) {
                        itemStyle = `border-color: ${ITEM_RARITIES[rarityKey].color}; border-width: 2px;`;
                    }
                }

                itemsHtml += `
                    <div class="item-card" style="${itemStyle}">
                        <div class="item-name">${item.name}</div>
                        <div class="item-type">${getItemTypeText(item.type)}</div>
                        ${item.level ? `<div class="item-level">Nivel ${item.level}</div>` : ''}
                    </div>
                `;
            });

            itemsHtml += `</div></div>`;
            rewards.innerHTML += itemsHtml;
        }

        // Aplicar recompensas al personaje
        let result;
        try {
            if (typeof applyRewards === 'function') {
                result = applyRewards(currentExploration.character.id, currentExploration.rewards);
            } else {
                result = applyRewardsManual(currentExploration.character.id, currentExploration.rewards);
            }

            // Mostrar mensaje de subida de nivel si aplica
            if (result.levelUps > 0) {
                rewards.innerHTML += `<div class="level-up-message"><p>¡${currentExploration.character.name} ha subido ${result.levelUps} nivel(es)!</p></div>`;
            }

            // Actualizar visualización de oro
            updateGoldDisplay();

        } catch (e) {
            console.error("Error al aplicar recompensas:", e);
        }

        // Activar botón para volver a explorar
        document.getElementById('finish-exploration').removeAttribute('disabled');
        document.getElementById('finish-exploration').classList.remove('btn-disabled');
    }

    // Iniciar el primer combate
    processCombat(0);
}

// Función para mostrar el modal de batalla
function showBattleModal(character, combatResult) {
    // Obtener datos del combate
    const enemy = combatResult.enemy || { name: "Enemigo", stats: { health: 100 } };
    const victory = combatResult.victory;
    const combatLog = combatResult.combatLog;

    // Configurar el modal
    document.getElementById('battle-player-name').textContent = character.name;
    document.getElementById('battle-enemy-name').textContent = enemy.name;

    // Configurar barras de vida
    document.getElementById('player-health-value').textContent = `${combatResult.remainingHealth} / ${character.stats.health}`;
    document.getElementById('player-health-fill').style.width = `${(combatResult.remainingHealth / character.stats.health) * 100}%`;

    // Si el enemigo fue derrotado, su salud es 0
    const enemyRemainingHealth = victory ? 0 : enemy.currentHealth || 0;
    document.getElementById('enemy-health-value').textContent = `${enemyRemainingHealth} / ${enemy.stats.health}`;
    document.getElementById('enemy-health-fill').style.width = `${(enemyRemainingHealth / enemy.stats.health) * 100}%`;

    // Mostrar el log de combate
    const battleLog = document.getElementById('battle-log');
    battleLog.innerHTML = '';

    combatLog.forEach(log => {
        let cssClass = '';

        // Determinar clase CSS según el contenido del mensaje
        if (log.includes(character.name + ' ataca')) {
            cssClass = 'player-attack';
        } else if (log.includes(enemy.name + ' ataca')) {
            cssClass = 'enemy-attack';
        } else if (log.includes('ha derrotado')) {
            cssClass = victory ? 'player-victory' : 'enemy-victory';
        } else if (log.includes('gana')) {
            cssClass = 'reward-message';
        }

        battleLog.innerHTML += `<p class="${cssClass}">${log}</p>`;
    });

    // Mostrar el modal
    showModal('battle-modal');
}

// Función para finalizar la exploración
function finishExploration() {
    console.log("Finalizando exploración...");

    // Ocultar resultados
    document.getElementById('exploration-result').classList.add('hidden');

    // Resetear selecciones
    document.querySelectorAll('#zone-list .zone-card').forEach(card => {
        card.classList.remove('selected');
    });

    document.querySelectorAll('#exploration-character-list .character-card').forEach(card => {
        card.classList.remove('selected');
    });

    selectedCharacterId = null;
    selectedZoneId = null;

    // Desactivar botón de inicio
    document.getElementById('start-exploration').setAttribute('disabled', 'true');
    document.getElementById('start-exploration').classList.add('btn-disabled');

    // Limpiar datos de exploración actual
    currentExploration = {
        character: null,
        zone: null,
        combatLog: [],
        rewards: {
            experience: 0,
            gold: 0,
            items: []
        },
        enemiesDefeated: 0,
        totalEnemies: 0
    };

    console.log("Exploración finalizada");
}

// Función para generar un enemigo según la zona y nivel
function generateEnemy(zoneName, zoneLevel, difficulty = 1) {
    console.log("Generando enemigo para zona:", zoneName, "nivel:", zoneLevel);

    // Nombres de enemigos según tipo de zona
    const enemyTypes = {
        'Bosque Encantado': ['Lobo Salvaje', 'Araña Gigante', 'Duende Travieso', 'Planta Carnívora'],
        'Caverna Oscura': ['Murciélago Vampiro', 'Golem de Piedra', 'Troll de las Cavernas', 'Slime Ácido'],
        'Montaña Helada': ['Yeti Furioso', 'Elemental de Hielo', 'Águila de las Nieves', 'Lobo Ártico'],
        'Desierto Ardiente': ['Escorpión Gigante', 'Serpiente Venenosa', 'Elemental de Fuego', 'Bandido del Desierto'],
        'Castillo Abandonado': ['Caballero Fantasma', 'Gárgola Ancestral', 'Liche Corrupto', 'Espectro de la Noche']
    };

    // Seleccionar un tipo de enemigo aleatorio
    const zoneEnemies = enemyTypes[zoneName] || ['Monstruo Desconocido'];
    const enemyName = zoneEnemies[Math.floor(Math.random() * zoneEnemies.length)];

    // Calcular estadísticas base según nivel y dificultad
    const baseHealth = 50 + (zoneLevel * 10);
    const baseAttack = 5 + (zoneLevel * 2);
    const baseDefense = 3 + (zoneLevel);
    const baseSpeed = 5 + (zoneLevel * 0.5);

    // Aplicar modificador de dificultad
    const stats = {
        health: Math.floor(baseHealth * difficulty),
        attack: Math.floor(baseAttack * difficulty),
        defense: Math.floor(baseDefense * difficulty),
        speed: Math.floor(baseSpeed * difficulty)
    };

    // Crear el enemigo
    const enemy = {
        name: enemyName,
        level: zoneLevel,
        stats: stats,
        currentHealth: stats.health
    };

    console.log("Enemigo generado:", enemy);
    return enemy;
}

// Función para simular un combate (fallback en caso de error)
function simulateCombat(character, enemy) {
    console.log("Simulando combate entre", character.name, "y", enemy.name);

    // Crear un log de combate
    const combatLog = [];
    combatLog.push(`¡${character.name} se encuentra con ${enemy.name}!`);

    // Determinar quién ataca primero
    let characterTurn = character.stats.speed >= enemy.stats.speed;
    let enemyHealth = enemy.stats.health;
    let characterHealth = character.stats.health;

    // Simular hasta 10 turnos
    for (let i = 0; i < 10; i++) {
        if (characterTurn) {
            // Ataque del personaje
            const damage = Math.max(1, character.stats.attack - enemy.stats.defense);
            enemyHealth -= damage;
            combatLog.push(`${character.name} ataca a ${enemy.name} causando ${damage} de daño.`);

            if (enemyHealth <= 0) {
                combatLog.push(`¡${character.name} ha derrotado a ${enemy.name}!`);
                break;
            }
        } else {
            // Ataque del enemigo
            const damage = Math.max(1, enemy.stats.attack - character.stats.defense);
            characterHealth -= damage;
            combatLog.push(`${enemy.name} ataca a ${character.name} causando ${damage} de daño.`);

            if (characterHealth <= 0) {
                combatLog.push(`¡${character.name} ha sido derrotado por ${enemy.name}!`);
                break;
            }
        }

        // Cambiar turno
        characterTurn = !characterTurn;
    }

    // Determinar victoria
    const victory = enemyHealth <= 0;

    // Calcular recompensas
    const expGained = Math.floor(50 + (enemy.level * 20) * (victory ? 1 : 0.2));
    const goldGained = Math.floor(30 + (enemy.level * 15)) * (victory ? 1 : 0);

    // Generar items
    const items = [];
    if (victory && Math.random() < 0.7) {
        // 70% de probabilidad de obtener un item si gana
        items.push({
            id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: 'Item básico',
            type: 'material',
            value: 50 * enemy.level,
            description: 'Un item básico de combate'
        });
    }

    combatLog.push(`${character.name} gana ${expGained} experiencia y ${goldGained} oro.`);

    return {
        victory: victory,
        combatLog: combatLog,
        rewards: {
            experience: expGained,
            gold: goldGained,
            items: items
        },
        remainingHealth: characterHealth,
        enemy: enemy // Añadir el enemigo para el modal de batalla
    };
}

// Función para aplicar recompensas manualmente (fallback si applyRewards no está disponible)
function applyRewardsManual(characterId, rewards) {
    console.log("Aplicando recompensas manualmente:", rewards);
    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === characterId);

    if (!character) {
        console.error("Personaje no encontrado:", characterId);
        return { success: false, levelUps: 0 };
    }

    // Añadir experiencia
    character.experience += rewards.experience;

    // Añadir oro
    playerData.gold += rewards.gold;

    // Añadir items al inventario si hay
    if (rewards.items && rewards.items.length > 0) {
        if (!playerData.inventory) {
            playerData.inventory = [];
        }
        playerData.inventory = playerData.inventory.concat(rewards.items);
    }

    // Comprobar si sube de nivel
    let levelUps = 0;
    let expNeeded = character.level * 100;

    while (character.experience >= expNeeded) {
        character.level++;
        character.experience -= expNeeded;
        levelUps++;

        // Actualizar estadísticas si updateCharacterStats está disponible
        try {
            if (typeof updateCharacterStats === 'function') {
                updateCharacterStats(character);
            } else {
                // Actualización manual básica
                const baseStats = CHARACTER_CLASSES[character.class].baseStats;
                const growthRates = CHARACTER_CLASSES[character.class].growthRates;

                character.stats = {
                    health: baseStats.health + (growthRates.health * (character.level - 1)),
                    attack: baseStats.attack + (growthRates.attack * (character.level - 1)),
                    defense: baseStats.defense + (growthRates.defense * (character.level - 1)),
                    speed: baseStats.speed + (growthRates.speed * (character.level - 1))
                };
            }
        } catch (e) {
            console.error("Error al actualizar estadísticas:", e);
        }

        expNeeded = character.level * 100;
    }

    // Guardar cambios
    savePlayerData(playerData);

    return { success: true, levelUps: levelUps };
}

// Función para obtener el texto del tipo de item
function getItemTypeText(type) {
    switch(type) {
        case 'weapon':
            return 'Arma';
        case 'armor':
            return 'Armadura';
        case 'consumable':
            return 'Consumible';
        case 'material':
            return 'Material';
        default:
            return 'Item';
    }
}// Exploration.js - Lógica de exploración de zonas - Versión mejorada

// Constantes de zonas
const ZONES = [
    {
        id: 'forest',
        name: 'Bosque Encantado',
        description: 'Un bosque místico lleno de criaturas mágicas y vegetación exuberante.',
        level: 1,
        stamina: 10,
        enemies: 3,
        difficulty: 1.0,
        background: 'forest-bg.jpg'
    },
    {
        id: 'cave',
        name: 'Caverna Oscura',
        description: 'Una red de cuevas con poca luz donde habitan criaturas adaptadas a la oscuridad.',
        level: 3,
        stamina: 15,
        enemies: 4,
        difficulty: 1.2,
        background: 'cave-bg.jpg'
    },
    {
        id: 'mountain',
        name: 'Montaña Helada',
        description: 'Picos nevados donde el frío extremo es tan peligroso como las criaturas que lo habitan.',
        level: 5,
        stamina: 20,
        enemies: 5,
        difficulty: 1.5,
        background: 'mountain-bg.jpg'
    },
    {
        id: 'desert',
        name: 'Desierto Ardiente',
        description: 'Vastas extensiones de arena y calor abrasador con oasis escondidos.',
        level: 7,
        stamina: 25,
        enemies: 6,
        difficulty: 1.7,
        background: 'desert-bg.jpg'
    },
    {
        id: 'castle',
        name: 'Castillo Abandonado',
        description: 'Una antigua fortaleza ahora habitada por espíritus y criaturas oscuras.',
        level: 10,
        stamina: 30,
        enemies: 7,
        difficulty: 2.0,
        background: 'castle-bg.jpg'
    }
];

// Variables para la exploración actual
let selectedCharacterId = null;
let selectedZoneId = null;
let currentExploration = {
    character: null,
    zone: null,
    combatLog: [],
    rewards: {
        experience: 0,
        gold: 0,
        items: []
    },
    enemiesDefeated: 0,
    totalEnemies: 0
};

// Inicialización del módulo de exploración
function initExploration() {
    console.log("Inicializando módulo de exploración...");

    // Event listener para selección de zona
    document.getElementById('zone-list').addEventListener('click', function(e) {
        const zoneCard = e.target.closest('.zone-card');
        if (zoneCard) {
            // Deseleccionar todas las zonas
            document.querySelectorAll('.zone-card').forEach(card => {
                card.classList.remove('selected');
            });

            // Seleccionar la zona clicada
            zoneCard.classList.add('selected');
            selectedZoneId = zoneCard.getAttribute('data-id');
            console.log("Zona seleccionada:", selectedZoneId);

            // Activar botón si hay personaje seleccionado
            checkExplorationReadiness();
        }
    });

    // Event listener para selección de personaje en exploración
    document.getElementById('exploration-character-list').addEventListener('click', function(e) {
        const characterCard = e.target.closest('.character-card');
        if (characterCard) {
            // Deseleccionar todos los personajes
            document.querySelectorAll('#exploration-character-list .character-card').forEach(card => {
                card.classList.remove('selected');
            });

            // Seleccionar el personaje clicado
            characterCard.classList.add('selected');
            selectedCharacterId = characterCard.getAttribute('data-id');
            console.log("Personaje seleccionado:", selectedCharacterId);

            // Activar botón si hay zona seleccionada
            checkExplorationReadiness();
        }
    });

    // Event listener para iniciar exploración
    document.getElementById('start-exploration').addEventListener('click', startExploration);

    // Event listener para finalizar exploración
    document.getElementById('finish-exploration').addEventListener('click', finishExploration);

    // Cargar zonas cuando se muestra la pantalla
    document.getElementById('exploration-screen').addEventListener('screenShown', function() {
        loadZones();
        updateExplorationCharacterList();
    });

    console.log("Módulo de exploración inicializado correctamente");
}