// Exploration.js - Lógica de exploración de zonas

// Constantes de zonas
const ZONES = [
    {
        id: 'forest',
        name: 'Bosque Encantado',
        description: 'Un bosque místico lleno de criaturas mágicas y vegetación exuberante.',
        level: 1,
        stamina: 10,
        enemies: 3,
        difficulty: 1.0
    },
    {
        id: 'cave',
        name: 'Caverna Oscura',
        description: 'Una red de cuevas con poca luz donde habitan criaturas adaptadas a la oscuridad.',
        level: 3,
        stamina: 15,
        enemies: 4,
        difficulty: 1.2
    },
    {
        id: 'mountain',
        name: 'Montaña Helada',
        description: 'Picos nevados donde el frío extremo es tan peligroso como las criaturas que lo habitan.',
        level: 5,
        stamina: 20,
        enemies: 5,
        difficulty: 1.5
    },
    {
        id: 'desert',
        name: 'Desierto Ardiente',
        description: 'Vastas extensiones de arena y calor abrasador con oasis escondidos.',
        level: 7,
        stamina: 25,
        enemies: 6,
        difficulty: 1.7
    },
    {
        id: 'castle',
        name: 'Castillo Abandonado',
        description: 'Una antigua fortaleza ahora habitada por espíritus y criaturas oscuras.',
        level: 10,
        stamina: 30,
        enemies: 7,
        difficulty: 2.0
    }
];

// Variables para la exploración actual
let currentZone = null;
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
    console.log("Inicializando módulo de exploración");

    // Event listener para selección de zona
    document.getElementById('zone-list').addEventListener('click', function(e) {
        const zoneCard = e.target.closest('.zone-card');
        if (zoneCard) {
            const zoneId = zoneCard.getAttribute('data-id');
            selectZone(zoneId);
        }
    });

    // Event listener para selección de personaje en exploración
    document.getElementById('exploration-character-list').addEventListener('click', function(e) {
        const characterCard = e.target.closest('.character-card');
        if (characterCard) {
            document.querySelectorAll('#exploration-character-list .character-card').forEach(card => {
                card.classList.remove('selected');
            });
            characterCard.classList.add('selected');

            const characterId = characterCard.getAttribute('data-id');
            localStorage.setItem('rpg_exploration_character', characterId);
        }
    });

    // Event listener para iniciar exploración
    document.getElementById('start-exploration').addEventListener('click', startExploration);

    // Event listener para continuar exploración
    document.getElementById('continue-exploration').addEventListener('click', continueExploration);

    // Cargar zonas cuando se muestra la pantalla
    document.getElementById('exploration-screen').addEventListener('screenShown', function() {
        loadZones();
    });
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

    // Asegurarnos de que se actualice la lista de personajes para exploración
    updateExplorationCharacterList();

    ZONES.forEach(zone => {
        const zoneCard = document.createElement('div');
        zoneCard.className = 'zone-card';
        zoneCard.setAttribute('data-id', zone.id);

        zoneCard.innerHTML = `
            <h3>${zone.name}</h3>
            <p>Nivel: ${zone.level}</p>
            <p>Energía: ${zone.stamina}</p>
            <p>${zone.description}</p>
        `;

        // Desactivar zonas de nivel demasiado alto
        const playerData = getPlayerData();
        const highestCharacterLevel = playerData.characters && playerData.characters.length > 0
            ? playerData.characters.reduce((max, character) => Math.max(max, character.level), 0)
            : 0;

        if (zone.level > highestCharacterLevel + 3) {
            zoneCard.classList.add('disabled');
            zoneCard.style.opacity = '0.5';
            zoneCard.style.cursor = 'not-allowed';
            zoneCard.setAttribute('title', 'Tu nivel es demasiado bajo para esta zona');
        }

        zoneList.appendChild(zoneCard);
    });
    console.log("Zonas cargadas");
}

