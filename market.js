// Market.js - Sistema de mercado entre jugadores - Versión mejorada

// Variables para el mercado
let marketListings = [];
let currentMarketTab = 'browse';

// Inicialización del módulo de mercado
function initMarket() {
    console.log("Inicializando módulo de mercado...");

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
    document.getElementById('buy-market-item').addEventListener('click', showConfirmPurchaseModal);

    // Event listener para confirmar compra
    document.getElementById('confirm-purchase').addEventListener('click', buyMarketItem);

    // Event listener para hacer oferta
    document.getElementById('offer-market-item').addEventListener('click', showMakeOfferModal);

    // Event listener para confirmar oferta
    document.getElementById('confirm-offer').addEventListener('click', makeOffer);

    // Inventario para vender - dentro de la pestaña "Mis Ventas"
    document.getElementById('sell-inventory').addEventListener('click', function(e) {
        const inventoryItem = e.target.closest('.inventory-item');
        if (inventoryItem) {
            const itemId = inventoryItem.getAttribute('data-id');
            showSellForm(itemId);
        }
    });

    // Confirmar venta
    document.getElementById('confirm-sell').addEventListener('click', confirmSellItem);

    // Event listeners para filtros de categoría en el inventario de venta
    document.querySelectorAll('#sell-interface .inventory-category').forEach(button => {
        button.addEventListener('click', function() {
            // Quitar la clase active de todos los botones
            document.querySelectorAll('#sell-interface .inventory-category').forEach(btn => btn.classList.remove('active'));

            // Añadir la clase active al botón clicado
            this.classList.add('active');

            // Filtrar los items
            const category = this.getAttribute('data-category');
            filterSellInventory(category);
        });
    });

    // Event listener para ordenar listings
    document.getElementById('market-sort').addEventListener('change', function() {
        sortMarketListings(this.value);
    });

    console.log("Módulo de mercado inicializado correctamente");
}

