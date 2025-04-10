// Main.js - Script principal que inicializa el juego - Versión mejorada

document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando juego...");

    // Asegurar que la pantalla de juego está oculta inicialmente
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');

    // Inicializar módulos
    try {
        initDataStorage();
        console.log("Almacenamiento de datos inicializado");
    } catch (e) {
        console.error("Error al inicializar almacenamiento de datos:", e);
    }

    try {
        initAuth();
        console.log("Autenticación inicializada");
    } catch (e) {
        console.error("Error al inicializar autenticación:", e);
    }

    try {
        initCharacters();
        console.log("Sistema de personajes inicializado");
    } catch (e) {
        console.error("Error al inicializar personajes:", e);
    }

    try {
        if (typeof initItems === 'function') {
            initItems();
            console.log("Sistema de items inicializado");
        }
    } catch (e) {
        console.error("Error al inicializar items:", e);
    }

    try {
        if (typeof initInventory === 'function') {
            initInventory();
            console.log("Inventario inicializado");
        }
    } catch (e) {
        console.error("Error al inicializar inventario:", e);
    }

    try {
        if (typeof initCombat === 'function') {
            initCombat();
            console.log("Sistema de combate inicializado");
        }
    } catch (e) {
        console.error("Error al inicializar combate:", e);
    }

    try {
        initExploration();
        console.log("Sistema de exploración inicializado");
    } catch (e) {
        console.error("Error al inicializar exploración:", e);
    }

    try {
        if (typeof initMarket === 'function') {
            initMarket();
            console.log("Mercado inicializado");
        }
    } catch (e) {
        console.error("Error al inicializar mercado:", e);
    }

    try {
        initUI();
        console.log("Interfaz de usuario inicializada");
    } catch (e) {
        console.error("Error al inicializar UI:", e);
    }

    // Configurar eventos para el cambio de pestañas
    setupTabEvents();

    console.log("Juego inicializado completamente");
});

// Configurar eventos para el cambio de pestañas
function setupTabEvents() {
    console.log("Configurando eventos de navegación...");

    // Verificar si el usuario está autenticado
    if (!getCurrentUser()) {
        console.log("No hay usuario autenticado, mostrando pantalla de login");
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        return;
    }

    // Añadir un evento personalizado para cuando se muestre un área
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');

            // Verificar si hay sesión activa antes de cambiar pantallas
            if (!getCurrentUser()) {
                showErrorMessage('Debes iniciar sesión para acceder al juego');
                return;
            }

            // Mostrar la pantalla correspondiente usando la función de auth.js
            showScreen(screenId);
        });
    });

    // Agregar listeners para los eventos de pantalla mostrada
    const explorationScreen = document.getElementById('exploration-screen');
    if (explorationScreen) {
        explorationScreen.addEventListener('screenShown', function() {
            // Cargar zonas cuando se muestra la pantalla de exploración
            console.log("Evento screenShown: exploration-screen");
            if (typeof loadZones === 'function') {
                loadZones();
            }
        });
    }

    const charactersScreen = document.getElementById('characters-screen');
    if (charactersScreen) {
        charactersScreen.addEventListener('screenShown', function() {
            // Actualizar lista de personajes cuando se muestra la pantalla de personajes
            console.log("Evento screenShown: characters-screen");
            if (typeof refreshCharacterList === 'function') {
                refreshCharacterList();
            }
        });
    }

    const shopScreen = document.getElementById('shop-screen');
    if (shopScreen) {
        shopScreen.addEventListener('screenShown', function() {
            // Cargar la tienda cuando se muestra la pantalla
            console.log("Evento screenShown: shop-screen");
            if (typeof loadShop === 'function') {
                loadShop();
            }
        });
    }

    const marketScreen = document.getElementById('market-screen');
    if (marketScreen) {
        marketScreen.addEventListener('screenShown', function() {
            // Cargar listings del mercado cuando se muestra la pantalla
            console.log("Evento screenShown: market-screen");
            if (typeof loadMarketListings === 'function') {
                loadMarketListings();
            }
        });
    }

    const inventoryScreen = document.getElementById('inventory-screen');
    if (inventoryScreen) {
        inventoryScreen.addEventListener('screenShown', function() {
            // Actualizar inventario cuando se muestra la pantalla
            console.log("Evento screenShown: inventory-screen");
            if (typeof refreshInventory === 'function') {
                refreshInventory();
            }
        });
    }
}

// Función para manejar el caso cuando alguna función no está disponible
function handleMissingFunction(functionName) {
    console.warn(`Función ${functionName} no disponible`);
    // No hacer nada si la función no está disponible
}

// Función para regenerar energía y otros datos periódicos
function updateGameCycle() {
    const playerData = getPlayerData();
    if (!playerData) return;

    // Regenerar stamina con el tiempo
    if (playerData.stamina < playerData.maxStamina) {
        playerData.stamina = Math.min(playerData.stamina + 1, playerData.maxStamina);

        // Actualizar UI solo si la pantalla del juego está visible
        if (!document.getElementById('game-screen').classList.contains('hidden')) {
            document.getElementById('stamina').textContent = `Energía: ${playerData.stamina}/${playerData.maxStamina}`;
        }

        savePlayerData(playerData);
        console.log("Energía regenerada:", playerData.stamina);
    }
}

// Iniciar el ciclo de actualización cada minuto
setInterval(updateGameCycle, 60000);