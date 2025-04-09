// Inventory.js - Sistema de inventario

// Inicialización del módulo de inventario
function initInventory() {
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
    document.getElementById('equip-item').addEventListener('click', equipSelectedItem);
    document.getElementById('sell-item').addEventListener('click', sellSelectedItem);
}

// Función para cargar el inventario del jugador
function loadInventory() {
    refreshInventory();
}

// Función para actualizar la visualización del inventario
function refreshInventory() {
    const inventoryContainer = document.getElementById('inventory-container');
    inventoryContainer.innerHTML = '';

    const playerData = getPlayerData();
    if (!playerData || !playerData.inventory || playerData.inventory.length === 0) {
        inventoryContainer.innerHTML = '<p>Tu inventario está vacío.</p>';
        document.getElementById('item-details').classList.add('hidden');
        return;
    }

    playerData.inventory.forEach(item => {
        const inventoryItemElement = document.createElement('div');
        inventoryItemElement.className = 'inventory-item';
        inventoryItemElement.setAttribute('data-id', item.id);

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
            <div>${item.name}</div>
            <div class="item-type">${getItemTypeText(item.type)}</div>
        `;

        inventoryContainer.appendChild(inventoryItemElement);
    });
}

// Función para obtener el texto del tipo de item
function getItemTypeText(type) {
    switch(type) {
        case ITEM_TYPES.WEAPON:
            return 'Arma';
        case ITEM_TYPES.ARMOR:
            return 'Armadura';
        case ITEM_TYPES.CONSUMABLE:
            return 'Consumible';
        case ITEM_TYPES.MATERIAL:
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
    document.getElementById('item-description').textContent = item.description;

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

    itemStats.innerHTML = statsHtml;

    // Configurar botones de acción según tipo de item
    document.getElementById('use-item').classList.add('hidden');
    document.getElementById('equip-item').classList.add('hidden');

    if (item.type === ITEM_TYPES.CONSUMABLE) {
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

// Función para usar el item seleccionado
function useSelectedItem() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === selectedItemId);

    if (!item || item.type !== ITEM_TYPES.CONSUMABLE) {
        alert('Este item no es consumible.');
        return;
    }

    // Determinar a qué personaje aplicar el efecto
    const selectedCharacterId = localStorage.getItem('rpg_selected_character');

    if (!selectedCharacterId || !playerData.characters.some(c => c.id === selectedCharacterId)) {
        alert('Selecciona un personaje primero para usar este item.');
        return;
    }

    // Usar el item
    if (useConsumableItem(selectedItemId, selectedCharacterId)) {
        refreshInventory();
        // Ocultar detalles del item
        document.getElementById('item-details').classList.add('hidden');
    }
}

// Función para equipar el item seleccionado
function equipSelectedItem() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === selectedItemId);

    if (!item || !item.equipable) {
        alert('Este item no es equipable.');
        return;
    }

    // Determinar a qué personaje equipar el item
    const selectedCharacterId = localStorage.getItem('rpg_selected_character');

    if (!selectedCharacterId || !playerData.characters.some(c => c.id === selectedCharacterId)) {
        alert('Selecciona un personaje primero para equipar este item.');
        return;
    }

    // Equipar el item
    equipItem(selectedCharacterId, selectedItemId);
    refreshInventory();
    // Ocultar detalles del item
    document.getElementById('item-details').classList.add('hidden');
}

// Función para vender el item seleccionado
function sellSelectedItem() {
    const selectedItemId = localStorage.getItem('rpg_selected_item');
    if (!selectedItemId) return;

    const playerData = getPlayerData();
    const itemIndex = playerData.inventory.findIndex(i => i.id === selectedItemId);

    if (itemIndex === -1) return;

    const item = playerData.inventory[itemIndex];

    // Confirmar venta
    if (!confirm(`¿Estás seguro de que quieres vender ${item.name} por ${item.value} oro?`)) {
        return;
    }

    // Eliminar item del inventario
    playerData.inventory.splice(itemIndex, 1);

    // Añadir oro al jugador
    playerData.gold += item.value;

    // Guardar cambios
    savePlayerData(playerData);

    // Actualizar UI
    refreshInventory();
    document.getElementById('item-details').classList.add('hidden');

    alert(`Has vendido ${item.name} por ${item.value} oro.`);
}

// Función para mostrar items equipables para un slot específico
function showEquipableItems(characterId, slot) {
    const playerData = getPlayerData();
    const equipableItems = playerData.inventory.filter(item =>
        item.equipable && item.slot === slot
    );

    if (equipableItems.length === 0) {
        alert('No tienes items que puedas equipar en este slot.');
        return;
    }

    // Crear un menú emergente para seleccionar el item
    const equipMenu = document.createElement('div');
    equipMenu.className = 'equip-menu';
    equipMenu.style.position = 'fixed';
    equipMenu.style.top = '50%';
    equipMenu.style.left = '50%';
    equipMenu.style.transform = 'translate(-50%, -50%)';
    equipMenu.style.backgroundColor = '#232323';
    equipMenu.style.padding = '20px';
    equipMenu.style.borderRadius = '8px';
    equipMenu.style.zIndex = '1000';
    equipMenu.style.maxHeight = '80vh';
    equipMenu.style.overflowY = 'auto';

    equipMenu.innerHTML = `<h3>Selecciona un item para equipar</h3>`;

    const itemList = document.createElement('div');
    itemList.style.display = 'grid';
    itemList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    itemList.style.gap = '10px';
    itemList.style.marginTop = '15px';

    equipableItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.style.cursor = 'pointer';
        itemElement.style.padding = '10px';
        itemElement.style.backgroundColor = '#333';
        itemElement.style.borderRadius = '4px';

        itemElement.innerHTML = `
            <div>${item.name}</div>
            <div class="item-level">Nivel: ${item.level || 1}</div>
        `;

        // Color según rareza
        if (item.rarity) {
            const rarityKey = Object.keys(ITEM_RARITIES).find(
                key => ITEM_RARITIES[key].name === item.rarity
            );
            if (rarityKey) {
                itemElement.style.borderColor = ITEM_RARITIES[rarityKey].color;
                itemElement.style.borderWidth = '2px';
                itemElement.style.borderStyle = 'solid';
            }
        }

        itemElement.addEventListener('click', function() {
            equipItem(characterId, item.id);
            document.body.removeChild(equipMenu);
        });

        itemList.appendChild(itemElement);
    });

    equipMenu.appendChild(itemList);

    // Botón para cerrar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancelar';
    closeButton.style.marginTop = '15px';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(equipMenu);
    });

    equipMenu.appendChild(closeButton);

    document.body.appendChild(equipMenu);
}

// Función para añadir un item al inventario
function addItemToInventory(item) {
    const playerData = getPlayerData();
    playerData.inventory.push(item);
    savePlayerData(playerData);
}

// Función para eliminar un item del inventario
function removeItemFromInventory(itemId) {
    const playerData = getPlayerData();
    const itemIndex = playerData.inventory.findIndex(i => i.id === itemId);

    if (itemIndex !== -1) {
        playerData.inventory.splice(itemIndex, 1);
        savePlayerData(playerData);
        return true;
    }

    return false;
}