// Función para cargar los items del mercado
function loadMarketListings() {
    console.log("Cargando listings del mercado...");

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
    console.log(`Cambiando a pestaña: ${tabId}`);

    // Actualizar estado visual
    document.querySelectorAll('.market-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.market-tab[data-tab="${tabId}"]`).classList.add('active');

    // Ocultar/mostrar secciones según la pestaña
    const sellInterface = document.getElementById('sell-interface');
    const marketContainer = document.querySelector('.market-container');

    if (tabId === 'browse') {
        sellInterface.classList.add('hidden');
        marketContainer.classList.remove('hidden');
        document.getElementById('market-search').classList.remove('hidden');
    } else {
        sellInterface.classList.remove('hidden');
        marketContainer.classList.add('hidden');
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
        marketListingsContainer.innerHTML = '<p class="empty-list-message">No hay items en venta actualmente.</p>';
        document.getElementById('market-item-details').classList.add('hidden');
        return;
    }

    filteredListings.forEach(listing => {
        const item = listing.item;

        const listingElement = document.createElement('div');
        listingElement.className = 'market-item';
        listingElement.setAttribute('data-id', listing.id);
        listingElement.setAttribute('data-price', listing.price);
        listingElement.setAttribute('data-level', item.level || 0);
        listingElement.setAttribute('data-date', listing.date || Date.now());

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

        // Fecha formateada
        const listingDate = new Date(listing.date || Date.now());
        const dateStr = listingDate.toLocaleDateString();

        listingElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Tipo: ${getItemTypeText(item.type)}</p>
            <p>Nivel: ${item.level || 1}</p>
            <p>Precio: ${listing.price} oro</p>
            <p>Vendedor: ${listing.seller}</p>
            <p>Fecha: ${dateStr}</p>
        `;

        marketListingsContainer.appendChild(listingElement);
    });

    // Aplicar orden actual
    const currentSort = document.getElementById('market-sort').value;
    sortMarketListings(currentSort);
}

// Función para mostrar mis listings
function showMyListings() {
    const marketListingsContainer = document.getElementById('market-listings');
    marketListingsContainer.innerHTML = '';

    // Filtrar listings del usuario actual
    const currentUser = getCurrentUser();
    const myListings = marketListings.filter(listing => listing.seller === currentUser);

    if (myListings.length === 0) {
        marketListingsContainer.innerHTML = '<p class="empty-list-message">No tienes items en venta actualmente.</p>';
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

        // Calcular tiempo restante si hay duración
        let timeRemainingText = '';
        if (listing.duration && listing.date) {
            const endTime = listing.date + (listing.duration * 24 * 60 * 60 * 1000); // convertir días a milisegundos
            const timeRemaining = endTime - Date.now();

            if (timeRemaining > 0) {
                const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
                timeRemainingText = `<p>Expira en: ${daysRemaining} días</p>`;
            } else {
                timeRemainingText = `<p class="expired">Anuncio expirado</p>`;
            }
        }

        listingElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Tipo: ${getItemTypeText(item.type)}</p>
            <p>Nivel: ${item.level || 1}</p>
            <p>Precio: ${listing.price} oro</p>
            ${timeRemainingText}
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

// Función para ordenar listings del mercado
function sortMarketListings(sortType) {
    console.log(`Ordenando listings por: ${sortType}`);

    const marketListings = document.querySelectorAll('#market-listings .market-item');
    const marketListingsContainer = document.getElementById('market-listings');

    // Convertir a array para poder ordenar
    const listingsArray = Array.from(marketListings);

    switch(sortType) {
        case 'recent':
            listingsArray.sort((a, b) => {
                const dateA = parseInt(a.getAttribute('data-date'));
                const dateB = parseInt(b.getAttribute('data-date'));
                return dateB - dateA; // Orden descendente (más recientes primero)
            });
            break;
        case 'price-asc':
            listingsArray.sort((a, b) => {
                const priceA = parseInt(a.getAttribute('data-price'));
                const priceB = parseInt(b.getAttribute('data-price'));
                return priceA - priceB; // Orden ascendente
            });
            break;
        case 'price-desc':
            listingsArray.sort((a, b) => {
                const priceA = parseInt(a.getAttribute('data-price'));
                const priceB = parseInt(b.getAttribute('data-price'));
                return priceB - priceA; // Orden descendente
            });
            break;
        case 'level-asc':
            listingsArray.sort((a, b) => {
                const levelA = parseInt(a.getAttribute('data-level'));
                const levelB = parseInt(b.getAttribute('data-level'));
                return levelA - levelB; // Orden ascendente
            });
            break;
        case 'level-desc':
            listingsArray.sort((a, b) => {
                const levelA = parseInt(a.getAttribute('data-level'));
                const levelB = parseInt(b.getAttribute('data-level'));
                return levelB - levelA; // Orden descendente
            });
            break;
    }

    // Reinserta los elementos en el orden correcto
    listingsArray.forEach(listing => marketListingsContainer.appendChild(listing));
}

// Función para buscar en el mercado
function searchMarket() {
    console.log("Buscando en el mercado...");

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
            (listing.item.description && listing.item.description.toLowerCase().includes(searchText))
        );
    }

    // Filtrar por categoría
    if (category !== 'all') {
        filteredListings = filteredListings.filter(listing => listing.item.type === category);
    }

    if (filteredListings.length === 0) {
        marketListingsContainer.innerHTML = '<p class="empty-list-message">No se encontraron items que coincidan con la búsqueda.</p>';
        document.getElementById('market-item-details').classList.add('hidden');
        return;
    }

    // Mostrar resultados
    filteredListings.forEach(listing => {
        const item = listing.item;

        const listingElement = document.createElement('div');
        listingElement.className = 'market-item';
        listingElement.setAttribute('data-id', listing.id);
        listingElement.setAttribute('data-price', listing.price);
        listingElement.setAttribute('data-level', item.level || 0);
        listingElement.setAttribute('data-date', listing.date || Date.now());

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

        // Fecha formateada
        const listingDate = new Date(listing.date || Date.now());
        const dateStr = listingDate.toLocaleDateString();

        listingElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Tipo: ${getItemTypeText(item.type)}</p>
            <p>Nivel: ${item.level || 1}</p>
            <p>Precio: ${listing.price} oro</p>
            <p>Vendedor: ${listing.seller}</p>
            <p>Fecha: ${dateStr}</p>
        `;

        marketListingsContainer.appendChild(listingElement);
    });

    // Aplicar orden actual
    const currentSort = document.getElementById('market-sort').value;
    sortMarketListings(currentSort);
}

// Función para mostrar detalles de un item del mercado
function showMarketItemDetails(listingId) {
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) return;

    const item = listing.item;
    const marketItemDetails = document.getElementById('market-item-details');
    marketItemDetails.classList.remove('hidden');

    document.getElementById('market-item-name').textContent = item.name;
    document.getElementById('market-item-description').textContent = item.description || 'Sin descripción disponible';
    document.getElementById('market-item-price').textContent = `Precio: ${listing.price} oro`;
    document.getElementById('market-item-seller').textContent = `Vendedor: ${listing.seller}`;

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

    marketItemStats.innerHTML = statsHtml || '<p>Sin estadísticas adicionales</p>';

    // Verificar si el jugador puede comprar
    const playerData = getPlayerData();
    const canAfford = playerData.gold >= listing.price;

    // Actualizar botones
    document.getElementById('buy-market-item').disabled = !canAfford;
    document.getElementById('buy-market-item').classList.toggle('btn-disabled', !canAfford);
    document.getElementById('buy-market-item').textContent = canAfford ? 'Comprar' : 'Oro insuficiente';

    // Guardar listing actual
    localStorage.setItem('rpg_selected_market_listing', listingId);
}

