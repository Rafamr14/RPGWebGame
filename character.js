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
        characterList.innerHTML = '<div class="empty-list-message"><p>No tienes personajes. Dirígete a la tienda para comprar uno.</p></div>';
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

        characterCard.innerHTML = `
            <h3>${character.name}</h3>
            <p>Clase: ${CHARACTER_CLASSES[character.class].name}</p>
            <p>Nivel: ${character.level}</p>
            <p>Salud: ${character.stats.health}</p>
        `;

        // Aplicar estilo especial para la clase
        characterCard.style.borderLeft = `4px solid ${classColor}`;

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
        showModal('error-modal');
        document.getElementById('error-message').textContent = `Necesitas ${expNeeded - character.experience} puntos de experiencia más para subir de nivel.`;
        return;
    }

    // Mostrar el modal de confirmación
    showModal('confirm-modal');
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
        showModal('success-modal');
        document.getElementById('success-message').textContent = `¡${character.name} ha subido al nivel ${character.level}!`;
    };
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

        // Actualizar nombre y nivel
        document.getElementById('character-name').textContent = character.name;

        // Calcular y mostrar barra de experiencia
        const currentExp = character.experience;
        const maxExp = character.level * 100;
        const expPercentage = (currentExp / maxExp) * 100;

        const xpProgress = characterDetails.querySelector('.xp-progress');
        const xpText = characterDetails.querySelector('.xp-text');

        if (xpProgress && xpText) {
            xpProgress.style.width = `${expPercentage}%`;
            xpText.textContent = `Nivel ${character.level} - ${currentExp}/${maxExp} XP`;
        }

        // Mostrar estadísticas en el nuevo formato
        const characterStats = document.getElementById('character-stats');
        characterStats.innerHTML = `
            <div class="stat-item class">
                <span class="stat-name">Clase</span>
                <span class="stat-value">${CHARACTER_CLASSES[character.class].name}</span>
            </div>
            <div class="stat-item level">
                <span class="stat-name">Nivel</span>
                <span class="stat-value">${character.level}</span>
            </div>
            <div class="stat-item health">
                <span class="stat-name">Salud</span>
                <span class="stat-value">${character.stats.health}</span>
            </div>
            <div class="stat-item attack">
                <span class="stat-name">Ataque</span>
                <span class="stat-value">${character.stats.attack}</span>
            </div>
            <div class="stat-item defense">
                <span class="stat-name">Defensa</span>
                <span class="stat-value">${character.stats.defense}</span>
            </div>
            <div class="stat-item speed">
                <span class="stat-name">Velocidad</span>
                <span class="stat-value">${character.stats.speed}</span>
            </div>
        `;

        // Mostrar equipamiento
        const equipmentSlots = document.getElementById('equipment-slots');

        // Definir los slots disponibles
        const slots = [
            { id: 'weapon', name: 'Arma' },
            { id: 'head', name: 'Casco' },
            { id: 'body', name: 'Armadura' },
            { id: 'accessory', name: 'Amuleto' }
        ];

        equipmentSlots.innerHTML = '';

        slots.forEach(slot => {
            const equippedItem = character.equipment && character.equipment[slot.id];
            const slotElement = document.createElement('div');

            slotElement.className = `equipment-slot ${equippedItem ? 'equipped' : 'empty'}`;
            slotElement.setAttribute('data-slot', slot.id);

            slotElement.innerHTML = `
                <h5>${slot.name}</h5>
                <p>${equippedItem ? equippedItem.name : 'Vacío'}</p>
            `;

            // Añadir evento para equipar/desequipar
            slotElement.addEventListener('click', function() {
                showEquipmentOptions(characterId, slot.id);
            });

            equipmentSlots.appendChild(slotElement);
        });

        // Verificar si puede subir de nivel
        const levelUpButton = document.getElementById('level-up-button');
        const expNeeded = character.level * 100;

        if (character.experience >= expNeeded) {
            levelUpButton.removeAttribute('disabled');
            levelUpButton.classList.remove('btn-disabled');
        } else {
            levelUpButton.setAttribute('disabled', 'true');
            levelUpButton.classList.add('btn-disabled');
            // También actualizar el texto del botón
            levelUpButton.textContent = `Subir de Nivel (${character.experience}/${expNeeded} XP)`;
        }
    }

    // Guardar el personaje seleccionado
    localStorage.setItem('rpg_selected_character', characterId);
}

