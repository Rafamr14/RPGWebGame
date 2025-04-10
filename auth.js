// Auth.js - Gestión de autenticación y cuentas

let currentUser = null;

// Inicialización del módulo de autenticación
function initAuth() {
    console.log("Inicializando sistema de autenticación...");

    // Asegurarse de que la pantalla de juego esté oculta al inicio
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');

    // Event listeners para los formularios de login y registro
    document.getElementById('login-button').addEventListener('click', login);
    document.getElementById('register-button').addEventListener('click', register);

    // Event listener para el envío de formularios con Enter
    document.getElementById('login-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });

    document.getElementById('register-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            register();
        }
    });

    // Event listener para el botón de logout
    document.getElementById('logout-button').addEventListener('click', logout);

    // Comprobar si hay una sesión activa al cargar la página
    checkSession();

    console.log("Sistema de autenticación inicializado correctamente");
}

// Función para iniciar sesión
function login() {
    console.log("Intentando iniciar sesión...");
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showErrorMessage('Por favor, introduce usuario y contraseña');
        return;
    }

    // Obtener usuarios registrados
    const users = JSON.parse(localStorage.getItem('rpg_users') || '[]');

    // Buscar el usuario
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Iniciar sesión
        currentUser = username;
        setSession(username);
        showGameScreen(username);
        console.log("Sesión iniciada con éxito para:", username);
    } else {
        showErrorMessage('Usuario o contraseña incorrectos');
    }
}

// Función para registrar un nuevo usuario
function register() {
    console.log("Intentando registrar nuevo usuario...");
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        showErrorMessage('Por favor, introduce usuario y contraseña');
        return;
    }

    if (username.length < 3) {
        showErrorMessage('El nombre de usuario debe tener al menos 3 caracteres');
        return;
    }

    if (password.length < 4) {
        showErrorMessage('La contraseña debe tener al menos 4 caracteres');
        return;
    }

    // Obtener usuarios registrados
    const users = JSON.parse(localStorage.getItem('rpg_users') || '[]');

    // Comprobar si el usuario ya existe
    if (users.some(u => u.username === username)) {
        showErrorMessage('Este nombre de usuario ya está en uso');
        return;
    }

    // Añadir el nuevo usuario
    users.push({ username, password });
    localStorage.setItem('rpg_users', JSON.stringify(users));

    // Crear datos iniciales del jugador
    const playerData = {
        username: username,
        level: 1,
        experience: 0,
        gold: 2000, // Aumentado de 500 a 2000 para poder comprar un personaje
        stamina: 100,
        maxStamina: 100,
        characters: [],
        inventory: [],
        firstTime: true
    };

    localStorage.setItem(`rpg_player_${username}`, JSON.stringify(playerData));

    // Iniciar sesión automáticamente
    currentUser = username;
    setSession(username);
    showGameScreen(username);

    // Mostrar mensaje de bienvenida
    showSuccessMessage('¡Cuenta creada con éxito! Tienes 2000 monedas de oro para comenzar.');
    console.log("Nuevo usuario registrado:", username);
}

// Función para establecer la sesión actual
function setSession(username) {
    localStorage.setItem('rpg_current_session', username);
    currentUser = username;
}

// Función para comprobar si hay una sesión activa
function checkSession() {
    console.log("Comprobando si hay una sesión activa...");
    const session = localStorage.getItem('rpg_current_session');
    if (session) {
        currentUser = session;
        showGameScreen(session);
        console.log("Sesión activa encontrada para:", session);
    } else {
        // Asegurarse de que la pantalla de autenticación esté visible
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        console.log("No hay sesión activa");
    }
}

// Función para cerrar la sesión actual
function logout() {
    console.log("Cerrando sesión...");
    clearSession();

    // Ocultar pantalla del juego y mostrar pantalla de login
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');

    // Limpiar campos de formulario
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';

    console.log("Sesión cerrada correctamente");
}

// Función para limpiar la sesión actual
function clearSession() {
    localStorage.removeItem('rpg_current_session');
    currentUser = null;
}

// Función para obtener el usuario actual
function getCurrentUser() {
    return currentUser || localStorage.getItem('rpg_current_session');
}

// Función para obtener los datos del jugador
function getPlayerData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const data = localStorage.getItem(`rpg_player_${currentUser}`);
    return data ? JSON.parse(data) : null;
}

// Función para guardar los datos del jugador
function savePlayerData(playerData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    localStorage.setItem(`rpg_player_${currentUser}`, JSON.stringify(playerData));
}