// Función para mostrar el modal de confirmación de compra
function showConfirmPurchaseModal() {
    const listingId = localStorage.getItem('rpg_selected_market_listing');
    if (!listingId) return;

    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) return;

    // Verificar si tiene suficiente oro
    const playerData = getPlayerData();
    if (playerData.gold < listing.price) {
        showErrorMessage(`No tienes suficiente oro. Necesitas ${listing.price} oro.`);
        return;
    }

    // Configurar el modal
    document.getElementById('confirm-item-name').textContent = listing.item.name;
    document.getElementById('confirm-item-price').textContent = listing.price;

    // Mostrar el modal
    showModal('confirm-purchase-modal');
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
        showErrorMessage('No tienes suficiente oro para comprar este item.');
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
    updateGoldDisplay();

    // Cerrar modal y mostrar mensaje de éxito
    closeAllModals();
    showSuccessMessage(`Has comprado ${listing.item.name} por ${listing.price} oro.`);
}

// Función para mostrar el modal para hacer una oferta
function showMakeOfferModal() {
    const listingId = localStorage.getItem('rpg_selected_market_listing');
    if (!listingId) return;

    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) return;

    // Configurar el modal
    document.getElementById('offer-item-name').textContent = listing.item.name;
    document.getElementById('offer-current-price').textContent = listing.price;
    document.getElementById('offer-price').value = Math.floor(listing.price * 0.8); // Sugerir un 80% del precio

    // Mostrar el modal
    showModal('make-offer-modal');
}