// Función para mostrar opciones de equipamiento
function showEquipmentOptions(characterId, slotId) {
    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === characterId);

    if (!character) return;

    // Obtener items equipables para este slot
    const equipableItems = playerData.inventory.filter(item =>
        item.equipable && item.slot === slotId
    );

    // Si hay un item equipado, añadir opción para desequipar
    const currentlyEquipped = character.equipment && character.equipment[slotId];

    // Si no hay items que mostrar y no hay nada equipado, mostrar mensaje
    if (equipableItems.length === 0 && !currentlyEquipped) {
        showModal('error-modal');
        document.getElementById('error-message').textContent = 'No tienes items que puedas equipar en este slot.';
        return;
    }

    // Crear modal de equipamiento
    showModal('equipment-modal');

    // Crear contenido para el modal
    const modalBody = document.querySelector('#equipment-modal .modal-body');

    if (!modalBody) {
        console.error("Modal de equipamiento no encontrado");
        return;
    }

    let content = `<h4>Equipamiento para ${character.name}</h4>`;

    // Si hay un item equipado, mostrar opción para desequipar
    if (currentlyEquipped) {
        content += `
            <div class="equipment-option currently-equipped">
                <h5>Actualmente equipado</h5>
                <div class="item-card">
                    <div class="item-name">${currentlyEquipped.name}</div>
                    <div class="item-stats">
                        ${getItemStatsHtml(currentlyEquipped)}
                    </div>
                    <button class="unequip-button" data-character="${characterId}" data-slot="${slotId}">Desequipar</button>
                </div>
            </div>
        `;
    }

    // Mostrar items disponibles
    if (equipableItems.length > 0) {
        content += `<div class="equipment-options"><h5>Items disponibles</h5><div class="equipment-grid">`;

        equipableItems.forEach(item => {
            // Determinar color según rareza
            let rarityColor = '#aaaaaa'; // Por defecto (común)
            if (item.rarity) {
                switch(item.rarity) {
                    case 'Poco común': rarityColor = '#00aa00'; break;
                    case 'Raro': rarityColor = '#0000aa'; break;
                    case 'Épico': rarityColor = '#aa00aa'; break;
                    case 'Legendario': rarityColor = '#aaaa00'; break;
                }
            }

            content += `
                <div class="item-card" style="border-color: ${rarityColor}">
                    <div class="item-name">${item.name}</div>
                    <div class="item-stats">
                        ${getItemStatsHtml(item)}
                    </div>
                    <button class="equip-button" data-character="${characterId}" data-item="${item.id}">Equipar</button>
                </div>
            `;
        });

        content += `</div></div>`;
    }

    modalBody.innerHTML = content;

    // Añadir event listeners para los botones
    modalBody.querySelectorAll('.equip-button').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item');
            equipItem(characterId, itemId);
            closeAllModals();
            selectCharacter(characterId); // Actualizar vista
        });
    });

    modalBody.querySelectorAll('.unequip-button').forEach(button => {
        button.addEventListener('click', function() {
            const slotId = this.getAttribute('data-slot');
            unequipItem(characterId, slotId);
            closeAllModals();
            selectCharacter(characterId); // Actualizar vista
        });
    });
}

// Función para obtener HTML con las estadísticas de un item
function getItemStatsHtml(item) {
    let statsHtml = '';

    if (item.level) {
        statsHtml += `<div class="item-stat">Nivel: ${item.level}</div>`;
    }

    if (item.statBonus) {
        Object.keys(item.statBonus).forEach(stat => {
            const bonus = item.statBonus[stat];
            statsHtml += `<div class="item-stat">${getStatName(stat)}: +${bonus}</div>`;
        });
    }

    return statsHtml || '<div class="item-stat">Sin bonificaciones</div>';
}

// Función para equipar un item
function equipItem(characterId, itemId) {
    console.log(`Equipando item ${itemId} al personaje ${characterId}`);

    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === characterId);
    const item = playerData.inventory.find(i => i.id === itemId);

    if (!character || !item || !item.equipable) {
        return false;
    }

    // Inicializar el objeto de equipment si no existe
    if (!character.equipment) {
        character.equipment = {};
    }

    // Si ya hay un item en ese slot, devolverlo al inventario
    const currentEquipped = character.equipment[item.slot];

    // Quitar el item del inventario
    const itemIndex = playerData.inventory.findIndex(i => i.id === itemId);
    if (itemIndex !== -1) {
        playerData.inventory.splice(itemIndex, 1);
    }

    // Colocar el item anteriormente equipado (si existe) en el inventario
    if (currentEquipped) {
        playerData.inventory.push(currentEquipped);
    }

    // Equipar el nuevo item
    character.equipment[item.slot] = item;

    // Actualizar estadísticas del personaje
    updateCharacterStats(character);

    // Guardar cambios
    savePlayerData(playerData);

    console.log(`Item ${item.name} equipado correctamente`);
    return true;
}

// Función para desequipar un item
function unequipItem(characterId, slotId) {
    console.log(`Desequipando item del slot ${slotId} del personaje ${characterId}`);

    const playerData = getPlayerData();
    const character = playerData.characters.find(c => c.id === characterId);

    if (!character || !character.equipment || !character.equipment[slotId]) {
        return false;
    }

    // Obtener el item equipado
    const equippedItem = character.equipment[slotId];

    // Quitar el item del equipment
    delete character.equipment[slotId];

    // Devolver el item al inventario
    playerData.inventory.push(equippedItem);

    // Actualizar estadísticas del personaje
    updateCharacterStats(character);

    // Guardar cambios
    savePlayerData(playerData);

    console.log(`Item ${equippedItem.name} desequipado correctamente`);
    return true;
}

// Función para obtener el nombre de una estadística
function getStatName(stat) {
    switch(stat) {
        case 'health':
            return 'Salud';
        case 'attack':
            return 'Ataque';
        case 'defense':
            return 'Defensa';
        case 'speed':
            return 'Velocidad';
        default:
            return stat;
    }
}