// Función para seleccionar una zona
function selectZone(zoneId) {
    console.log("Seleccionando zona:", zoneId);
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) {
        console.error("Zona no encontrada:", zoneId);
        return;
    }

    const playerData = getPlayerData();
    if (!playerData || !playerData.characters) {
        console.error("No hay datos de jugador o personajes");
        // Mostrar modal de error
        document.getElementById('error-message').textContent = 'Necesitas tener al menos un personaje para explorar.';
        showModal('error-modal');
        return;
    }

    const highestCharacterLevel = playerData.characters.length > 0
        ? playerData.characters.reduce((max, character) => Math.max(max, character.level), 0)
        : 0;

    if (zone.level > highestCharacterLevel + 3) {
        // Mostrar modal de error
        document.getElementById('error-message').textContent = 'Tu nivel es demasiado bajo para esta zona. Sube de nivel antes de intentar explorarla.';
        showModal('error-modal');
        return;
    }

    // Comprobar stamina
    if (playerData.stamina < zone.stamina) {
        // Mostrar modal de error
        document.getElementById('error-message').textContent = `No tienes suficiente energía para explorar esta zona. Necesitas ${zone.stamina} de energía.`;
        showModal('error-modal');
        return;
    }

    // Guardar la zona seleccionada
    currentZone = zone;

    // Mostrar selección de personaje
    document.getElementById('zone-selection').classList.add('hidden');
    document.getElementById('character-selection').classList.remove('hidden');

    // Actualizar lista de personajes disponibles
    updateExplorationCharacterList();
    console.log("Zona seleccionada:", zone.name);
}

// Función para iniciar la exploración
function startExploration() {
    console.log("Iniciando exploración...");
    const characterId = localStorage.getItem('rpg_exploration_character');
    if (!characterId) {
        // Mostrar modal de error
        document.getElementById('error-message').textContent = 'Selecciona un personaje para explorar la zona.';
        showModal('error-modal');
        return;
    }

    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === characterId);

    if (!character) {
        // Mostrar modal de error
        document.getElementById('error-message').textContent = 'Personaje no encontrado. Por favor, selecciona otro.';
        showModal('error-modal');
        return;
    }

    // Iniciar la exploración
    currentExploration = {
        character: character,
        zone: currentZone,
        combatLog: [],
        rewards: {
            experience: 0,
            gold: 0,
            items: []
        },
        enemiesDefeated: 0,
        totalEnemies: currentZone.enemies
    };

    // Consumir energía
    playerData.stamina -= currentZone.stamina;
    savePlayerData(playerData);

    // Actualizar UI
    document.getElementById('character-selection').classList.add('hidden');
    document.getElementById('exploration-result').classList.remove('hidden');

    // Ejecutar el primer combate
    exploreCombat();

    console.log("Exploración iniciada con " + character.name + " en " + currentZone.name);
}

// Función para continuar la exploración (siguientes combates)
function continueExploration() {
    if (currentExploration.enemiesDefeated >= currentExploration.totalEnemies) {
        // Exploración completada
        finishExploration();
        return;
    }

    // Siguiente combate
    exploreCombat();
}

