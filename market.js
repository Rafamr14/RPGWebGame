// Market.js - Sistema de mercado entre jugadores

// Variables para el mercado
let marketListings = [];
let currentMarketTab = 'browse';

// Inicialización del módulo de mercado
function initMarket() {
    // Event listeners para las pestañas del mercado
    document.querySelectorAll('.market-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchMarketTab(tabId);
        });
    });

    // Event listener para la búsqueda en el mercado
    document.getElementById('search-market').addEventListener('click', searchMarket);

    // Event listener para mostrar detalles de item del mercado
    document.getElementById('market-listings').addEventListener('click', function(e) {
        const marketItem = e.target.closest('.market-item');
        if (marketItem) {
            const listingId = marketItem.getAttribute('data-id');
            showMarketItemDetails(listingId);
        }
    });

    // Event listener para comprar item del mercado
    document.getElementById('buy-market-item').addEventListener('click', buyMarketItem);

    // Inventario para vender
    document.getElementById('sell-inventory').addEventListener('click', function(e) {
        const inventoryItem = e.target.closest('.inventory-item');
        if (inventoryItem) {
            const itemId = inventoryItem.getAttribute('data-id');
            showSellForm(itemId);
        }
    });

    // Confirmar venta
    document.getElementById('confirm-sell').addEventListener('click', confirmSellItem);
}

// Función para cargar los items del mercado
function loadMarketListings() {
    // Obtener listings del mercado
    marketListings = JSON.parse(localStorage.getItem('rpg_market_listings') || '[]');

    // Mostrar según la pestaña activa
    if (currentMarketTab === 'browse') {
        showAllListings();
    } else {
        showMyListings();
    }
}

// Función para cambiar de pestaña en el mercado
function switchMarketTab(tabId) {
    // Actualizar estado visual
    document.querySelectorAll('.market-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.market-tab[data-tab="${tabId}"]`).classList.add('active');

    // Ocultar/mostrar secciones según la pestaña
    const sellInterface = document.getElementById('sell-interface');

    if (tabId === 'browse') {
        sellInterface.classList.add('hidden');
        document.getElementById('market-search').classList.remove('hidden');
    } else {
        sellInterface.classList.remove('hidden');
        document.getElementById('market-search').classList.add('hidden');
        loadSellInventory();
    }

    // Guardar pestaña actual y cargar listings correspondientes
    currentMarketTab = tabId;
    loadMarketListings();
}

// Función para mostrar todos los listings
function showAllListings() {
    const marketListingsContainer = document.getElementById('market-listings');
    marketListingsContainer.innerHTML = '';

    // Filtrar listings que no son del usuario actual
    const currentUser = getCurrentUser();
    const filteredListings = marketListings.filter(listing => listing.seller !== currentUser);

    if (filteredListings.length === 0) {
        marketListingsContainer.innerHTML = '<p>No hay items en venta actualmente.</p>';
        return;
    }

    filteredListings.forEach(listing => {
        const item = listing.item;

        const listingElement = document.createElement('div');
        listingElement.className = 'market-item';
        listingElement.setAttribute('data-id', listing.id);

        // Color según rareza si el item tiene rareza
        if (item.rarity) {
            const rarityKey = Object.keys(ITEM_RARITIES).find(
                key => ITEM_RARITIES[key].name === item.rarity
            );
            if (rarityKey) {
                listingElement.style.borderColor = ITEM_RARITIES[rarityKey].color;
                listingElement.style.borderWidth = '2px';
                listingElement.style.borderStyle = 'solid';
            }
        }

        listingElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Tipo: ${getItemTypeText(item.type)}</p>
            <p>Nivel: ${item.level || 1}</p>
            <p>Precio: ${listing.price} oro</p>
            <p>Vendedor: ${listing.seller}</p>
        `;

        marketListingsContainer.appendChild(listingElement);
    });
}

// Función para mostrar mis listings
function showMyListings() {
    const marketListingsContainer = document.getElementById('market-listings');
    marketListingsContainer.innerHTML = '';

    // Filtrar listings del usuario actual
    const currentUser = getCurrentUser();
    const myListings = marketListings.filter(listing => listing.seller === currentUser);

    if (myListings.length === 0) {
        marketListingsContainer.innerHTML = '<p>No tienes items en venta actualmente.</p>';
        return;
    }

    myListings.forEach(listing => {
        const item = listing.item;

        const listingElement = document.createElement('div');
        listingElement.className = 'market-item';
        listingElement.setAttribute('data-id', listing.id);

        // Color según rareza si el item tiene rareza
        if (item.rarity) {
            const rarityKey = Object.keys(ITEM_RARITIES).find(
                key => ITEM_RARITIES[key].name === item.rarity
            );
            if (rarityKey) {
                listingElement.style.borderColor = ITEM_RARITIES[rarityKey].color;
                listingElement.style.borderWidth = '2px';
                listingElement.style.borderStyle = 'solid';
            }
        }

        listingElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Tipo: ${getItemTypeText(item.type)}</p>
            <p>Nivel: ${item.level || 1}</p>
            <p>Precio: ${listing.price} oro</p>
            <button class="cancel-listing-button" data-id="${listing.id}">Cancelar venta</button>
        `;

        marketListingsContainer.appendChild(listingElement);
    });

    // Event listeners para cancelar listings
    document.querySelectorAll('.cancel-listing-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se muestre el detalle del item
            const listingId = this.getAttribute('data-id');
            cancelListing(listingId);
        });
    });
}

