// Inventory.js - Sistema de inventario - Versión mejorada

// Inicialización del módulo de inventario
function initInventory() {
    console.log("Inicializando módulo de inventario...");

    // Event listener para selección de items en el inventario
    document.getElementById('inventory-container').addEventListener('click', function(e) {
        const inventoryItem = e.target.closest('.inventory-item');
        if (inventoryItem) {
            const itemId = inventoryItem.getAttribute('data-id');
            selectInventoryItem(itemId);
        }
    });

    // Event listeners para acciones de items
    document.getElementById('use-item').addEventListener('click', useSelectedItem);
    document.getElementById('equip-item').addEventListener('click', showEquipItemModal);
    document.getElementById('sell-item').addEventListener('click', showSellItemModal);
    document.getElementById('gift-item').addEventListener('click', showGiftItemModal);

    // Event listener para confirmar venta de item
    document.getElementById('confirm-sell-item').addEventListener('click', sellSelectedItem);

    // Event listener para confirmar regalo
    document.getElementById('confirm-gift').addEventListener('click', giftSelectedItem);

    // Event listeners para filtros de inventario
    document.querySelectorAll('.inventory-category').forEach(button => {
        button.addEventListener('click', function() {
            // Quitar la clase active de todos los botones
            document.querySelectorAll('.inventory-category').forEach(btn => btn.classList.remove('active'));

            // Añadir la clase active al botón clicado
            this.classList.add('active');

            // Filtrar los items
            const category = this.getAttribute('data-category');
            filterInventoryItems(category);
        });
    });

    // Event listener para búsqueda de items
    document.getElementById('inventory-search').addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        searchInventoryItems(searchTerm);
    });

    console.log("Módulo de inventario inicializado correctamente");
}

// Función para cargar el inventario del jugador
function loadInventory() {
    refreshInventory();
}

