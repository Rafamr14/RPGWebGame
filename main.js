// Main.js - Script principal que inicializa el juego

document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando juego...");

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

    // Comprobar si hay una sesión activa
    checkSession();

    // Configurar eventos para el cambio de pestañas
    setupTabEvents();

    console.log("Juego inicializado completamente");
});

// Configurar eventos para el cambio de pestañas
function setupTabEvents() {
    console.log("Configurando eventos de navegación...");

    // Añadir un evento personalizado para cuando se muestre un área
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            const screenElement = document.getElementById(screenId);

            if (screenElement) {
                // Disparar un evento personalizado para que los módulos puedan actualizarse
                const event = new CustomEvent('screenShown', { detail: { screenId: screenId } });
                screenElement.dispatchEvent(event);

                console.log(`Pantalla mostrada: ${screenId}`);
            }
        });
    });

    // Agregar listeners para los eventos de pantalla mostrada
    const explorationScreen = document.getElementById('exploration-screen');
    if (explorationScreen) {
        explorationScreen.addEventListener('screenShown', function() {
            // Cargar zonas cuando se muestra la pantalla de exploración
            console.log("Evento screenShown: exploration-screen");
            loadZones();
        });
    }

    const charactersScreen = document.getElementById('characters-screen');
    if (charactersScreen) {
        charactersScreen.addEventListener('screenShown', function() {
            // Actualizar lista de personajes cuando se muestra la pantalla de personajes
            console.log("Evento screenShown: characters-screen");
            refreshCharacterList();
        });
    }

    console.log("Eventos de navegación configurados");
}

// Función para mostrar la pantalla principal del juego después del login
function showGameScreen(username) {
    console.log(`Mostrando pantalla principal para usuario: ${username}`);

    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('player-name').textContent = username;

    // Cargar datos del jugador
    loadPlayerData();

    // Mostrar la pantalla de personajes por defecto
    showScreen('characters-screen');

    // Comprobar si es la primera vez que el jugador entra
    const playerData = getPlayerData();
    if (playerData.firstTime) {
        // Modificación: en lugar de mostrar el modal directamente, añadir un timeout
        setTimeout(() => {
            // Mostrar modal de bienvenida
            if (document.getElementById('success-message') && typeof showModal === 'function') {
                document.getElementById('success-message').textContent = '¡Bienvenido al juego! Para comenzar, debes comprar un personaje en la tienda. Tienes 2000 monedas de oro para iniciar.';
                showModal('success-modal');

                console.log("Modal de bienvenida mostrado");
            } else {
                // Fallback a alerta si el modal no está disponible
                alert('¡Bienvenido al juego! Para comenzar, debes comprar un personaje en la tienda.');
            }

            // Ir a la tienda
            showScreen('shop-screen');

            // Marcar que ya no es la primera vez
            playerData.firstTime = false;
            savePlayerData(playerData);

            console.log("Primera vez completada");
        }, 500); // Retraso de 500ms para asegurar que la UI esté lista
    }
}

// Función para cargar los datos del jugador
function loadPlayerData() {
    console.log("Cargando datos del jugador...");

    const playerData = getPlayerData();

    // Mostrar nivel de cuenta, energía y oro
    document.getElementById('account-level').textContent = `Nivel: ${playerData.level}`;
    document.getElementById('stamina').textContent = `Energía: ${playerData.stamina}/${playerData.maxStamina}`;

    // Añadir visualización del oro en la interfaz
    if (!document.getElementById('player-gold')) {
        const goldElement = document.createElement('span');
        goldElement.id = 'player-gold';
        document.getElementById('account-info').appendChild(goldElement);
    }
    document.getElementById('player-gold').textContent = `Oro: ${playerData.gold}`;

    // Cargar personajes del jugador
    try {
        loadCharacters();
    } catch (e) {
        console.error("Error al cargar personajes:", e);
    }

    // Cargar inventario del jugador
    try {
        if (typeof loadInventory === 'function') {
            loadInventory();
        }
    } catch (e) {
        console.error("Error al cargar inventario:", e);
    }

    console.log("Datos del jugador cargados");
}

// Actualizar la visualización del oro
function updateGoldDisplay() {
    const playerData = getPlayerData();
    if (document.getElementById('player-gold')) {
        document.getElementById('player-gold').textContent = `Oro: ${playerData.gold}`;
        console.log("Oro actualizado:", playerData.gold);
    }
}

// Función para manejar la desconexión
function logout() {
    console.log("Cerrando sesión...");

    clearSession();
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');

    console.log("Sesión cerrada");
}

// Event listener para el botón de logout
document.getElementById('logout-button').addEventListener('click', logout);

// Función para redirigir a una pantalla específica
function showScreen(screenId) {
    console.log(`Mostrando pantalla: ${screenId}`);

    // Ocultar todas las áreas de juego
    const gameAreas = document.querySelectorAll('.game-area');
    gameAreas.forEach(area => {
        area.classList.add('hidden');
    });

    // Mostrar la pantalla solicitada
    const screenElement = document.getElementById(screenId);
    screenElement.classList.remove('hidden');

    // Disparar un evento para notificar que se mostró esta pantalla
    const event = new CustomEvent('screenShown', { detail: { screenId: screenId } });
    screenElement.dispatchEvent(event);
}

// Event listeners para los botones de navegación
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', function() {
        const screenId = this.getAttribute('data-screen');
        showScreen(screenId);
    });
});

// Función para actualizar regularmente los datos del juego (como regeneración de stamina)
function updateGameCycle() {
    const playerData = getPlayerData();

    // Regenerar stamina con el tiempo
    if (playerData.stamina < playerData.maxStamina) {
        playerData.stamina = Math.min(playerData.stamina + 1, playerData.maxStamina);
        document.getElementById('stamina').textContent = `Energía: ${playerData.stamina}/${playerData.maxStamina}`;
        savePlayerData(playerData);

        console.log("Energía regenerada:", playerData.stamina);
    }
}

// Iniciar el ciclo de actualización cada minuto
setInterval(updateGameCycle, 60000);