// Función para buscar en el mercado
function searchMarket() {
    const searchText = document.getElementById('market-search-input').value.trim().toLowerCase();
    const category = document.getElementById('market-category').value;

    const marketListingsContainer = document.getElementById('market-listings');
    marketListingsContainer.innerHTML = '';

    // Filtrar listings que no son del usuario actual y coinciden con la búsqueda
    const currentUser = getCurrentUser();
    let filteredListings = marketListings.filter(listing => listing.seller !== currentUser);

    // Filtrar por texto
    if (searchText) {
        filteredListings = filteredListings.filter(listing =>
            listing.item.name.toLowerCase().includes(searchText) ||
            listing.item.description.toLowerCase().includes(searchText)
        );
    }

    // Filtrar por categoría
    if (category !== 'all') {
        filteredListings = filteredListings.filter(listing => listing.item.type === category);
    }

    if (filteredListings.length === 0) {
        marketListingsContainer.innerHTML = '<p>No se encontraron items que coincidan con la búsqueda.</p>';
        return;
    }

    // Mostrar resultados
    filteredListings.forEach(listing => {
        const item = listing.item;

        const listingElement = document.createElement('div');
        listingElement.className = 'market-item';
        listingElement.setAttribute('data-id', listing.id);

        // Color según rareza si el item tiene rareza
        if (item.rarity) {
            const rarityKey = Object.keys(ITEM_RARITIES).find(
                key => ITEM_RARITIES[key].name === item.rarity
            );
            if (rarityKey) {
                listingElement.style.borderColor = ITEM_RARITIES[rarityKey].color;
                listingElement.style.borderWidth = '2px';
                listingElement.style.borderStyle = 'solid';
            }
        }

        listingElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Tipo: ${getItemTypeText(item.type)}</p>
            <p>Nivel: ${item.level || 1}</p>
            <p>Precio: ${listing.price} oro</p>
            <p>Vendedor: ${listing.seller}</p>
        `;

        marketListingsContainer.appendChild(listingElement);
    });
}

// Función para mostrar detalles de un item del mercado
function showMarketItemDetails(listingId) {
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) return;

    const item = listing.item;
    const marketItemDetails = document.getElementById('market-item-details');
    marketItemDetails.classList.remove('hidden');

    document.getElementById('market-item-name').textContent = item.name;
    document.getElementById('market-item-description').textContent = item.description;
    document.getElementById('market-item-price').textContent = `Precio: ${listing.price} oro`;

    // Mostrar estadísticas del item
    const marketItemStats = document.getElementById('market-item-stats');

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

    marketItemStats.innerHTML = statsHtml;

    // Guardar listing actual
    localStorage.setItem('rpg_selected_market_listing', listingId);
}

// Función para comprar un item del mercado
function buyMarketItem() {
    const listingId = localStorage.getItem('rpg_selected_market_listing');
    if (!listingId) return;

    const listingIndex = marketListings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) return;

    const listing = marketListings[listingIndex];
    const playerData = getPlayerData();

    // Comprobar si el jugador tiene suficiente oro
    if (playerData.gold < listing.price) {
        alert('No tienes suficiente oro para comprar este item.');
        return;
    }

    // Confirmar compra
    if (!confirm(`¿Estás seguro de que quieres comprar ${listing.item.name} por ${listing.price} oro?`)) {
        return;
    }

    // Realizar la compra
    playerData.gold -= listing.price;
    playerData.inventory.push(listing.item);
    savePlayerData(playerData);

    // Añadir oro al vendedor
    const sellerData = JSON.parse(localStorage.getItem(`rpg_player_${listing.seller}`));
    if (sellerData) {
        sellerData.gold += listing.price;
        localStorage.setItem(`rpg_player_${listing.seller}`, JSON.stringify(sellerData));
    }

    // Eliminar el listing
    marketListings.splice(listingIndex, 1);
    localStorage.setItem('rpg_market_listings', JSON.stringify(marketListings));

    // Actualizar UI
    document.getElementById('market-item-details').classList.add('hidden');
    loadMarketListings();

    alert(`Has comprado ${listing.item.name} por ${listing.price} oro.`);
}

// Función para cargar el inventario para vender
function loadSellInventory() {
    const sellInventory = document.getElementById('sell-inventory');
    sellInventory.innerHTML = '';

    const playerData = getPlayerData();
    if (!playerData || !playerData.inventory || playerData.inventory.length === 0) {
        sellInventory.innerHTML = '<p>No tienes items para vender.</p>';
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

        sellInventory.appendChild(inventoryItemElement);
    });
}

// Función para mostrar el formulario de venta
function showSellForm(itemId) {
    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === itemId);

    if (!item) return;

    // Mostrar formulario
    document.getElementById('sell-form').classList.remove('hidden');
    document.getElementById('sell-item-name').textContent = item.name;

    // Sugerir precio basado en el valor del item
    document.getElementById('sell-price').value = item.value || 50;

    // Guardar item seleccionado
    localStorage.setItem('rpg_selling_item', itemId);
}

// Función para confirmar la venta de un item
function confirmSellItem() {
    const itemId = localStorage.getItem('rpg_selling_item');
    if (!itemId) return;

    const price = parseInt(document.getElementById('sell-price').value);

    if (isNaN(price) || price <= 0) {
        alert('Por favor, introduce un precio válido.');
        return;
    }

    const playerData = getPlayerData();
    const itemIndex = playerData.inventory.findIndex(i => i.id === itemId);

    if (itemIndex === -1) return;

    const item = playerData.inventory[itemIndex];

    // Crear listing
    const listing = {
        id: `listing_${Date.now()}`,
        seller: getCurrentUser(),
        item: item,
        price: price,
        date: Date.now()
    };

    // Añadir al mercado
    marketListings.push(listing);
    localStorage.setItem('rpg_market_listings', JSON.stringify(marketListings));

    // Quitar del inventario
    playerData.inventory.splice(itemIndex, 1);
    savePlayerData(playerData);

    // Actualizar UI
    document.getElementById('sell-form').classList.add('hidden');
    loadSellInventory();

    alert(`Has puesto ${item.name} a la venta por ${price} oro.`);
}

// Función para cancelar un listing
function cancelListing(listingId) {
    const listingIndex = marketListings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) return;

    const listing = marketListings[listingIndex];

    // Comprobar si el jugador es el vendedor
    if (listing.seller !== getCurrentUser()) {
        alert('No puedes cancelar una venta que no es tuya.');
        return;
    }

    // Confirmar cancelación
    if (!confirm(`¿Estás seguro de que quieres cancelar la venta de ${listing.item.name}?`)) {
        return;
    }

    // Devolver item al inventario
    const playerData = getPlayerData();
    playerData.inventory.push(listing.item);
    savePlayerData(playerData);

    // Eliminar el listing
    marketListings.splice(listingIndex, 1);
    localStorage.setItem('rpg_market_listings', JSON.stringify(marketListings));

    // Actualizar UI
    loadMarketListings();

    alert(`Has cancelado la venta de ${listing.item.name}.`);
}