// Combat.js - Sistema de combate automático

// Inicialización del módulo de combate
function initCombat() {
    // No hay event listeners iniciales para el módulo de combate
    // Ya que el combate es automático y se inicia desde el módulo de exploración
}

// Clase para enemigos
class Enemy {
    constructor(name, level, stats, drops = []) {
        this.name = name;
        this.level = level;
        this.stats = stats;
        this.currentHealth = stats.health;
        this.drops = drops;
    }
}

// Función para generar un enemigo según la zona y nivel
function generateEnemy(zoneName, zoneLevel, difficulty = 1) {
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
    return new Enemy(enemyName, zoneLevel, stats);
}

// Función para iniciar un combate automático
function startCombat(character, enemy, zoneId) {
    return new Promise((resolve) => {
        // Clonar personaje y enemigo para evitar modificar los originales
        const combatCharacter = JSON.parse(JSON.stringify(character));
        const combatEnemy = JSON.parse(JSON.stringify(enemy));

        // Preparar personaje para el combate
        combatCharacter.currentHealth = combatCharacter.stats.health;

        // Registro de combate
        const combatLog = [];
        combatLog.push(`¡${combatCharacter.name} se encuentra con ${combatEnemy.name}!`);

        // Aplicar buffs temporales si existen
        if (combatCharacter.buffs && combatCharacter.buffs.length > 0) {
            combatCharacter.buffs.forEach(buff => {
                combatLog.push(`${combatCharacter.name} tiene un buff de ${buff.value} en ${buff.stat} durante ${buff.duration} turnos.`);
                combatCharacter.stats[buff.stat] += buff.value;
            });
        }

        // Determinar quién ataca primero basado en velocidad
        let characterTurn = combatCharacter.stats.speed >= combatEnemy.stats.speed;

        // Bucle de combate
        let round = 1;
        while (combatCharacter.currentHealth > 0 && combatEnemy.currentHealth > 0) {
            combatLog.push(`--- Turno ${round} ---`);

            // Turno del personaje
            if (characterTurn) {
                // Calcular daño
                const damage = Math.max(1, combatCharacter.stats.attack - combatEnemy.stats.defense);
                combatEnemy.currentHealth = Math.max(0, combatEnemy.currentHealth - damage);

                combatLog.push(`${combatCharacter.name} ataca a ${combatEnemy.name} causando ${damage} de daño. ${combatEnemy.name} queda con ${combatEnemy.currentHealth} de salud.`);

                // Comprobar si el enemigo ha sido derrotado
                if (combatEnemy.currentHealth <= 0) {
                    combatLog.push(`¡${combatCharacter.name} ha derrotado a ${combatEnemy.name}!`);
                    break;
                }
            }
            // Turno del enemigo
            else {
                // Calcular daño
                const damage = Math.max(1, combatEnemy.stats.attack - combatCharacter.stats.defense);
                combatCharacter.currentHealth = Math.max(0, combatCharacter.currentHealth - damage);

                combatLog.push(`${combatEnemy.name} ataca a ${combatCharacter.name} causando ${damage} de daño. ${combatCharacter.name} queda con ${combatCharacter.currentHealth} de salud.`);

                // Comprobar si el personaje ha sido derrotado
                if (combatCharacter.currentHealth <= 0) {
                    combatLog.push(`¡${combatCharacter.name} ha sido derrotado por ${combatEnemy.name}!`);
                    break;
                }
            }

            // Cambiar el turno
            characterTurn = !characterTurn;
            round++;
        }

        // Determinar el resultado del combate
        const victory = combatCharacter.currentHealth > 0;

        // Generar recompensas si hay victoria
        let rewards = {
            experience: 0,
            gold: 0,
            items: []
        };

        if (victory) {
            // Calcular experiencia
            rewards.experience = calculateExperience(enemy.level, character.level);

            // Calcular oro
            rewards.gold = calculateGold(enemy.level);

            // Generar drops si aplica
            if (Math.random() < 0.7) { // 70% de probabilidad de drop
                const dropCount = Math.floor(Math.random() * 2) + 1; // 1-2 items
                rewards.items = generateRandomDrop(zoneId, dropCount);
            }

            combatLog.push(`${character.name} gana ${rewards.experience} puntos de experiencia y ${rewards.gold} oro.`);

            if (rewards.items.length > 0) {
                const itemNames = rewards.items.map(item => item.name).join(', ');
                combatLog.push(`¡${character.name} ha encontrado: ${itemNames}!`);
            }
        } else {
            // Penalización por derrota
            rewards.experience = Math.floor(calculateExperience(enemy.level, character.level) * 0.2); // 20% de la exp normal
            combatLog.push(`${character.name} escapa del combate y gana ${rewards.experience} puntos de experiencia.`);
        }

        // Reducir duración de buffs
        if (character.buffs && character.buffs.length > 0) {
            character.buffs = character.buffs.map(buff => {
                buff.duration--;
                return buff;
            }).filter(buff => buff.duration > 0);

            // Quitar los efectos de los buffs expirados
            updateCharacterStats(character);
        }

        // Devolver el resultado del combate
        resolve({
            victory,
            combatLog,
            rewards,
            remainingHealth: combatCharacter.currentHealth
        });
    });
}

// Función para calcular la experiencia ganada
function calculateExperience(enemyLevel, characterLevel) {
    const baseExp = 20 * enemyLevel;

    // Ajustar según diferencia de nivel
    const levelDiff = enemyLevel - characterLevel;
    let multiplier = 1;

    if (levelDiff > 0) {
        // Bonificación por enemigo de mayor nivel
        multiplier = 1 + (levelDiff * 0.2);
    } else if (levelDiff < 0) {
        // Penalización por enemigo de menor nivel
        multiplier = Math.max(0.1, 1 + (levelDiff * 0.1));
    }

    return Math.floor(baseExp * multiplier);
}

// Función para calcular el oro ganado
function calculateGold(enemyLevel) {
    const baseGold = 10 * enemyLevel;
    const randomFactor = 0.8 + (Math.random() * 0.4); // Entre 0.8 y 1.2

    return Math.floor(baseGold * randomFactor);
}

// Función para aplicar las recompensas del combate al personaje
function applyRewards(characterId, rewards) {
    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === characterId);

    if (!character) return false;

    // Añadir experiencia
    character.experience += rewards.experience;

    // Añadir oro
    playerData.gold += rewards.gold;

    // Añadir items al inventario
    if (rewards.items && rewards.items.length > 0) {
        playerData.inventory = playerData.inventory.concat(rewards.items);
    }

    // Comprobar si el personaje sube de nivel
    const levelUps = checkLevelUp(character);

    // Guardar cambios
    savePlayerData(playerData);

    return {
        success: true,
        levelUps
    };
}

// Función para comprobar si un personaje sube de nivel
function checkLevelUp(character) {
    let levelUps = 0;
    let expNeeded = character.level * 100;

    // Mientras tenga suficiente experiencia para subir de nivel
    while (character.experience >= expNeeded) {
        // Subir de nivel
        character.level++;
        character.experience -= expNeeded;
        levelUps++;

        // Actualizar estadísticas
        updateCharacterStats(character);

        // Actualizar exp necesaria para el siguiente nivel
        expNeeded = character.level * 100;
    }

    return levelUps;
}