// Función para hacer una oferta
function makeOffer() {
    const listingId = localStorage.getItem('rpg_selected_market_listing');
    if (!listingId) return;

    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) return;

    const offerPrice = parseInt(document.getElementById('offer-price').value);

    if (isNaN(offerPrice) || offerPrice <= 0) {
        showErrorMessage('Debes introducir un precio válido');
        return;
    }

    const playerData = getPlayerData();

    // Verificar si tiene suficiente oro
    if (playerData.gold < offerPrice) {
        showErrorMessage(`No tienes suficiente oro. Tienes ${playerData.gold} oro.`);
        return;
    }

    // Guardar la oferta - en un caso real se enviaría al vendedor
    // Aquí implementamos una simulación simple

    // Determinar si el vendedor acepta la oferta
    // 50% de probabilidad si la oferta es al menos el 80% del precio
    const acceptThreshold = listing.price * 0.8;
    const isAccepted = offerPrice >= acceptThreshold && Math.random() > 0.5;

    if (isAccepted) {
        // Realizar la compra
        playerData.gold -= offerPrice;
        playerData.inventory.push(listing.item);
        savePlayerData(playerData);

        // Añadir oro al vendedor
        const sellerData = JSON.parse(localStorage.getItem(`rpg_player_${listing.seller}`));
        if (sellerData) {
            sellerData.gold += offerPrice;
            localStorage.setItem(`rpg_player_${listing.seller}`, JSON.stringify(sellerData));
        }

        // Eliminar el listing
        const listingIndex = marketListings.findIndex(l => l.id === listingId);
        if (listingIndex !== -1) {
            marketListings.splice(listingIndex, 1);
            localStorage.setItem('rpg_market_listings', JSON.stringify(marketListings));
        }

        // Actualizar UI
        document.getElementById('market-item-details').classList.add('hidden');
        loadMarketListings();
        updateGoldDisplay();

        // Cerrar modal y mostrar mensaje de éxito
        closeAllModals();
        showSuccessMessage(`¡Oferta aceptada! Has comprado ${listing.item.name} por ${offerPrice} oro.`);
    } else {
        // Cerrar modal y mostrar mensaje de rechazo
        closeAllModals();
        showErrorMessage(`El vendedor ha rechazado tu oferta de ${offerPrice} oro por ${listing.item.name}.`);
    }
}

// Función para cargar el inventario para vender
function loadSellInventory() {
    console.log("Cargando inventario para vender...");

    const sellInventory = document.getElementById('sell-inventory');
    sellInventory.innerHTML = '';

    const playerData = getPlayerData();
    if (!playerData || !playerData.inventory || playerData.inventory.length === 0) {
        sellInventory.innerHTML = '<p class="empty-list-message">No tienes items para vender.</p>';
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

        sellInventory.appendChild(inventoryItemElement);
    });

    console.log(`Inventario para vender cargado con ${Object.keys(groupedItems).length} tipos de items.`);
}

// Función para filtrar items del inventario de venta
function filterSellInventory(category) {
    console.log(`Filtrando inventario de venta por categoría: ${category}`);

    const inventoryItems = document.querySelectorAll('#sell-inventory .inventory-item');

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

// Función para mostrar el formulario de venta
function showSellForm(itemId) {
    console.log(`Mostrando formulario de venta para item: ${itemId}`);

    const playerData = getPlayerData();
    const item = playerData.inventory.find(i => i.id === itemId);

    if (!item) return;

    // Mostrar formulario
    document.getElementById('sell-form').classList.remove('hidden');
    document.getElementById('sell-item-name').textContent = item.name;

    // Sugerir precio basado en el valor del item
    document.getElementById('sell-price').value = item.value || 100;

    // Guardar item seleccionado
    localStorage.setItem('rpg_selling_item', itemId);
}

// Función para confirmar la venta de un item
function confirmSellItem() {
    console.log("Confirmando venta de item...");

    const itemId = localStorage.getItem('rpg_selling_item');
    if (!itemId) return;

    const price = parseInt(document.getElementById('sell-price').value);
    const duration = parseInt(document.getElementById('sell-duration').value);

    if (isNaN(price) || price <= 0) {
        showErrorMessage('Por favor, introduce un precio válido.');
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
        date: Date.now(),
        duration: duration
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

    showSuccessMessage(`Has puesto ${item.name} a la venta por ${price} oro durante ${duration} días.`);
}

// Función para cancelar un listing
function cancelListing(listingId) {
    console.log(`Cancelando listing: ${listingId}`);

    const listingIndex = marketListings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) return;

    const listing = marketListings[listingIndex];

    // Comprobar si el jugador es el vendedor
    if (listing.seller !== getCurrentUser()) {
        showErrorMessage('No puedes cancelar una venta que no es tuya.');
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

    showSuccessMessage(`Has cancelado la venta de ${listing.item.name}.`);
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