// Función para ejecutar un combate de exploración
function exploreCombat() {
    console.log("Ejecutando combate en exploración...");
    const combatLog = document.getElementById('combat-log');
    const rewards = document.getElementById('rewards');

    // Generar enemigo según la zona
    const enemy = generateEnemy(
        currentExploration.zone.name,
        currentExploration.zone.level,
        currentExploration.zone.difficulty
    );

    // Mostrar mensaje de inicio
    combatLog.innerHTML = `<p>Explorando ${currentExploration.zone.name}...</p>`;
    combatLog.innerHTML += `<p>¡${currentExploration.character.name} se encuentra con ${enemy.name}!</p>`;

    // Simular combate (ya que startCombat puede no estar definido correctamente)
    let combatResult;

    try {
        // Intentar usar startCombat si está disponible
        if (typeof startCombat === 'function') {
            combatResult = startCombat(currentExploration.character, enemy, currentExploration.zone.id);
        } else {
            // Simulación simple si startCombat no está disponible
            console.log("Usando combate simulado...");
            combatResult = simulateCombat(currentExploration.character, enemy);
        }
    } catch (e) {
        console.error("Error en el combate:", e);
        // Simulación de emergencia
        combatResult = simulateCombat(currentExploration.character, enemy);
    }

    // Cuando el combate termina (ya sea por Promise o directamente)
    const processCombatResult = (result) => {
        console.log("Procesando resultado de combate:", result);

        // Mostrar resultados del combate
        combatLog.innerHTML = '';
        result.combatLog.forEach(log => {
            combatLog.innerHTML += `<p>${log}</p>`;
        });

        // Actualizar recompensas totales
        currentExploration.rewards.experience += result.rewards.experience;
        currentExploration.rewards.gold += result.rewards.gold;

        // Asegurar que items es un array
        if (!currentExploration.rewards.items) {
            currentExploration.rewards.items = [];
        }

        // Añadir items encontrados
        if (result.rewards.items && result.rewards.items.length > 0) {
            currentExploration.rewards.items = currentExploration.rewards.items.concat(result.rewards.items);
        }

        // Actualizar contador de enemigos
        if (result.victory) {
            currentExploration.enemiesDefeated++;
        }

        // Mostrar progreso y recompensas actuales
        rewards.innerHTML = `
            <p>Progreso: ${currentExploration.enemiesDefeated}/${currentExploration.totalEnemies} enemigos</p>
            <p>Experiencia acumulada: ${currentExploration.rewards.experience}</p>
            <p>Oro acumulado: ${currentExploration.rewards.gold}</p>
            <p>Items encontrados: ${currentExploration.rewards.items.length}</p>
        `;

        // Actualizar botón de continuar
        if (currentExploration.enemiesDefeated >= currentExploration.totalEnemies) {
            document.getElementById('continue-exploration').textContent = 'Finalizar Exploración';
        } else {
            document.getElementById('continue-exploration').textContent = 'Continuar Exploración';
        }
    };

    // Manejar resultado ya sea Promise o directo
    if (combatResult instanceof Promise) {
        combatResult.then(processCombatResult);
    } else {
        processCombatResult(combatResult);
    }
}

// Función para simular un combate (fallback si startCombat no está disponible)
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
        remainingHealth: characterHealth
    };
}

// Función para finalizar la exploración
function finishExploration() {
    console.log("Finalizando exploración...");

    // Aplicar todas las recompensas al personaje
    let result;
    try {
        if (typeof applyRewards === 'function') {
            result = applyRewards(currentExploration.character.id, currentExploration.rewards);
        } else {
            // Aplicar recompensas manualmente si la función no existe
            result = applyRewardsManual(currentExploration.character.id, currentExploration.rewards);
        }
    } catch (e) {
        console.error("Error al aplicar recompensas:", e);
        // Fallback
        result = applyRewardsManual(currentExploration.character.id, currentExploration.rewards);
    }

    // Mostrar mensaje final
    const combatLog = document.getElementById('combat-log');
    combatLog.innerHTML = `<p>¡Exploración completada!</p>`;

    if (result.levelUps > 0) {
        combatLog.innerHTML += `<p>¡${currentExploration.character.name} ha subido ${result.levelUps} nivel(es)!</p>`;
    }

    // Items encontrados
    if (currentExploration.rewards.items && currentExploration.rewards.items.length > 0) {
        const itemList = currentExploration.rewards.items.map(item => `<li>${item.name}</li>`).join('');
        combatLog.innerHTML += `<p>Items encontrados:</p><ul>${itemList}</ul>`;
    }

    // Actualizar el botón de continuar
    document.getElementById('continue-exploration').textContent = 'Volver a Zonas';
    document.getElementById('continue-exploration').onclick = function() {
        // Volver a la pantalla de selección de zona
        document.getElementById('exploration-result').classList.add('hidden');
        document.getElementById('zone-selection').classList.remove('hidden');

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

        // Resetear event listener
        document.getElementById('continue-exploration').onclick = continueExploration;
    };

    console.log("Exploración finalizada con éxito");
}

// Función para aplicar recompensas manualmente si applyRewards no está disponible
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