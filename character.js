// Character.js - Clases y funciones para los personajes

// Constantes de clases de personajes
const CHARACTER_CLASSES = {
    WARRIOR: {
        name: 'Guerrero',
        description: 'Especialista en combate cuerpo a cuerpo con gran resistencia.',
        baseStats: {
            health: 120,
            attack: 15,
            defense: 10,
            speed: 8
        },
        growthRates: {
            health: 12,
            attack: 3,
            defense: 2,
            speed: 1
        }
    },
    MAGE: {
        name: 'Mago',
        description: 'Domina la magia elemental con gran poder de ataque pero poca defensa.',
        baseStats: {
            health: 80,
            attack: 25,
            defense: 5,
            speed: 10
        },
        growthRates: {
            health: 8,
            attack: 5,
            defense: 1,
            speed: 2
        }
    },
    ARCHER: {
        name: 'Arquero',
        description: 'Ataca desde la distancia con gran precisión y velocidad.',
        baseStats: {
            health: 90,
            attack: 18,
            defense: 7,
            speed: 15
        },
        growthRates: {
            health: 9,
            attack: 4,
            defense: 1,
            speed: 3
        }
    },
    HEALER: {
        name: 'Sanador',
        description: 'Especialista en curación con habilidades de apoyo.',
        baseStats: {
            health: 100,
            attack: 10,
            defense: 8,
            speed: 12
        },
        growthRates: {
            health: 10,
            attack: 2,
            defense: 2,
            speed: 2
        }
    }
};

// Constantes de roles de personajes
const CHARACTER_ROLES = {
    TANK: 'Tanque',
    DPS: 'Daño',
    SUPPORT: 'Apoyo'
};

// Inicialización del módulo de personajes
function initCharacters() {
    // Event listener para la selección de personajes
    document.getElementById('character-list').addEventListener('click', function(e) {
        const characterCard = e.target.closest('.character-card');
        if (characterCard) {
            const characterId = characterCard.getAttribute('data-id');
            selectCharacter(characterId);
        }
    });

    // Event listener para subir de nivel
    document.getElementById('level-up-button').addEventListener('click', levelUpCharacter);
}

// Función para cargar los personajes del jugador
function loadCharacters() {
    refreshCharacterList();
}

// Función para actualizar la lista de personajes
function refreshCharacterList() {
    console.log("Actualizando lista de personajes...");
    const characterList = document.getElementById('character-list');
    if (!characterList) return;

    characterList.innerHTML = '';

    const playerData = getPlayerData();
    console.log("Datos del jugador:", playerData);

    if (!playerData || !playerData.characters || playerData.characters.length === 0) {
        characterList.innerHTML = '<p>No tienes personajes. Dirígete a la tienda para comprar uno.</p>';
        return;
    }

    playerData.characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';
        characterCard.setAttribute('data-id', character.id);

        characterCard.innerHTML = `
            <h3>${character.name}</h3>
            <p>Clase: ${CHARACTER_CLASSES[character.class].name}</p>
            <p>Nivel: ${character.level}</p>
            <p>Salud: ${character.stats.health}</p>
        `;

        characterList.appendChild(characterCard);
    });

    console.log(`Lista de personajes actualizada con ${playerData.characters.length} personajes.`);
}

