// Auth.js - Gestión de autenticación y cuentas

let currentUser = null;

// Inicialización del módulo de autenticación
function initAuth() {
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
}

// Función para iniciar sesión
function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Por favor, introduce usuario y contraseña');
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
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

// Función para registrar un nuevo usuario
function register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        alert('Por favor, introduce usuario y contraseña');
        return;
    }

    if (username.length < 3) {
        alert('El nombre de usuario debe tener al menos 3 caracteres');
        return;
    }

    if (password.length < 4) {
        alert('La contraseña debe tener al menos 4 caracteres');
        return;
    }

    // Obtener usuarios registrados
    const users = JSON.parse(localStorage.getItem('rpg_users') || '[]');

    // Comprobar si el usuario ya existe
    if (users.some(u => u.username === username)) {
        alert('Este nombre de usuario ya está en uso');
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

    alert('¡Cuenta creada con éxito! Tienes 2000 monedas de oro para comenzar.');
}

// Función para establecer la sesión actual
function setSession(username) {
    localStorage.setItem('rpg_current_session', username);
    currentUser = username;
}

// Función para comprobar si hay una sesión activa
function checkSession() {
    const session = localStorage.getItem('rpg_current_session');
    if (session) {
        currentUser = session;
        showGameScreen(session);
    }
}

// Función para cerrar la sesión actual
function clearSession() {
    localStorage.removeItem('rpg_current_session');
    currentUser = null;
}

// Función para obtener el usuario actual
function getCurrentUser() {
    return currentUser;
}

// Función para obtener los datos del jugador
function getPlayerData() {
    if (!currentUser) return null;

    const data = localStorage.getItem(`rpg_player_${currentUser}`);
    return data ? JSON.parse(data) : null;
}

// Función para guardar los datos del jugador
function savePlayerData(playerData) {
    if (!currentUser) return;

    localStorage.setItem(`rpg_player_${currentUser}`, JSON.stringify(playerData));
}