// Función para actualizar la visualización del inventario
function refreshInventory() {
    console.log("Actualizando visualización del inventario...");
    const inventoryContainer = document.getElementById('inventory-container');
    inventoryContainer.innerHTML = '';

    const playerData = getPlayerData();
    if (!playerData || !playerData.inventory || playerData.inventory.length === 0) {
        inventoryContainer.innerHTML = '<p class="empty-list-message">Tu inventario está vacío.</p>';
        document.getElementById('item-details').classList.add('hidden');
        return;
    }

    // Agrupar items similares para mostrar conteo
    const groupedItems = {};

    playerData.inventory.forEach(item => {
        // Usar el id base (sin el timestamp) para agrupar items idénticos
        const baseId = item.id.split('_').slice(0, -1).join('_');

        if (!groupedItems[baseId]) {
            groupedItems[baseId] = {
                item: item,
                count: 1,
                ids: [item.id]
            };
        } else {
            groupedItems[baseId].count++;
            groupedItems[baseId].ids.push(item.id);
        }
    });

    // Mostrar los items agrupados
    Object.values(groupedItems).forEach(groupedItem => {
        const item = groupedItem.item;
        const count = groupedItem.count;
        const itemId = groupedItem.ids[0]; // Usar el primer ID para referencia

        const inventoryItemElement = document.createElement('div');
        inventoryItemElement.className = 'inventory-item';
        inventoryItemElement.setAttribute('data-id', itemId);
        inventoryItemElement.setAttribute('data-type', item.type);
        inventoryItemElement.setAttribute('data-name', item.name.toLowerCase());
        inventoryItemElement.setAttribute('data-level', item.level || 0);

        // Color según rareza si el item tiene rareza
        if (item.rarity) {
            const rarityKey = Object.keys(ITEM_RARITIES).find(
                key => ITEM_RARITIES[key].name === item.rarity
            );
            if (rarityKey) {
                inventoryItemElement.style.borderColor = ITEM_RARITIES[rarityKey].color;
            }
        }

        inventoryItemElement.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-type">${getItemTypeText(item.type)}</div>
            ${count > 1 ? `<div class="item-count">${count}</div>` : ''}
        `;

        inventoryContainer.appendChild(inventoryItemElement);
    });

    console.log(`Inventario actualizado con ${Object.keys(groupedItems).length} tipos de items.`);
}

// Función para filtrar items del inventario
function filterInventoryItems(category) {
    console.log(`Filtrando items por categoría: ${category}`);

    const inventoryItems = document.querySelectorAll('.inventory-item');

    inventoryItems.forEach(item => {
        if (category === 'all') {
            item.style.display = '';
        } else {
            const itemType = item.getAttribute('data-type');
            if (itemType === category) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// Función para buscar items en el inventario
function searchInventoryItems(searchTerm) {
    console.log(`Buscando items: ${searchTerm}`);

    const inventoryItems = document.querySelectorAll('.inventory-item');

    inventoryItems.forEach(item => {
        const itemName = item.getAttribute('data-name');
        if (itemName.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
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

// Función para seleccionar un item del inventario
function selectInventoryItem(itemId) {
    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === itemId);

    if (!item) return;

    // Marcar el item seleccionado visualmente
    document.querySelectorAll('.inventory-item').forEach(element => {
        element.classList.remove('selected');
    });
    document.querySelector(`.inventory-item[data-id="${itemId}"]`).classList.add('selected');

    // Mostrar detalles del item
    const itemDetails = document.getElementById('item-details');
    itemDetails.classList.remove('hidden');

    document.getElementById('item-name').textContent = item.name;
    document.getElementById('item-description').textContent = item.description || 'Sin descripción disponible.';

    // Mostrar estadísticas del item
    const itemStats = document.getElementById('item-stats');

    let statsHtml = '';
    if (item.rarity) {
        statsHtml += `<p>Rareza: ${item.rarity}</p>`;
    }
    if (item.level) {
        statsHtml += `<p>Nivel: ${item.level}</p>`;
    }
    if (item.value) {
        statsHtml += `<p>Valor: ${item.value} oro</p>`;
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

    itemStats.innerHTML = statsHtml || '<p>Sin estadísticas adicionales</p>';

    // Configurar botones de acción según tipo de item
    document.getElementById('use-item').classList.add('hidden');
    document.getElementById('equip-item').classList.add('hidden');

    if (item.type === 'consumable') {
        document.getElementById('use-item').classList.remove('hidden');
    }

    if (item.equipable) {
        document.getElementById('equip-item').classList.remove('hidden');
    }

    // Guardar el item seleccionado actualmente
    localStorage.setItem('rpg_selected_item', itemId);
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

// Función para mostrar el modal de venta de item
function showSellItemModal() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === selectedItemId);

    if (!item) return;

    // Configurar el modal
    document.getElementById('sell-item-name-confirm').textContent = item.name;
    document.getElementById('sell-item-price').textContent = item.value || 50;

    // Mostrar el modal
    showModal('sell-item-modal');
}

// Función para vender el item seleccionado
function sellSelectedItem() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const playerData = getPlayerData();
    const itemIndex = playerData.inventory.findIndex(i => i.id === selectedItemId);

    if (itemIndex === -1) return;

    const item = playerData.inventory[itemIndex];
    const itemValue = item.value || 50;

    // Eliminar item del inventario
    playerData.inventory.splice(itemIndex, 1);

    // Añadir oro al jugador
    playerData.gold += itemValue;

    // Guardar cambios
    savePlayerData(playerData);

    // Actualizar UI
    refreshInventory();
    document.getElementById('item-details').classList.add('hidden');
    updateGoldDisplay();

    // Cerrar modal y mostrar mensaje de éxito
    closeAllModals();
    showSuccessMessage(`Has vendido ${item.name} por ${itemValue} oro.`);
}

// Función para mostrar el modal de equipar item
function showEquipItemModal() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === selectedItemId);

    if (!item || !item.equipable) {
        showErrorMessage('Este item no es equipable.');
        return;
    }

    // Configurar el modal
    document.getElementById('equip-item-name').textContent = item.name;

    // Generar lista de personajes
    const characterList = document.getElementById('equip-character-list');
    characterList.innerHTML = '';

    if (!playerData.characters || playerData.characters.length === 0) {
        characterList.innerHTML = '<p class="empty-list-message">No tienes personajes para equipar este item.</p>';
        return;
    }

    playerData.characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card character-card-compact';
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
            <h4>${character.name}</h4>
            <p>Nivel: ${character.level}</p>
        `;

        characterCard.style.borderLeft = `4px solid ${classColor}`;

        // Añadir evento para equipar
        characterCard.addEventListener('click', function() {
            equipItem(character.id, selectedItemId);
            closeAllModals();
            refreshInventory();
            document.getElementById('item-details').classList.add('hidden');
            showSuccessMessage(`${item.name} equipado a ${character.name}.`);
        });

        characterList.appendChild(characterCard);
    });

    // Mostrar el modal
    showModal('equip-item-modal');
}

// Función para mostrar el modal de regalo
function showGiftItemModal() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === selectedItemId);

    if (!item) return;

    // Configurar el modal
    document.getElementById('gift-item-name').textContent = item.name;
    document.getElementById('gift-username').value = '';

    // Mostrar el modal
    showModal('gift-item-modal');
}

