// data.js - Almacenamiento de datos del juego

// Función para inicializar el almacenamiento de datos
function initDataStorage() {
    // Comprobar si ya hay datos inicializados
    if (!localStorage.getItem('rpg_initialized')) {
        // Inicializar datos básicos
        localStorage.setItem('rpg_users', JSON.stringify([]));
        localStorage.setItem('rpg_market_listings', JSON.stringify([]));

        // Marcar como inicializado
        localStorage.setItem('rpg_initialized', 'true');
    }
}

// Función para obtener el usuario actual
function getCurrentUser() {
    return localStorage.getItem('rpg_current_session');
}

// Función para obtener los datos del jugador
function getPlayerData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    // Leer directamente desde localStorage para asegurar datos frescos
    const data = localStorage.getItem(`rpg_player_${currentUser}`);
    return data ? JSON.parse(data) : null;
}

// Función para guardar los datos del jugador
function savePlayerData(playerData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    localStorage.setItem(`rpg_player_${currentUser}`, JSON.stringify(playerData));
}

// Función para reiniciar todos los datos (para desarrollo)
function resetAllData() {
    // Obtener la lista de claves en localStorage
    const keys = Object.keys(localStorage);

    // Eliminar todas las claves que comienzan con 'rpg_'
    keys.forEach(key => {
        if (key.startsWith('rpg_')) {
            localStorage.removeItem(key);
        }
    });

    // Reinicializar
    initDataStorage();

    console.log('Todos los datos del juego han sido reiniciados.');
}

// Función para comprobar si un jugador tiene un personaje de una clase específica
function playerHasCharacterClass(characterClass) {
    const playerData = getPlayerData();

    if (!playerData || !playerData.characters || playerData.characters.length === 0) {
        console.log("No hay personajes o no hay datos de jugador");
        return false;
    }

    const hasClass = playerData.characters.some(char => char.class === characterClass);
    console.log(`Verificando clase ${characterClass}: Resultado = ${hasClass}`);

    return hasClass;
}

// Función para actualizar el oro mostrado en la interfaz
function updateGoldDisplay() {
    const playerData = getPlayerData();
    if (document.getElementById('player-gold')) {
        document.getElementById('player-gold').textContent = `Oro: ${playerData.gold}`;
    }
}