// Función para crear un nuevo personaje
function createCharacter(name, characterClass, role) {
    console.log(`Creando personaje: ${name}, Clase: ${characterClass}`);
    const playerData = getPlayerData();

    // Validar entrada
    if (!name || !CHARACTER_CLASSES[characterClass]) {
        console.error("Datos de personaje inválidos");
        return null;
    }

    // Crear ID único
    const characterId = Date.now().toString();

    // Crear personaje con estadísticas base
    const baseStats = CHARACTER_CLASSES[characterClass].baseStats;

    const newCharacter = {
        id: characterId,
        name: name,
        class: characterClass,
        role: role || CHARACTER_ROLES.DPS,
        level: 1,
        experience: 0,
        stats: { ...baseStats },
        equipment: {}
    };

    // Añadir a la lista de personajes
    if (!playerData.characters) {
        playerData.characters = [];
    }

    playerData.characters.push(newCharacter);
    savePlayerData(playerData);

    console.log(`Personaje creado con ID: ${characterId}`);
    console.log("Personajes actuales:", playerData.characters);

    // Intentar actualizar todas las listas de personajes
    try {
        refreshCharacterList();
    } catch (e) {
        console.error("Error al actualizar lista de personajes", e);
    }

    try {
        if (typeof updateExplorationCharacterList === 'function') {
            updateExplorationCharacterList();
        }
    } catch (e) {
        console.error("Error al actualizar lista de exploración", e);
    }

    return newCharacter;
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

    const playerData = getPlayerData();
    if (!playerData || !playerData.characters || playerData.characters.length === 0) {
        explorationCharacterList.innerHTML = '<p>No tienes personajes disponibles para explorar.</p>';
        return;
    }

    playerData.characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';
        characterCard.setAttribute('data-id', character.id);

        characterCard.innerHTML = `
            <h3>${character.name}</h3>
            <p>Clase: ${CHARACTER_CLASSES[character.class].name}</p>
            <p>Nivel: ${character.level}</p>
            <p>Salud: ${character.stats.health}</p>
        `;

        explorationCharacterList.appendChild(characterCard);
    });

    // Event listener para selección de personaje
    document.querySelectorAll('#exploration-character-list .character-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('#exploration-character-list .character-card').forEach(c => {
                c.classList.remove('selected');
            });
            this.classList.add('selected');

            const characterId = this.getAttribute('data-id');
            localStorage.setItem('rpg_exploration_character', characterId);
        });
    });

    console.log(`Lista de personajes para exploración actualizada con ${playerData.characters.length} personajes.`);
}
// Función para subir de nivel a un personaje
function levelUpCharacter() {
    const selectedCharacterId = localStorage.getItem('rpg_selected_character');
    if (!selectedCharacterId) return;

    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === selectedCharacterId);

    if (!character) return;

    // Comprobar si el personaje tiene suficiente experiencia
    const expNeeded = character.level * 100;
    if (character.experience < expNeeded) {
        // Mostrar modal de error
        document.getElementById('error-message').textContent = `Necesitas ${expNeeded - character.experience} puntos de experiencia más para subir de nivel.`;
        showModal('error-modal');
        return;
    }

    // Mostrar el modal de confirmación
    document.getElementById('confirm-message').textContent = `¿Estás seguro de que quieres subir de nivel a ${character.name}?`;
    document.getElementById('confirm-button').onclick = function() {
        // Subir de nivel
        character.level++;
        character.experience -= expNeeded;

        // Actualizar estadísticas
        updateCharacterStats(character);

        // Guardar cambios
        savePlayerData(playerData);

        // Actualizar UI
        selectCharacter(selectedCharacterId);

        // Mostrar modal de éxito
        document.getElementById('success-message').textContent = `¡${character.name} ha subido al nivel ${character.level}!`;
        showModal('success-modal');

        // Cerrar modal de confirmación
        closeAllModals();
    };

    document.getElementById('cancel-button').onclick = function() {
        closeAllModals();
    };

    showModal('confirm-modal');
}

// Función para actualizar las estadísticas de un personaje basado en su nivel
function updateCharacterStats(character) {
    // Reiniciar estadísticas base según la clase y nivel
    const baseStats = CHARACTER_CLASSES[character.class].baseStats;
    const growthRates = CHARACTER_CLASSES[character.class].growthRates;

    character.stats = {
        health: baseStats.health + (growthRates.health * (character.level - 1)),
        attack: baseStats.attack + (growthRates.attack * (character.level - 1)),
        defense: baseStats.defense + (growthRates.defense * (character.level - 1)),
        speed: baseStats.speed + (growthRates.speed * (character.level - 1))
    };

    // Si hay equipo, añadir sus bonus
    if (character.equipment) {
        Object.values(character.equipment).forEach(item => {
            if (item.statBonus) {
                Object.keys(item.statBonus).forEach(stat => {
                    character.stats[stat] += item.statBonus[stat];
                });
            }
        });
    }
}

// Función para seleccionar un personaje
function selectCharacter(characterId) {
    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === characterId);

    if (!character) return;

    // Marcar la tarjeta seleccionada
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });

    const selectedCard = document.querySelector(`.character-card[data-id="${characterId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    // Mostrar detalles del personaje
    const characterDetails = document.getElementById('character-details');
    if (characterDetails) {
        characterDetails.classList.remove('hidden');

        document.getElementById('character-name').textContent = character.name;

        // Mostrar estadísticas
        const characterStats = document.getElementById('character-stats');
        characterStats.innerHTML = `
            <p>Clase: ${CHARACTER_CLASSES[character.class].name}</p>
            <p>Rol: ${character.role}</p>
            <p>Nivel: ${character.level}</p>
            <p>Experiencia: ${character.experience}/${character.level * 100}</p>
            <p>Salud: ${character.stats.health}</p>
            <p>Ataque: ${character.stats.attack}</p>
            <p>Defensa: ${character.stats.defense}</p>
            <p>Velocidad: ${character.stats.speed}</p>
        `;
    }

    // Guardar el personaje seleccionado
    localStorage.setItem('rpg_selected_character', characterId);
}