// Función para mostrar la pantalla principal del juego después del login
function showGameScreen(username) {
    console.log(`Mostrando pantalla principal para usuario: ${username}`);

    // Verificar si hay un usuario válido
    if (!username) {
        console.error("Intento de mostrar pantalla principal sin nombre de usuario");
        return;
    }

    // Ocultar pantalla de autenticación y mostrar pantalla del juego
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    // Actualizar nombre del jugador en la interfaz
    document.getElementById('player-name').textContent = username;

    // Cargar datos del jugador
    loadPlayerData();

    // Mostrar la pantalla de personajes por defecto
    showScreen('characters-screen');

    // Comprobar si es la primera vez que el jugador entra
    const playerData = getPlayerData();
    if (playerData && playerData.firstTime) {
        // Dar tiempo a que la UI se cargue
        setTimeout(() => {
            // Mostrar modal de bienvenida
            showSuccessMessage('¡Bienvenido al juego! Para comenzar, debes comprar un personaje en la tienda. Tienes 2000 monedas de oro para iniciar.');

            // Ir a la tienda
            showScreen('shop-screen');

            // Marcar que ya no es la primera vez
            playerData.firstTime = false;
            savePlayerData(playerData);

            console.log("Primera vez completada");
        }, 500);
    }
}

// Función para cargar los datos del jugador
function loadPlayerData() {
    console.log("Cargando datos del jugador...");

    const playerData = getPlayerData();

    // Verificar si hay datos de jugador
    if (!playerData) {
        console.error("No se encontraron datos de jugador");
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        return;
    }

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
        if (typeof loadCharacters === 'function') {
            loadCharacters();
        } else {
            console.log("Función loadCharacters no disponible");
        }
    } catch (e) {
        console.error("Error al cargar personajes:", e);
    }

    // Cargar inventario del jugador
    try {
        if (typeof loadInventory === 'function') {
            loadInventory();
        } else {
            console.log("Función loadInventory no disponible");
        }
    } catch (e) {
        console.error("Error al cargar inventario:", e);
    }

    console.log("Datos del jugador cargados");
}

// Función para mostrar un mensaje de error
function showErrorMessage(message) {
    if (document.getElementById('error-message') && typeof showModal === 'function') {
        document.getElementById('error-message').textContent = message;
        showModal('error-modal');
    } else {
        alert(message);
    }
}

// Función para mostrar un mensaje de éxito
function showSuccessMessage(message) {
    if (document.getElementById('success-message') && typeof showModal === 'function') {
        document.getElementById('success-message').textContent = message;
        showModal('success-modal');
    } else {
        alert(message);
    }
}

// Función mejorada para mostrar un modal
function showModal(modalId) {
    console.log("Mostrando modal:", modalId);

    // Ocultar todos los modales primero
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
    });

    // Mostrar el modal solicitado
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');

        // Asegurarse de que los botones de cierre funcionen
        modal.querySelectorAll('.modal-close, .modal-footer button').forEach(button => {
            // Remover event listeners anteriores para evitar duplicados
            button.removeEventListener('click', closeAllModals);
            // Añadir nuevo event listener
            button.addEventListener('click', closeAllModals);
        });

        // También cerrar al hacer clic fuera del modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    }
}

// Función para cerrar todos los modales
function closeAllModals() {
    console.log("Cerrando todos los modales");
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// Asegurarse de que los modales se inicialicen correctamente
function initModals() {
    // Añadir event listeners a todos los botones de cierre de modal
    document.querySelectorAll('.modal-close, .modal-footer button').forEach(button => {
        button.removeEventListener('click', closeAllModals); // Evitar duplicados
        button.addEventListener('click', closeAllModals);
    });

    // También cerrar modales al hacer clic fuera de ellos
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });

    console.log("Modales inicializados correctamente");
}

// Llamar a esta función al inicio
document.addEventListener('DOMContentLoaded', function() {
    initModals();
});

// Función para mostrar una pantalla específica del juego
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
    try {
        const event = new CustomEvent('screenShown', { detail: { screenId: screenId } });
        screenElement.dispatchEvent(event);
    } catch (e) {
        console.error("Error al disparar evento screenShown:", e);
    }
}

// Inicializar el sistema de autenticación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado, inicializando autenticación...");
    initAuth();
});

// Actualizar la visualización del oro
function updateGoldDisplay() {
    const playerData = getPlayerData();
    if (document.getElementById('player-gold')) {
        document.getElementById('player-gold').textContent = `Oro: ${playerData.gold}`;
        console.log("Oro actualizado:", playerData.gold);
    }
}