// UI.js - Interfaces de usuario y menús - Versión mejorada

// Inicialización del módulo UI
function initUI() {
    console.log("Inicializando UI...");

    // Verificar si hay un usuario autenticado
    if (!getCurrentUser()) {
        console.log("No hay usuario autenticado, mostrando pantalla de login");
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        return;
    }

    // Event listeners para elementos de UI generales
    try {
        // Cargar y mostrar la tienda
        document.querySelector('.nav-button[data-screen="shop-screen"]').addEventListener('click', function() {
            loadShop();
        });

        // Event listeners para pestañas de la tienda
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchShopTab(tabId);
            });
        });

        // Event listener para comprar en la tienda
        document.getElementById('buy-shop-item').addEventListener('click', function() {
            buyShopItem();
        });

        console.log("Eventos de UI configurados correctamente");
    } catch (e) {
        console.error("Error al configurar eventos de UI:", e);
    }
}

// Función para cargar la tienda
function loadShop() {
    console.log("Cargando tienda...");

    // Verificar si hay un usuario autenticado
    if (!getCurrentUser()) {
        console.log("No hay usuario autenticado, redireccionando a login");
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        return;
    }

    // Mostrar la tienda de personajes por defecto
    switchShopTab('characters');
}

// Función para cambiar de pestaña en la tienda
function switchShopTab(tabId) {
    console.log("Cambiando a pestaña:", tabId);
    // Actualizar estado visual
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.shop-tab[data-tab="${tabId}"]`).classList.add('active');

    // Ocultar todas las secciones de la tienda
    document.querySelectorAll('.shop-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Mostrar la sección correspondiente
    if (tabId === 'characters') {
        document.getElementById('shop-characters').classList.remove('hidden');
        loadShopCharacters();
    } else if (tabId === 'items') {
        document.getElementById('shop-items').classList.remove('hidden');
        loadShopItems();
    }
}

// Función para verificar si el jugador ya tiene un personaje de una clase específica
function hasCharacterClass(characterClass) {
    // Obtener datos actualizados directamente del localStorage para evitar problemas de caché
    const currentUser = localStorage.getItem('rpg_current_session');
    if (!currentUser) return false;

    const playerDataRaw = localStorage.getItem(`rpg_player_${currentUser}`);
    if (!playerDataRaw) return false;

    try {
        const playerData = JSON.parse(playerDataRaw);
        if (!playerData || !playerData.characters || playerData.characters.length === 0) {
            return false;
        }

        // Verificar si existe algún personaje con esta clase
        return playerData.characters.some(character => character.class === characterClass);
    } catch (e) {
        console.error("Error al verificar personajes:", e);
        return false;
    }
}

// Función para cargar la tienda de personajes
function loadShopCharacters() {
    console.log("Cargando tienda de personajes...");

    // Verificar si hay un usuario autenticado
    if (!getCurrentUser()) {
        console.log("No hay usuario autenticado, redireccionando a login");
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        return;
    }

    const shopCharacterList = document.getElementById('shop-character-list');
    shopCharacterList.innerHTML = '';

    // Crear lista de personajes disponibles para comprar
    const characterClasses = Object.keys(CHARACTER_CLASSES);

    // Verificar si hay oro suficiente - obtener datos frescos
    const playerData = getPlayerData();
    if (!playerData) {
        console.error("No se pudieron obtener datos del jugador");
        return;
    }

    const playerGold = playerData.gold;

    console.log("Personajes actuales:", playerData.characters);

    // Nombres predeterminados por clase
    const defaultNames = {
        WARRIOR: 'Guerrero',
        MAGE: 'Mago',
        ARCHER: 'Arquero',
        HEALER: 'Sanador'
    };

    characterClasses.forEach(characterClass => {
        const classInfo = CHARACTER_CLASSES[characterClass];
        const characterCard = document.createElement('div');
        characterCard.className = 'shop-character';
        characterCard.setAttribute('data-class', characterClass);
        characterCard.setAttribute('data-name', defaultNames[characterClass]);

        // Comprobar si ya tiene este personaje
        const alreadyOwned = playerData.characters && playerData.characters.some(c => c.class === characterClass);
        console.log(`Clase ${characterClass}: ya comprado = ${alreadyOwned}`);

        // Precio base para comprar un personaje - 1000
        const price = 1000;
        const canAfford = playerGold >= price;

        characterCard.innerHTML = `
            <h3>${classInfo.name}</h3>
            <p>${classInfo.description}</p>
            <p>Salud base: ${classInfo.baseStats.health}</p>
            <p>Ataque base: ${classInfo.baseStats.attack}</p>
            <p>Defensa base: ${classInfo.baseStats.defense}</p>
            <p>Velocidad base: ${classInfo.baseStats.speed}</p>
            <p>Precio: ${price} oro</p>
            ${alreadyOwned
            ? '<div class="owned-label">Ya adquirido</div>'
            : `<button class="buy-character-button ${!canAfford ? 'btn-disabled' : ''}" data-class="${characterClass}" data-name="${defaultNames[characterClass]}" data-price="${price}" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? 'Comprar' : 'Oro insuficiente'}
                   </button>`
        }
        `;

        shopCharacterList.appendChild(characterCard);
    });

    // Event listeners para comprar personajes
    document.querySelectorAll('.buy-character-button:not([disabled])').forEach(button => {
        button.addEventListener('click', function() {
            const characterClass = this.getAttribute('data-class');
            const defaultName = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            buyCharacter(characterClass, defaultName, price);
        });
    });
}

// Función para cargar los items de la tienda
function loadShopItems() {
    console.log("Cargando tienda de items...");

    // Verificar si hay un usuario autenticado
    if (!getCurrentUser()) {
        console.log("No hay usuario autenticado, redireccionando a login");
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        return;
    }

    const shopItemList = document.getElementById('shop-item-list');
    shopItemList.innerHTML = '';

    try {
        // Crear lista de items para vender
        const shopItems = generateShopItems();

        // Verificar si hay oro suficiente
        const playerData = getPlayerData();
        if (!playerData) {
            console.error("No se pudieron obtener datos del jugador");
            return;
        }

        const playerGold = playerData.gold;

        shopItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'shop-item';
            itemCard.setAttribute('data-id', item.id);

            const canAfford = playerGold >= item.value;

            // Color según rareza
            if (item.rarity) {
                const rarityKey = Object.keys(ITEM_RARITIES).find(
                    key => ITEM_RARITIES[key].name === item.rarity
                );
                if (rarityKey) {
                    itemCard.style.borderColor = ITEM_RARITIES[rarityKey].color;
                    itemCard.style.borderWidth = '2px';
                    itemCard.style.borderStyle = 'solid';
                }
            }

            itemCard.innerHTML = `
                <h3>${item.name}</h3>
                <p>${getItemTypeText(item.type)}</p>
                <p>Nivel: ${item.level || 1}</p>
                <p>Precio: ${item.value} oro</p>
                ${!canAfford ? '<p class="no-gold">Oro insuficiente</p>' : ''}
            `;

            itemCard.addEventListener('click', function() {
                showShopItemDetails(item);
            });

            shopItemList.appendChild(itemCard);
        });
    } catch (e) {
        console.error("Error al cargar items de la tienda:", e);
        shopItemList.innerHTML = '<p>Error al cargar items. Por favor, inténtalo de nuevo.</p>';
    }
}

// Función para mostrar detalles de un item de la tienda
function showShopItemDetails(item) {
    const shopItemDetails = document.getElementById('shop-item-details');
    shopItemDetails.classList.remove('hidden');

    document.getElementById('shop-item-name').textContent = item.name;
    document.getElementById('shop-item-description').textContent = item.description;
    document.getElementById('shop-item-price').textContent = `Precio: ${item.value} oro`;

    // Mostrar estadísticas del item
    const shopItemStats = document.getElementById('shop-item-stats');

    let statsHtml = '';
    if (item.rarity) {
        statsHtml += `<p>Rareza: ${item.rarity}</p>`;
    }
    if (item.level) {
        statsHtml += `<p>Nivel: ${item.level}</p>`;
    }

    if (item.statBonus) {
        for (const stat in item.statBonus) {
            const bonus = item.statBonus[stat];
            statsHtml += `<p>${getStatName(stat)}: +${bonus}</p>`;
        }
    }

    if (item.effect) {
        if (item.effect.type === 'heal') {
            statsHtml += `<p>Efecto: Cura ${item.effect.value} de salud</p>`;
        } else if (item.effect.type === 'buff') {
            statsHtml += `<p>Efecto: Aumenta ${getStatName(item.effect.stat)} en ${item.effect.value} durante ${item.effect.duration} turnos</p>`;
        }
    }

    shopItemStats.innerHTML = statsHtml;

    // Comprobar si hay oro suficiente
    const playerData = getPlayerData();
    if (!playerData) {
        console.error("No se pudieron obtener datos del jugador");
        return;
    }

    const canAfford = playerData.gold >= item.value;

    // Actualizar botón de compra
    const buyButton = document.getElementById('buy-shop-item');
    buyButton.disabled = !canAfford;
    buyButton.textContent = canAfford ? 'Comprar' : 'Oro insuficiente';
    buyButton.className = canAfford ? 'btn-primary' : 'btn-disabled';

    // Guardar item actual para compra
    localStorage.setItem('rpg_shop_item', JSON.stringify(item));
}

// Función para comprar un item de la tienda
function buyShopItem() {
    // Verificar si hay un usuario autenticado
    if (!getCurrentUser()) {
        showModal('error-modal');
        document.getElementById('error-message').textContent = 'Debes iniciar sesión para realizar esta acción';
        return;
    }

    const itemJson = localStorage.getItem('rpg_shop_item');
    if (!itemJson) {
        showModal('error-modal');
        document.getElementById('error-message').textContent = 'No se ha seleccionado ningún item';
        return;
    }

    const item = JSON.parse(itemJson);
    const playerData = getPlayerData();
    if (!playerData) {
        console.error("No se pudieron obtener datos del jugador");
        return;
    }

    // Comprobar si el jugador tiene suficiente oro
    if (playerData.gold < item.value) {
        // Mostrar el modal de error
        showModal('error-modal');
        document.getElementById('error-message').textContent = 'No tienes suficiente oro para comprar este item.';
        return;
    }

    // Usar modal de confirmación en lugar de confirm
    showModal('confirm-modal');
    document.getElementById('confirm-message').textContent = `¿Estás seguro de que quieres comprar ${item.name} por ${item.value} oro?`;

    document.getElementById('confirm-button').onclick = function() {
        // Realizar la compra
        playerData.gold -= item.value;

        // Generar un nuevo ID único para el item
        item.id = `${item.id}_${Date.now()}`;

        // Asegurarse de que exista el inventario
        if (!playerData.inventory) {
            playerData.inventory = [];
        }

        playerData.inventory.push(item);
        savePlayerData(playerData);

        // Actualizar UI
        document.getElementById('shop-item-details').classList.add('hidden');
        updateGoldDisplay();
        loadShopItems(); // Recargar la lista de items

        // Mostrar modal de éxito
        closeAllModals();
        showModal('success-modal');
        document.getElementById('success-message').textContent = `Has comprado ${item.name} por ${item.value} oro.`;
    };

    document.getElementById('cancel-button').onclick = function() {
        closeAllModals();
    };
}

// Función para comprar un personaje
function buyCharacter(characterClass, defaultName, price) {
    console.log(`Intentando comprar: ${characterClass}, Nombre: ${defaultName}, Precio: ${price}`);

    // Verificar si hay un usuario autenticado
    if (!getCurrentUser()) {
        showModal('error-modal');
        document.getElementById('error-message').textContent = 'Debes iniciar sesión para realizar esta acción';
        return;
    }

    const playerData = getPlayerData();
    if (!playerData) {
        console.error("No se pudieron obtener datos del jugador");
        return;
    }

    // Comprobar si el jugador tiene suficiente oro
    if (playerData.gold < price) {
        // Mostrar el modal de error
        showModal('error-modal');
        document.getElementById('error-message').textContent = 'No tienes suficiente oro para comprar este personaje.';
        return;
    }

    // Comprobar si ya tiene un personaje de esta clase
    if (hasCharacterClass(characterClass)) {
        // Mostrar el modal de error
        showModal('error-modal');
        document.getElementById('error-message').textContent = 'Ya tienes un personaje de esta clase.';
        return;
    }

    // Usar modal de confirmación
    showModal('confirm-modal');
    document.getElementById('confirm-message').textContent = `¿Estás seguro de que quieres comprar un ${defaultName} por ${price} oro?`;

    document.getElementById('confirm-button').onclick = function() {
        console.log("Confirmando compra...");

        // Realizar la compra - primero descontar oro
        playerData.gold -= price;
        savePlayerData(playerData);

        // Actualizar oro mostrado
        updateGoldDisplay();

        // Crear el personaje usando el nombre predeterminado
        const character = createCharacter(defaultName, characterClass);

        if (!character) {
            // Mostrar modal de error
            showModal('error-modal');
            document.getElementById('error-message').textContent = 'Error al crear el personaje. Inténtalo de nuevo.';

            // Devolver el oro
            playerData.gold += price;
            savePlayerData(playerData);
            updateGoldDisplay();
            return;
        }

        console.log("Personaje comprado exitosamente:", character);

        // Actualizar UI - recargar tienda
        loadShopCharacters();

        // Intentar actualizar todas las listas de personajes
        try {
            refreshCharacterList();
        } catch (e) {
            console.error("Error al actualizar lista de personajes", e);
        }

        try {
            if (typeof updateExplorationCharacterList === 'function' && document.getElementById('exploration-character-list')) {
                updateExplorationCharacterList();
            }
        } catch (e) {
            console.error("Error al actualizar lista de exploración", e);
        }

        // Mostrar modal de éxito
        closeAllModals();
        showModal('success-modal');
        document.getElementById('success-message').textContent = `¡Has adquirido a ${character.name} por ${price} oro!`;
    };

    document.getElementById('cancel-button').onclick = function() {
        closeAllModals();
    };
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

// Función para generar items para la tienda
function generateShopItems() {
    const playerData = getPlayerData();
    if (!playerData) {
        console.error("No se pudieron obtener datos del jugador");
        return [];
    }

    const playerLevel = Math.max(1, playerData.level);

    // Generar diferentes tipos de items para vender
    const shopItems = [];

    // Si ITEM_TEMPLATES no está definido, crear algunos items básicos
    if (typeof ITEM_TEMPLATES === 'undefined') {
        console.warn("ITEM_TEMPLATES no está definido, usando valores predeterminados");

        // Crear algunos items básicos
        for (let i = 1; i <= 5; i++) {
            shopItems.push({
                id: `basic_sword_${i}`,
                name: `Espada básica ${i}`,
                type: 'weapon',
                level: i,
                value: 100 * i,
                description: `Una espada básica de nivel ${i}`
            });

            shopItems.push({
                id: `basic_armor_${i}`,
                name: `Armadura básica ${i}`,
                type: 'armor',
                level: i,
                value: 150 * i,
                description: `Una armadura básica de nivel ${i}`
            });

            shopItems.push({
                id: `health_potion_${i}`,
                name: `Poción de salud ${i}`,
                type: 'consumable',
                value: 50 * i,
                description: `Restaura ${20 * i} puntos de salud`
            });
        }

        return shopItems;
    }

    // Si ITEM_TEMPLATES está definido, usar la función normal
    try {
        // Armas
        const weaponTemplates = [ITEM_TEMPLATES.SWORD, ITEM_TEMPLATES.BOW, ITEM_TEMPLATES.STAFF];
        weaponTemplates.forEach(template => {
            // Diferentes niveles y rarezas
            shopItems.push(createShopItem(template, playerLevel, ITEM_RARITIES.COMMON));

            if (playerLevel >= 3) {
                shopItems.push(createShopItem(template, playerLevel, ITEM_RARITIES.UNCOMMON));
            }

            if (playerLevel >= 5) {
                shopItems.push(createShopItem(template, playerLevel, ITEM_RARITIES.RARE));
            }
        });

        // Armaduras
        const armorTemplates = [ITEM_TEMPLATES.HELMET, ITEM_TEMPLATES.CHESTPLATE, ITEM_TEMPLATES.LEGGINGS, ITEM_TEMPLATES.RING];
        armorTemplates.forEach(template => {
            shopItems.push(createShopItem(template, playerLevel, ITEM_RARITIES.COMMON));

            if (playerLevel >= 3) {
                shopItems.push(createShopItem(template, playerLevel, ITEM_RARITIES.UNCOMMON));
            }
        });

        // Consumibles
        const consumableTemplates = [ITEM_TEMPLATES.HEALTH_POTION, ITEM_TEMPLATES.STRENGTH_POTION];
        consumableTemplates.forEach(template => {
            const item = createShopItem(template, playerLevel);
            shopItems.push(item);
        });
    } catch (e) {
        console.error("Error al generar items para la tienda:", e);
    }

    return shopItems;
}

// Función para redirigir a una pantalla específica
function showScreen(screenId) {
    console.log(`Mostrando pantalla: ${screenId}`);

    // Verificar si hay un usuario autenticado
    if (!getCurrentUser()) {
        console.log("No hay usuario autenticado, redireccionando a login");
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        return;
    }

    // Ocultar todas las áreas de juego
    const gameAreas = document.querySelectorAll('.game-area');
    gameAreas.forEach(area => {
        area.classList.add('hidden');
    });

    // Desactivar todos los botones de navegación
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activar el botón correspondiente
    const navButton = document.querySelector(`.nav-button[data-screen="${screenId}"]`);
    if (navButton) {
        navButton.classList.add('active');
    }

    // Mostrar la pantalla solicitada
    const screenElement = document.getElementById(screenId);
    screenElement.classList.remove('hidden');

    // Disparar un evento para notificar que se mostró esta pantalla
    const event = new CustomEvent('screenShown', { detail: { screenId: screenId } });
    screenElement.dispatchEvent(event);
}

// Función para cerrar todos los modales
function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
    });
}