// Función para regalar un item a otro jugador
function giftSelectedItem() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const recipientUsername = document.getElementById('gift-username').value.trim();

    if (!recipientUsername) {
        showErrorMessage('Debes introducir un nombre de usuario');
        return;
    }

    // Verificar que el usuario existe
    const users = JSON.parse(localStorage.getItem('rpg_users') || '[]');
    const recipientExists = users.some(user => user.username === recipientUsername);

    if (!recipientExists) {
        showErrorMessage('El usuario no existe');
        return;
    }

    // Verificar que no es el propio usuario
    const currentUser = getCurrentUser();
    if (recipientUsername === currentUser) {
        showErrorMessage('No puedes enviarte items a ti mismo');
        return;
    }

    const playerData = getPlayerData();
    const itemIndex = playerData.inventory.findIndex(i => i.id === selectedItemId);

    if (itemIndex === -1) return;

    const item = playerData.inventory[itemIndex];

    // Eliminar item del inventario del remitente
    playerData.inventory.splice(itemIndex, 1);
    savePlayerData(playerData);

    // Añadir item al inventario del destinatario
    const recipientData = JSON.parse(localStorage.getItem(`rpg_player_${recipientUsername}`));

    if (!recipientData.inventory) {
        recipientData.inventory = [];
    }

    recipientData.inventory.push(item);
    localStorage.setItem(`rpg_player_${recipientUsername}`, JSON.stringify(recipientData));

    // Actualizar UI
    refreshInventory();
    document.getElementById('item-details').classList.add('hidden');

    // Cerrar modal y mostrar mensaje de éxito
    closeAllModals();
    showSuccessMessage(`Has enviado ${item.name} a ${recipientUsername}.`);
}

// Función para usar el item seleccionado
function useSelectedItem() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === selectedItemId);

    if (!item || item.type !== 'consumable') {
        showErrorMessage('Este item no es consumible.');
        return;
    }

    // Determinar a qué personaje aplicar el efecto
    const selectedCharacterId = localStorage.getItem('rpg_selected_character');

    if (!selectedCharacterId || !playerData.characters.some(c => c.id === selectedCharacterId)) {
        showModal('error-modal');
        document.getElementById('error-message').textContent = 'Selecciona un personaje primero para usar este item.';
        return;
    }

    // Usar el item
    if (useConsumableItem(selectedItemId, selectedCharacterId)) {
        refreshInventory();
        // Ocultar detalles del item
        document.getElementById('item-details').classList.add('hidden');
        showSuccessMessage(`Has usado ${item.name}.`);
    }
}

// Función para usar un item consumible
function useConsumableItem(itemId, characterId) {
    const playerData = getPlayerData();
    const itemIndex = playerData.inventory.findIndex(i => i.id === itemId);
    const character = playerData.characters.find(c => c.id === characterId);

    if (itemIndex === -1 || !character) return false;

    const item = playerData.inventory[itemIndex];

    if (item.type !== 'consumable') {
        showErrorMessage('Este item no es consumible.');
        return false;
    }

    // Aplicar efecto
    if (item.effect) {
        if (item.effect.type === 'heal') {
            // Restaurar salud
            character.currentHealth = Math.min(character.stats.health, (character.currentHealth || 0) + item.effect.value);
            showSuccessMessage(`${character.name} ha recuperado ${item.effect.value} puntos de salud.`);
        } else if (item.effect.type === 'buff') {
            // Aplicar buff temporal
            if (!character.buffs) character.buffs = [];

            character.buffs.push({
                stat: item.effect.stat,
                value: item.effect.value,
                duration: item.effect.duration
            });

            showSuccessMessage(`${character.name} ha recibido un buff de ${item.effect.value} en ${item.effect.stat} durante ${item.effect.duration} turnos.`);
        }
    }

    // Eliminar el item del inventario
    playerData.inventory.splice(itemIndex, 1);
    savePlayerData(playerData);

    return true;
}

// Función para añadir un item al inventario
function addItemToInventory(item) {
    const playerData = getPlayerData();

    if (!playerData.inventory) {
        playerData.inventory = [];
    }

    playerData.inventory.push(item);
    savePlayerData(playerData);

    // Actualizar UI si es visible
    if (document.getElementById('inventory-screen') && !document.getElementById('inventory-screen').classList.contains('hidden')) {
        refreshInventory();
    }
}

// Función para eliminar un item del inventario
function removeItemFromInventory(itemId) {
    const playerData = getPlayerData();
    const itemIndex = playerData.inventory.findIndex(i => i.id === itemId);

    if (itemIndex !== -1) {
        playerData.inventory.splice(itemIndex, 1);
        savePlayerData(playerData);

        // Actualizar UI si es visible
        if (document.getElementById('inventory-screen') && !document.getElementById('inventory-screen').classList.contains('hidden')) {
            refreshInventory();
        }

        return true;
    }

    return false;
}